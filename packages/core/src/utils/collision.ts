import type { Vector3D } from './mapping';

/**
 * Calculate Euclidean distance between two 3D points
 * @param a - First point
 * @param b - Second point
 * @returns Distance between points
 */
export function distance3D(a: Vector3D, b: Vector3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Check if a point is within grab range of an object
 * @param cursorPosition - Position of the cursor/hand
 * @param objectPosition - Position of the target object
 * @param grabRange - Maximum distance for grabbing (default: 1.5)
 * @returns True if within grab range
 */
export function isInGrabRange(
  cursorPosition: Vector3D,
  objectPosition: Vector3D,
  grabRange: number = 1.5
): boolean {
  const dist = distance3D(cursorPosition, objectPosition);
  return dist < grabRange;
}

/**
 * Calculate offset from hand to object center
 * Used to maintain relative position when grabbing an object
 * @param cursorPosition - Position of the cursor/hand
 * @param objectPosition - Position of the target object
 * @returns Offset vector from cursor to object
 */
export function calculateGrabOffset(
  cursorPosition: Vector3D,
  objectPosition: Vector3D
): Vector3D {
  return {
    x: objectPosition.x - cursorPosition.x,
    y: objectPosition.y - cursorPosition.y,
    z: objectPosition.z - cursorPosition.z,
  };
}

/**
 * Check if a sphere intersects with another sphere
 * @param pos1 - Position of first sphere
 * @param radius1 - Radius of first sphere
 * @param pos2 - Position of second sphere
 * @param radius2 - Radius of second sphere
 * @returns True if spheres intersect
 */
export function sphereIntersectsSphere(
  pos1: Vector3D,
  radius1: number,
  pos2: Vector3D,
  radius2: number
): boolean {
  const dist = distance3D(pos1, pos2);
  return dist < (radius1 + radius2);
}

/**
 * Check if a point is inside a sphere
 * @param point - Point to check
 * @param sphereCenter - Center of sphere
 * @param sphereRadius - Radius of sphere
 * @returns True if point is inside sphere
 */
export function pointInSphere(
  point: Vector3D,
  sphereCenter: Vector3D,
  sphereRadius: number
): boolean {
  const dist = distance3D(point, sphereCenter);
  return dist < sphereRadius;
}

/**
 * Check if a point is inside a box (AABB - Axis-Aligned Bounding Box)
 * @param point - Point to check
 * @param boxMin - Minimum corner of box
 * @param boxMax - Maximum corner of box
 * @returns True if point is inside box
 */
export function pointInBox(
  point: Vector3D,
  boxMin: Vector3D,
  boxMax: Vector3D
): boolean {
  return (
    point.x >= boxMin.x && point.x <= boxMax.x &&
    point.y >= boxMin.y && point.y <= boxMax.y &&
    point.z >= boxMin.z && point.z <= boxMax.z
  );
}
