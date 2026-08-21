import * as THREE from 'three';
import { getSettings } from '@/stores/settingsStore';

/**
 * Check if a point is within grab range of an object
 */
export function isInGrabRange(
  cursorPosition: THREE.Vector3,
  objectPosition: THREE.Vector3,
  grabRange?: number
): boolean {
  const settings = getSettings();
  const effectiveGrabRange = grabRange ?? settings.grabRange;
  const distance = cursorPosition.distanceTo(objectPosition);
  return distance < effectiveGrabRange;
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
