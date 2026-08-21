import type { HandLandmark } from '../types/hand';

/**
 * 3D vector representing position in space
 */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Maps 2D hand landmark coordinates to 3D world space
 * First-person perspective: reaching into the virtual environment
 *
 * @param landmark - Hand landmark in normalized coordinates (0-1)
 * @returns 3D position vector
 */
export function mapHandTo3D(landmark: HandLandmark): Vector3D {
  // First-person mapping: hand position directly maps to 3D space in front of viewer
  // X: left-right movement (flipped for superimposed view)
  const x = (0.5 - landmark.x) * 6; // Flip so left hand is on left, right hand on right

  // Y: up-down movement (MediaPipe 0=top, 1=bottom)
  // Offset to be at comfortable reaching height (around chest to head level)
  const y = (1 - landmark.y) * 2 + 0.5; // Map 0-1 to 2.5 to 0.5 (top to bottom)

  // Z: depth - hand toward you brings object closer to camera (larger)
  // MediaPipe z is negative when hand closer to camera
  const z = -3 - (landmark.z * 5); // Hand closer → less negative z → larger object

  return { x, y, z };
}

/**
 * Get index finger tip landmark (landmark 8)
 * @param landmarks - Array of hand landmarks
 * @returns Index finger tip landmark
 */
export function getIndexFingerTip(landmarks: HandLandmark[]): HandLandmark {
  return landmarks[8];
}

/**
 * Get thumb tip landmark (landmark 4)
 * @param landmarks - Array of hand landmarks
 * @returns Thumb tip landmark
 */
export function getThumbTip(landmarks: HandLandmark[]): HandLandmark {
  return landmarks[4];
}

/**
 * Get wrist landmark (landmark 0)
 * @param landmarks - Array of hand landmarks
 * @returns Wrist landmark
 */
export function getWrist(landmarks: HandLandmark[]): HandLandmark {
  return landmarks[0];
}

/**
 * Get middle finger tip landmark (landmark 12)
 * @param landmarks - Array of hand landmarks
 * @returns Middle finger tip landmark
 */
export function getMiddleFingerTip(landmarks: HandLandmark[]): HandLandmark {
  return landmarks[12];
}

/**
 * Get ring finger tip landmark (landmark 16)
 * @param landmarks - Array of hand landmarks
 * @returns Ring finger tip landmark
 */
export function getRingFingerTip(landmarks: HandLandmark[]): HandLandmark {
  return landmarks[16];
}

/**
 * Get pinky tip landmark (landmark 20)
 * @param landmarks - Array of hand landmarks
 * @returns Pinky tip landmark
 */
export function getPinkyTip(landmarks: HandLandmark[]): HandLandmark {
  return landmarks[20];
}

/**
 * Calculate the centroid (center point) of hand landmarks
 * @param landmarks - Array of hand landmarks
 * @returns Centroid landmark
 */
export function getHandCentroid(landmarks: HandLandmark[]): HandLandmark {
  const sum = landmarks.reduce(
    (acc, lm) => ({
      x: acc.x + lm.x,
      y: acc.y + lm.y,
      z: acc.z + lm.z,
    }),
    { x: 0, y: 0, z: 0 }
  );

  return {
    x: sum.x / landmarks.length,
    y: sum.y / landmarks.length,
    z: sum.z / landmarks.length,
  };
}
