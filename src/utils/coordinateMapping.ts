import * as THREE from 'three';
import type { HandLandmark } from '@/types/hand.types';
import { usePoseTrackingStore, PoseLandmarks } from '@/stores/poseTrackingStore';
import {
  calculateAdaptiveWeights,
  calculateAdaptiveDepth,
  isHandFullyVisible,
  isNearBoundary,
  type DepthConfidenceFactors,
} from './adaptiveDepth';
import {
  applyAdaptiveSmoothing,
  clearSmoothingState,
  clearAllSmoothingState,
  DEFAULT_SMOOTHING_CONFIG,
} from './adaptiveSmoothing';

// Smoothing state for Z-axis (per hand)
const zSmoothingCache = new Map<string, number>();
const SMOOTHING_FACTOR = 0.3; // Lower = smoother, higher = more responsive

// Calibration constants for hand size-based depth
// Based on typical hand size appearing ~0.15 at 50cm, ~0.08 at 100cm
const HAND_SIZE_CALIBRATION = 0.012;
const DEPTH_SCALE = 6;

// Arm extension calibration
const ARM_EXTENSION_WEIGHT = 0.5; // How much arm extension affects depth

/**
 * Calculate hand size in normalized screen space
 * Uses wrist to middle finger tip distance as size metric
 */
function calculateHandSize(landmarks: HandLandmark[]): number {
  const wrist = landmarks[0]; // Wrist
  const middleTip = landmarks[12]; // Middle finger tip

  // Calculate 2D distance (ignoring Z for more stable measurement)
  const dx = middleTip.x - wrist.x;
  const dy = middleTip.y - wrist.y;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the angle at the elbow joint
 * Returns angle in degrees (0° = fully extended, 180° = fully bent)
 */
function calculateElbowAngle(
  shoulder: { x: number; y: number; z?: number },
  elbow: { x: number; y: number; z?: number },
  wrist: { x: number; y: number; z?: number }
): number {
  // Create vectors from elbow to shoulder and elbow to wrist
  const upperArm = {
    x: shoulder.x - elbow.x,
    y: shoulder.y - elbow.y,
    z: (shoulder.z || 0) - (elbow.z || 0),
  };

  const forearm = {
    x: wrist.x - elbow.x,
    y: wrist.y - elbow.y,
    z: (wrist.z || 0) - (elbow.z || 0),
  };

  // Calculate dot product
  const dotProduct = upperArm.x * forearm.x + upperArm.y * forearm.y + upperArm.z * forearm.z;

  // Calculate magnitudes
  const upperArmMag = Math.sqrt(
    upperArm.x * upperArm.x + upperArm.y * upperArm.y + upperArm.z * upperArm.z
  );
  const forearmMag = Math.sqrt(
    forearm.x * forearm.x + forearm.y * forearm.y + forearm.z * forearm.z
  );

  // Avoid division by zero
  if (upperArmMag < 0.01 || forearmMag < 0.01) return 90; // Default to neutral

  // Calculate angle using dot product formula: cos(θ) = (a · b) / (|a| × |b|)
  const cosAngle = dotProduct / (upperArmMag * forearmMag);

  // Clamp to valid range for acos
  const clampedCos = Math.max(-1, Math.min(1, cosAngle));

  // Convert to degrees
  const angleRadians = Math.acos(clampedCos);
  const angleDegrees = (angleRadians * 180) / Math.PI;

  return angleDegrees;
}

/**
 * Calculate arm extension factor from pose landmarks (IMPROVED with angle detection)
 *
 * Uses hybrid approach combining:
 * 1. Distance ratio (shoulder-wrist vs bent arm length)
 * 2. Elbow angle (straight arm = extended, bent arm = not extended)
 *
 * Returns a value from 0 (arm bent/close to body) to 1 (arm fully extended forward)
 * Returns 0.5 (neutral) if pose tracking is unavailable
 */
function calculateArmExtension(handX: number, handedness: 'Left' | 'Right'): number {
  try {
    const pose = usePoseTrackingStore.getState().pose;
    if (!pose || !pose.landmarks || pose.landmarks.length === 0) {
      return 0.5; // Default to neutral if no pose data
    }

    const landmarks = pose.landmarks;
    const isLeft = handedness === 'Left';

    // Get relevant landmarks for this hand
    const shoulder = landmarks[isLeft ? PoseLandmarks.LEFT_SHOULDER : PoseLandmarks.RIGHT_SHOULDER];
    const elbow = landmarks[isLeft ? PoseLandmarks.LEFT_ELBOW : PoseLandmarks.RIGHT_ELBOW];
    const wrist = landmarks[isLeft ? PoseLandmarks.LEFT_WRIST : PoseLandmarks.RIGHT_WRIST];

    // Check if landmarks are visible enough
    if (!shoulder || !elbow || !wrist ||
        (shoulder.visibility && shoulder.visibility < 0.5) ||
        (elbow.visibility && elbow.visibility < 0.5) ||
        (wrist.visibility && wrist.visibility < 0.5)) {
      return 0.5; // Default if body not visible
    }

    // METHOD 1: Distance-based extension (original approach)
    const shoulderToWrist = Math.sqrt(
      Math.pow(wrist.x - shoulder.x, 2) +
      Math.pow(wrist.y - shoulder.y, 2) +
      Math.pow((wrist.z || 0) - (shoulder.z || 0), 2)
    );

    const shoulderToElbow = Math.sqrt(
      Math.pow(elbow.x - shoulder.x, 2) +
      Math.pow(elbow.y - shoulder.y, 2) +
      Math.pow((elbow.z || 0) - (shoulder.z || 0), 2)
    );

    const elbowToWrist = Math.sqrt(
      Math.pow(wrist.x - elbow.x, 2) +
      Math.pow(wrist.y - elbow.y, 2) +
      Math.pow((wrist.z || 0) - (elbow.z || 0), 2)
    );

    const bentArmLength = shoulderToElbow + elbowToWrist;
    if (bentArmLength < 0.01) return 0.5; // Avoid division by zero

    const distanceRatio = shoulderToWrist / bentArmLength;
    // Map to 0-1 range (0.7 = bent, 0.95+ = extended)
    const distanceExtension = Math.max(0, Math.min(1, (distanceRatio - 0.7) / 0.25));

    // METHOD 2: Angle-based extension (NEW - more accurate)
    const elbowAngle = calculateElbowAngle(shoulder, elbow, wrist);

    // Convert angle to extension factor
    // Fully bent arm: ~40-60°, Fully extended: ~160-180°
    // We want: 40° → 0 (bent), 180° → 1 (extended)
    const angleExtension = Math.max(0, Math.min(1, (elbowAngle - 60) / 120));

    // HYBRID: Combine both methods with weighted average
    // Distance ratio: 40% weight (good for overall position)
    // Elbow angle: 60% weight (more reliable indicator of extension)
    const combinedExtension = 0.4 * distanceExtension + 0.6 * angleExtension;

    return combinedExtension;
  } catch (error) {
    // If pose tracking fails, gracefully fall back to neutral
    console.warn('Arm extension calculation error:', error);
    return 0.5;
  }
}

/**
 * Estimate depth based on hand size
 * Larger hand = closer to camera, smaller hand = farther away
 */
function estimateDepthFromHandSize(handSize: number): number {
  // Avoid division by zero
  if (handSize < 0.01) return 3.0;

  // Inverse relationship: larger size = closer = smaller distance value
  return HAND_SIZE_CALIBRATION / handSize;
}

/**
 * Maps 2D hand landmark coordinates to 3D world space
 * First-person perspective: reaching into the virtual environment
 *
 * Now includes hand size-based depth estimation AND arm extension from pose tracking
 */
export function mapHandTo3D(
  landmark: HandLandmark,
  allLandmarks: HandLandmark[],
  handId: string,
  handedness: 'Left' | 'Right',
  _camera: THREE.Camera,
  _canvasWidth: number,
  _canvasHeight: number
): THREE.Vector3 {
  // First-person mapping: hand position directly maps to 3D space in front of viewer
  // X: left-right movement (flipped for superimposed view)
  const x = (0.5 - landmark.x) * 6; // Flip so left hand is on left, right hand on right

  // Y: up-down movement (MediaPipe 0=top, 1=bottom)
  // Offset to be at comfortable reaching height (around chest to head level)
  const y = (1 - landmark.y) * 2 + 0.5; // Map 0-1 to 2.5 to 0.5 (top to bottom)

  // Z: depth - now using hybrid approach with arm extension
  // 1. MediaPipe's relative Z (20% weight)
  const mediaPipeZ = -3 - (landmark.z * 3);

  // 2. Hand size-based depth estimation (50% weight)
  // Hand closer to camera (larger hand size) = reach deeper into screen (more negative Z)
  // Hand farther from camera (smaller hand size) = shallower in screen (less negative Z)
  const handSize = calculateHandSize(allLandmarks);
  const handSizeZ = -handSize * 30 - 3; // Direct relationship: larger hand = more negative Z

  // 3. Arm extension from pose tracking (default 30% weight, adaptive)
  // Extended arm = hand reaches farther forward (more negative Z)
  // Bent arm = hand stays closer to body (less negative Z)
  const armExtension = calculateArmExtension(landmark.x, handedness);
  const armExtensionZ = -armExtension * 2 - 3; // Extended = -5, Bent = -3

  // Calculate adaptive weights based on confidence factors
  const pose = usePoseTrackingStore.getState().pose;
  const confidenceFactors: DepthConfidenceFactors = {
    mediaPipeConfidence: landmark.visibility || 0.8, // Use landmark visibility or default
    poseConfidence: pose && pose.landmarks.length > 0
      ? Math.min(...pose.landmarks.map(lm => lm.visibility || 0))
      : null,
    handFullyVisible: isHandFullyVisible(allLandmarks, 0.5),
    nearBoundary: isNearBoundary(allLandmarks, 0.1),
  };

  const weights = calculateAdaptiveWeights(confidenceFactors);

  // Combine all methods with adaptive weighted average
  const rawZ = calculateAdaptiveDepth(mediaPipeZ, handSizeZ, armExtensionZ, weights);

  // Apply adaptive smoothing to reduce jitter while preserving responsiveness
  // Uses motion-aware filtering: heavy smoothing for small movements, light for large
  const smoothedZ = applyAdaptiveSmoothing(handId, rawZ, DEFAULT_SMOOTHING_CONFIG);

  return new THREE.Vector3(x, y, smoothedZ);
}

/**
 * Clear smoothing cache for a specific hand (call when hand disappears)
 */
export function clearHandSmoothingCache(handId: string): void {
  clearSmoothingState(handId);
  // Keep old cache clear for backwards compatibility
  zSmoothingCache.delete(handId);
}

/**
 * Clear all smoothing caches
 */
export function clearAllSmoothingCaches(): void {
  clearAllSmoothingState();
  // Keep old cache clear for backwards compatibility
  zSmoothingCache.clear();
}

/**
 * Get index finger tip landmark (landmark 8)
 */
export function getIndexFingerTip(landmarks: HandLandmark[]): HandLandmark {
  return landmarks[8];
}

/**
 * Get thumb tip landmark (landmark 4)
 */
export function getThumbTip(landmarks: HandLandmark[]): HandLandmark {
  return landmarks[4];
}

/**
 * Get wrist landmark (landmark 0)
 */
export function getWrist(landmarks: HandLandmark[]): HandLandmark {
  return landmarks[0];
}
