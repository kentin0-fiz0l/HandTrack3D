import * as THREE from 'three';
import type { HandLandmark } from '@/types/hand.types';

/**
 * Maps 2D hand landmark coordinates to 3D world space
 * First-person perspective: reaching into the virtual environment
 */
export function mapHandTo3D(
  landmark: HandLandmark,
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

  // Z: depth - hand toward you brings object closer to camera (larger)
  // MediaPipe z is negative when hand closer to camera
  const z = -3 - (landmark.z * 5); // Hand closer → less negative z → larger object

  return new THREE.Vector3(x, y, z);
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
