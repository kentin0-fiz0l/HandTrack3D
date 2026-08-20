import * as THREE from 'three';

/**
 * Check if a point is within grab range of an object
 */
export function isInGrabRange(
  cursorPosition: THREE.Vector3,
  objectPosition: THREE.Vector3,
  grabRange: number = 1.5
): boolean {
  const distance = cursorPosition.distanceTo(objectPosition);
  return distance < grabRange;
}

/**
 * Calculate offset from hand to object center
 */
export function calculateGrabOffset(
  cursorPosition: THREE.Vector3,
  objectPosition: THREE.Vector3
): THREE.Vector3 {
  return objectPosition.clone().sub(cursorPosition);
}
