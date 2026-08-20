import * as THREE from 'three';
import type { HandLandmark } from '@/types/hand.types';

/**
 * Maps 2D hand landmark coordinates to 3D world space
 * Uses the camera and a virtual plane to project 2D points into 3D
 */
export function mapHandTo3D(
  landmark: HandLandmark,
  camera: THREE.Camera,
  _canvasWidth: number,
  _canvasHeight: number
): THREE.Vector3 {
  // Convert normalized coordinates (0-1) to NDC (-1 to 1)
  const x = -((landmark.x * 2) - 1); // Flip X axis for mirror effect
  const y = -(landmark.y * 2) + 1; // Flip Y axis
  
  // Use z-coordinate from MediaPipe for depth
  // MediaPipe z is relative to wrist, typically -0.1 to 0.1
  // Map to a reasonable depth range in 3D space
  const depth = 5 + (landmark.z * -10); // 0 to 10 units from camera

  // Create vector in NDC space
  const vector = new THREE.Vector3(x, y, 0.5);
  
  // Unproject to world space
  vector.unproject(camera);
  
  // Get direction from camera to point
  const direction = vector.sub(camera.position).normalize();
  
  // Project along direction to desired depth
  const position = camera.position.clone().add(direction.multiplyScalar(depth));
  
  return position;
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
