/**
 * Coordinate mapping utilities for Three.js integration
 *
 * These utilities help convert between different coordinate spaces:
 * - Hand landmark coordinates (normalized 0-1)
 * - Three.js world space
 * - Screen/viewport space
 */

import * as THREE from 'three';
import { mapHandTo3D, type Vector3D } from '@handtrack3d/core';
import type { HandLandmark } from '@handtrack3d/core';

/**
 * Convert hand landmark to Three.js Vector3
 */
export function landmarkToVector3(landmark: HandLandmark): THREE.Vector3 {
  const mapped = mapHandTo3D(landmark);
  return new THREE.Vector3(mapped.x, mapped.y, mapped.z);
}

/**
 * Convert array of landmarks to Three.js Vector3 array
 */
export function landmarksToVector3Array(landmarks: HandLandmark[]): THREE.Vector3[] {
  return landmarks.map(landmarkToVector3);
}

/**
 * Project 3D position to screen coordinates
 *
 * @param position - 3D position in world space
 * @param camera - Camera to project through
 * @param viewportWidth - Viewport width in pixels
 * @param viewportHeight - Viewport height in pixels
 * @returns Screen coordinates {x, y} in pixels
 */
export function projectToScreen(
  position: THREE.Vector3,
  camera: THREE.Camera,
  viewportWidth: number,
  viewportHeight: number
): { x: number; y: number } {
  const projected = position.clone().project(camera);

  return {
    x: (projected.x * 0.5 + 0.5) * viewportWidth,
    y: (-(projected.y * 0.5) + 0.5) * viewportHeight,
  };
}

/**
 * Unproject screen coordinates to 3D ray
 *
 * @param x - Screen X coordinate in pixels
 * @param y - Screen Y coordinate in pixels
 * @param viewportWidth - Viewport width in pixels
 * @param viewportHeight - Viewport height in pixels
 * @param camera - Camera to unproject through
 * @returns Ray from camera through screen point
 */
export function screenToRay(
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number,
  camera: THREE.Camera
): THREE.Ray {
  // Normalize screen coordinates to -1 to 1
  const mouse = new THREE.Vector3(
    (x / viewportWidth) * 2 - 1,
    -(y / viewportHeight) * 2 + 1,
    0.5
  );

  mouse.unproject(camera);

  const direction = mouse.sub(camera.position).normalize();
  return new THREE.Ray(camera.position.clone(), direction);
}

/**
 * Get world position at a specific depth from screen coordinates
 *
 * @param x - Screen X coordinate in pixels
 * @param y - Screen Y coordinate in pixels
 * @param depth - Z depth in world space
 * @param viewportWidth - Viewport width in pixels
 * @param viewportHeight - Viewport height in pixels
 * @param camera - Camera to unproject through
 * @returns 3D position in world space
 */
export function screenToWorld(
  x: number,
  y: number,
  depth: number,
  viewportWidth: number,
  viewportHeight: number,
  camera: THREE.Camera
): THREE.Vector3 {
  const ray = screenToRay(x, y, viewportWidth, viewportHeight, camera);
  return ray.at(depth, new THREE.Vector3());
}

/**
 * Calculate bounding box for array of landmarks
 */
export function getLandmarksBoundingBox(landmarks: HandLandmark[]): THREE.Box3 {
  const vectors = landmarksToVector3Array(landmarks);
  const box = new THREE.Box3();
  box.setFromPoints(vectors);
  return box;
}

/**
 * Calculate center point of landmarks
 */
export function getLandmarksCenter(landmarks: HandLandmark[]): THREE.Vector3 {
  const box = getLandmarksBoundingBox(landmarks);
  return box.getCenter(new THREE.Vector3());
}

/**
 * Map custom coordinate space to Three.js
 *
 * Allows for custom mapping functions beyond the default mapHandTo3D.
 *
 * @param landmark - Hand landmark
 * @param xScale - X axis scale factor
 * @param yScale - Y axis scale factor
 * @param zScale - Z axis scale factor
 * @param xOffset - X axis offset
 * @param yOffset - Y axis offset
 * @param zOffset - Z axis offset
 * @param flipX - Flip X axis
 * @param flipY - Flip Y axis
 * @param flipZ - Flip Z axis
 * @returns Three.js Vector3
 */
export function customMapping(
  landmark: HandLandmark,
  {
    xScale = 6,
    yScale = 2,
    zScale = 5,
    xOffset = 0,
    yOffset = 0.5,
    zOffset = -3,
    flipX = true,
    flipY = true,
    flipZ = true,
  }: {
    xScale?: number;
    yScale?: number;
    zScale?: number;
    xOffset?: number;
    yOffset?: number;
    zOffset?: number;
    flipX?: boolean;
    flipY?: boolean;
    flipZ?: boolean;
  } = {}
): THREE.Vector3 {
  const x = (flipX ? 0.5 - landmark.x : landmark.x - 0.5) * xScale + xOffset;
  const y = (flipY ? 1 - landmark.y : landmark.y) * yScale + yOffset;
  const z = zOffset - (flipZ ? landmark.z : -landmark.z) * zScale;

  return new THREE.Vector3(x, y, z);
}

/**
 * Linear interpolation between two Vector3D positions
 */
export function lerpVector3D(a: Vector3D, b: Vector3D, t: number): Vector3D {
  return {
    x: THREE.MathUtils.lerp(a.x, b.x, t),
    y: THREE.MathUtils.lerp(a.y, b.y, t),
    z: THREE.MathUtils.lerp(a.z, b.z, t),
  };
}

/**
 * Smooth damp (spring-like interpolation) for Vector3D
 */
export function smoothDampVector3D(
  current: Vector3D,
  target: Vector3D,
  velocity: Vector3D,
  smoothTime: number,
  deltaTime: number
): { position: Vector3D; velocity: Vector3D } {
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  const changeX = current.x - target.x;
  const changeY = current.y - target.y;
  const changeZ = current.z - target.z;

  const tempX = (velocity.x + omega * changeX) * deltaTime;
  const tempY = (velocity.y + omega * changeY) * deltaTime;
  const tempZ = (velocity.z + omega * changeZ) * deltaTime;

  return {
    position: {
      x: target.x + (changeX + tempX) * exp,
      y: target.y + (changeY + tempY) * exp,
      z: target.z + (changeZ + tempZ) * exp,
    },
    velocity: {
      x: (velocity.x - omega * tempX) * exp,
      y: (velocity.y - omega * tempY) * exp,
      z: (velocity.z - omega * tempZ) * exp,
    },
  };
}
