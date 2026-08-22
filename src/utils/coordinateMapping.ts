import * as THREE from 'three';
import type { HandLandmark } from '@/types/hand.types';
import { usePoseTrackingStore, PoseLandmarks } from '@/stores/poseTrackingStore';

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
 * Calculate arm extension factor from pose landmarks
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

    // Calculate arm extension as the ratio of shoulder-wrist distance to shoulder-elbow + elbow-wrist
    // When arm is bent, this ratio is closer to 1. When extended forward, it's larger.
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

    // Normalize: 1.0 = arm bent (close to body), < 1.0 = arm extended forward
    // We want 0 = bent, 1 = extended, so we invert and clamp
    const extensionRatio = shoulderToWrist / bentArmLength;

    // Map to 0-1 range where 1 is fully extended
    // Typical bent arm: ratio ~0.7, extended arm: ratio ~0.95+
    return Math.max(0, Math.min(1, (extensionRatio - 0.7) / 0.25));
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

  // 3. Arm extension from pose tracking (30% weight)
  // Extended arm = hand reaches farther forward (more negative Z)
  // Bent arm = hand stays closer to body (less negative Z)
  const armExtension = calculateArmExtension(landmark.x, handedness);
  const armExtensionZ = -armExtension * 2 - 3; // Extended = -5, Bent = -3

  // Combine all methods with weighted average
  const rawZ = 0.2 * mediaPipeZ + 0.5 * handSizeZ + 0.3 * armExtensionZ;

  // Apply exponential moving average smoothing to reduce jitter
  const previousZ = zSmoothingCache.get(handId) ?? rawZ;
  const smoothedZ = previousZ + SMOOTHING_FACTOR * (rawZ - previousZ);
  zSmoothingCache.set(handId, smoothedZ);

  return new THREE.Vector3(x, y, smoothedZ);
}

/**
 * Clear smoothing cache for a specific hand (call when hand disappears)
 */
export function clearHandSmoothingCache(handId: string): void {
  zSmoothingCache.delete(handId);
}

/**
 * Clear all smoothing caches
 */
export function clearAllSmoothingCaches(): void {
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
