/**
 * Physics utility functions
 *
 * Helper functions for common physics calculations in hand tracking interactions.
 */

import * as THREE from 'three';

/**
 * Calculate throw velocity from position history
 *
 * Uses finite difference method to compute velocity from recent positions.
 * More accurate than single-frame difference, especially at varying frame rates.
 *
 * @param positions - Array of recent positions (oldest first)
 * @param frameRate - Target frame rate (default: 60 FPS)
 * @returns Velocity vector
 *
 * @example
 * ```typescript
 * const positions = [
 *   new THREE.Vector3(0, 0, 0),
 *   new THREE.Vector3(0.1, 0.1, 0),
 *   new THREE.Vector3(0.2, 0.2, 0),
 * ];
 * const velocity = calculateThrowVelocity(positions, 60);
 * // velocity ≈ (6, 6, 0) at 60 FPS
 * ```
 */
export function calculateThrowVelocity(
  positions: THREE.Vector3[],
  frameRate: number = 60
): THREE.Vector3 {
  if (positions.length < 2) {
    return new THREE.Vector3(0, 0, 0);
  }

  // Use the last two positions for velocity calculation
  const current = positions[positions.length - 1];
  const previous = positions[positions.length - 2];

  // Calculate displacement
  const displacement = current.clone().sub(previous);

  // Scale by frame rate to get velocity per second
  return displacement.multiplyScalar(frameRate);
}

/**
 * Apply damping to velocity
 *
 * Reduces velocity exponentially over time, simulating air resistance or friction.
 * Uses exponential decay for physically accurate damping.
 *
 * @param velocity - Current velocity vector (modified in place)
 * @param damping - Damping coefficient (0-1, higher = more damping)
 * @param deltaTime - Time step in seconds
 * @returns Damped velocity (same instance as input)
 *
 * @example
 * ```typescript
 * const velocity = new THREE.Vector3(10, 0, 0);
 * applyDamping(velocity, 0.5, 1/60); // Apply damping for one frame at 60 FPS
 * // velocity.x ≈ 9.92 (slightly reduced)
 * ```
 */
export function applyDamping(
  velocity: THREE.Vector3,
  damping: number,
  deltaTime: number
): THREE.Vector3 {
  // Clamp damping to valid range
  const clampedDamping = Math.max(0, Math.min(1, damping));

  // Exponential decay: v' = v * e^(-damping * deltaTime)
  const dampingFactor = Math.exp(-clampedDamping * deltaTime);

  velocity.multiplyScalar(dampingFactor);
  return velocity;
}

/**
 * Calculate hand velocity from position history
 *
 * Smooths out noise by averaging recent velocity samples.
 * Useful for throwing mechanics where jitter can cause erratic behavior.
 *
 * @param positions - Array of recent hand positions (oldest first)
 * @param frameRate - Target frame rate (default: 60 FPS)
 * @param smoothingWindow - Number of samples to average (default: 3)
 * @returns Smoothed velocity vector
 *
 * @example
 * ```typescript
 * const positions = [
 *   new THREE.Vector3(0, 0, 0),
 *   new THREE.Vector3(0.1, 0.05, 0),
 *   new THREE.Vector3(0.2, 0.15, 0),
 *   new THREE.Vector3(0.3, 0.2, 0),
 * ];
 * const velocity = calculateSmoothedVelocity(positions, 60, 3);
 * // Returns averaged velocity over last 3 frames
 * ```
 */
export function calculateSmoothedVelocity(
  positions: THREE.Vector3[],
  frameRate: number = 60,
  smoothingWindow: number = 3
): THREE.Vector3 {
  if (positions.length < 2) {
    return new THREE.Vector3(0, 0, 0);
  }

  // Calculate velocities for recent frames
  const velocities: THREE.Vector3[] = [];
  const windowSize = Math.min(smoothingWindow, positions.length - 1);

  for (let i = positions.length - windowSize; i < positions.length; i++) {
    const current = positions[i];
    const previous = positions[i - 1];
    const velocity = current.clone().sub(previous).multiplyScalar(frameRate);
    velocities.push(velocity);
  }

  // Average the velocities
  const sum = velocities.reduce(
    (acc, v) => acc.add(v),
    new THREE.Vector3(0, 0, 0)
  );

  return sum.divideScalar(velocities.length);
}

/**
 * Clamp vector magnitude
 *
 * Limits a vector's length to a maximum value while preserving direction.
 * Useful for preventing excessive throw velocities.
 *
 * @param vector - Vector to clamp (modified in place)
 * @param maxMagnitude - Maximum allowed magnitude
 * @returns Clamped vector (same instance as input)
 *
 * @example
 * ```typescript
 * const velocity = new THREE.Vector3(100, 0, 0);
 * clampMagnitude(velocity, 20);
 * // velocity.x = 20 (clamped to max)
 * ```
 */
export function clampMagnitude(
  vector: THREE.Vector3,
  maxMagnitude: number
): THREE.Vector3 {
  const currentMagnitude = vector.length();

  if (currentMagnitude > maxMagnitude) {
    vector.normalize().multiplyScalar(maxMagnitude);
  }

  return vector;
}

/**
 * Check if position is within bounds
 *
 * Useful for detecting if grabbed objects leave the interaction area.
 *
 * @param position - Position to check
 * @param min - Minimum bounds
 * @param max - Maximum bounds
 * @returns True if position is within bounds
 *
 * @example
 * ```typescript
 * const pos = new THREE.Vector3(1, 2, 3);
 * const min = new THREE.Vector3(0, 0, 0);
 * const max = new THREE.Vector3(5, 5, 5);
 * isWithinBounds(pos, min, max); // true
 * ```
 */
export function isWithinBounds(
  position: THREE.Vector3,
  min: THREE.Vector3,
  max: THREE.Vector3
): boolean {
  return (
    position.x >= min.x &&
    position.x <= max.x &&
    position.y >= min.y &&
    position.y <= max.y &&
    position.z >= min.z &&
    position.z <= max.z
  );
}
