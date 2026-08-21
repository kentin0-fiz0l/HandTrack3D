import type { HandLandmark } from '@/types/hand.types';
import type { GestureType } from '@/types/gesture.types';
import { getSettings } from '@/stores/settingsStore';

/**
 * Calculate distance between two landmarks
 */
function distance(a: HandLandmark, b: HandLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate angle at joint (in degrees)
 */
function calculateAngle(
  a: HandLandmark,
  b: HandLandmark,
  c: HandLandmark
): number {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y + ba.z * ba.z);
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y + bc.z * bc.z);

  const cosAngle = dot / (magBA * magBC);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

  return (angle * 180) / Math.PI;
}

/**
 * Check if finger is extended based on joint angles
 */
function isFingerExtended(
  landmarks: HandLandmark[],
  fingerIndices: number[]
): boolean {
  // Check angles at each joint
  const angles = [];
  for (let i = 0; i < fingerIndices.length - 2; i++) {
    const angle = calculateAngle(
      landmarks[fingerIndices[i]],
      landmarks[fingerIndices[i + 1]],
      landmarks[fingerIndices[i + 2]]
    );
    angles.push(angle);
  }

  // Finger is extended if all joint angles are > fingerExtensionAngle
  const settings = getSettings();
  return angles.every((angle) => angle > settings.fingerExtensionAngle);
}

/**
 * Detect pinch gesture (thumb and index finger close together)
 */
export function detectPinch(landmarks: HandLandmark[]): boolean {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const dist = distance(thumbTip, indexTip);

  // Pinch threshold: very close together
  const settings = getSettings();
  return dist < settings.pinchThreshold;
}

/**
 * Detect open hand gesture (all fingers extended)
 */
export function detectOpenHand(landmarks: HandLandmark[]): boolean {
  // Check each finger
  const thumb = isFingerExtended(landmarks, [1, 2, 3, 4]);
  const index = isFingerExtended(landmarks, [5, 6, 7, 8]);
  const middle = isFingerExtended(landmarks, [9, 10, 11, 12]);
  const ring = isFingerExtended(landmarks, [13, 14, 15, 16]);
  const pinky = isFingerExtended(landmarks, [17, 18, 19, 20]);

  // All fingers must be extended
  return thumb && index && middle && ring && pinky;
}

/**
 * Detect fist gesture (all fingers curled)
 */
export function detectFist(landmarks: HandLandmark[]): boolean {
  // Check if all fingertips are close to palm
  const wrist = landmarks[0];
  const fingertips = [
    landmarks[4],  // thumb
    landmarks[8],  // index
    landmarks[12], // middle
    landmarks[16], // ring
    landmarks[20], // pinky
  ];

  // All fingertips should be within a small radius of wrist
  const settings = getSettings();
  const allCurled = fingertips.every((tip) => {
    const dist = distance(tip, wrist);
    return dist < settings.fistCurlThreshold; // Close to wrist = curled
  });

  return allCurled;
}

/**
 * Detect gesture from hand landmarks
 */
export function detectGesture(landmarks: HandLandmark[]): GestureType {
  // Check gestures in priority order
  if (detectPinch(landmarks)) {
    return 'pinch';
  }
  if (detectFist(landmarks)) {
    return 'fist';
  }
  if (detectOpenHand(landmarks)) {
    return 'open';
  }
  return 'none';
}
