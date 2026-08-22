/**
 * Adaptive smoothing for hand tracking with motion-aware filtering
 *
 * Instead of fixed EMA (α=0.3), this provides multi-stage smoothing that:
 * - Smooths heavily during small movements (reduce jitter)
 * - Smooths lightly during large movements (preserve responsiveness)
 * - Detects sudden direction changes and handles them specially
 */

import * as THREE from 'three';

export interface SmoothingConfig {
  /** Smoothing factor for small movements (α, lower = smoother) */
  smallMovementAlpha: number;

  /** Smoothing factor for large movements (α, higher = more responsive) */
  largeMovementAlpha: number;

  /** Smoothing factor for medium movements */
  mediumMovementAlpha: number;

  /** Threshold for small movement (units per frame) */
  smallMovementThreshold: number;

  /** Threshold for large movement (units per frame) */
  largeMovementThreshold: number;

  /** Whether to use jerk detection for sudden changes */
  useJerkDetection: boolean;

  /** Jerk threshold (change in velocity) */
  jerkThreshold: number;
}

export const DEFAULT_SMOOTHING_CONFIG: SmoothingConfig = {
  smallMovementAlpha: 0.15,      // Heavy smoothing for jitter
  mediumMovementAlpha: 0.3,      // Balanced (current default)
  largeMovementAlpha: 0.6,       // Light smoothing for responsiveness
  smallMovementThreshold: 0.05,  // < 0.05 units = small movement
  largeMovementThreshold: 0.3,   // > 0.3 units = large movement
  useJerkDetection: true,
  jerkThreshold: 0.2,            // Sudden acceleration/deceleration
};

interface SmoothingState {
  previousValue: number;
  previousVelocity: number;
  timestamp: number;
}

// Cache for per-hand smoothing state
const smoothingStateCache = new Map<string, SmoothingState>();

/**
 * Calculate movement magnitude between current and previous position
 */
export function calculateMovementMagnitude(
  current: number,
  previous: number
): number {
  return Math.abs(current - previous);
}

/**
 * Calculate velocity (change per unit time, assuming ~30-60 FPS)
 */
export function calculateVelocity(
  current: number,
  previous: number,
  deltaTime: number
): number {
  if (deltaTime <= 0) return 0;
  return (current - previous) / deltaTime;
}

/**
 * Calculate jerk (change in velocity, aka acceleration)
 */
export function calculateJerk(
  currentVelocity: number,
  previousVelocity: number,
  deltaTime: number
): number {
  if (deltaTime <= 0) return 0;
  return Math.abs(currentVelocity - previousVelocity) / deltaTime;
}

/**
 * Select appropriate smoothing factor based on movement characteristics
 */
export function selectSmoothingFactor(
  movement: number,
  jerk: number,
  config: SmoothingConfig
): number {
  const {
    smallMovementAlpha,
    mediumMovementAlpha,
    largeMovementAlpha,
    smallMovementThreshold,
    largeMovementThreshold,
    useJerkDetection,
    jerkThreshold,
  } = config;

  // Check for sudden direction changes (jerk)
  if (useJerkDetection && jerk > jerkThreshold) {
    // High jerk = sudden change, use high responsiveness
    return largeMovementAlpha;
  }

  // Select based on movement magnitude
  if (movement < smallMovementThreshold) {
    // Small movement: smooth heavily to reduce jitter
    return smallMovementAlpha;
  } else if (movement > largeMovementThreshold) {
    // Large movement: smooth lightly to stay responsive
    return largeMovementAlpha;
  } else {
    // Medium movement: balanced smoothing
    return mediumMovementAlpha;
  }
}

/**
 * Apply exponential moving average with given alpha
 */
export function applyEMA(
  current: number,
  previous: number,
  alpha: number
): number {
  return previous + alpha * (current - previous);
}

/**
 * Adaptive smoothing with motion-aware filtering
 *
 * @param handId - Unique hand identifier for state caching
 * @param rawValue - Current raw (unsmoothed) value
 * @param config - Smoothing configuration
 * @returns Smoothed value
 */
export function applyAdaptiveSmoothing(
  handId: string,
  rawValue: number,
  config: SmoothingConfig = DEFAULT_SMOOTHING_CONFIG
): number {
  // Get or initialize state for this hand
  let state = smoothingStateCache.get(handId);

  const now = performance.now();

  // First frame: no smoothing, just store
  if (!state) {
    smoothingStateCache.set(handId, {
      previousValue: rawValue,
      previousVelocity: 0,
      timestamp: now,
    });
    return rawValue;
  }

  // Calculate time delta (convert to seconds)
  const deltaTime = Math.max(0.001, (now - state.timestamp) / 1000);

  // Calculate movement characteristics
  const movement = calculateMovementMagnitude(rawValue, state.previousValue);
  const velocity = calculateVelocity(rawValue, state.previousValue, deltaTime);
  const jerk = calculateJerk(velocity, state.previousVelocity, deltaTime);

  // Select appropriate smoothing factor
  const alpha = selectSmoothingFactor(movement, jerk, config);

  // Apply EMA with selected alpha
  const smoothedValue = applyEMA(rawValue, state.previousValue, alpha);

  // Update state
  smoothingStateCache.set(handId, {
    previousValue: smoothedValue,
    previousVelocity: velocity,
    timestamp: now,
  });

  return smoothedValue;
}

/**
 * Apply adaptive smoothing to 3D vector (component-wise)
 *
 * Useful for smoothing 3D positions while maintaining motion awareness
 */
export function applyAdaptiveSmoothing3D(
  handId: string,
  rawPosition: THREE.Vector3,
  config: SmoothingConfig = DEFAULT_SMOOTHING_CONFIG
): THREE.Vector3 {
  return new THREE.Vector3(
    applyAdaptiveSmoothing(`${handId}_x`, rawPosition.x, config),
    applyAdaptiveSmoothing(`${handId}_y`, rawPosition.y, config),
    applyAdaptiveSmoothing(`${handId}_z`, rawPosition.z, config)
  );
}

/**
 * Clear smoothing state for a specific hand (call when hand disappears)
 */
export function clearSmoothingState(handId: string): void {
  smoothingStateCache.delete(`${handId}_x`);
  smoothingStateCache.delete(`${handId}_y`);
  smoothingStateCache.delete(`${handId}_z`);
  smoothingStateCache.delete(handId);
}

/**
 * Clear all smoothing state
 */
export function clearAllSmoothingState(): void {
  smoothingStateCache.clear();
}

/**
 * Get debug info for current smoothing state
 */
export function getSmoothingDebugInfo(handId: string): {
  hasState: boolean;
  alpha?: number;
  movement?: number;
  velocity?: number;
  jerk?: number;
} {
  const state = smoothingStateCache.get(handId);
  if (!state) {
    return { hasState: false };
  }

  // Can't calculate these without current value, return basic info
  return {
    hasState: true,
    velocity: state.previousVelocity,
  };
}

/**
 * Utility: Format smoothing mode as string for debugging
 */
export function formatSmoothingMode(movement: number, config: SmoothingConfig): string {
  if (movement < config.smallMovementThreshold) {
    return `SMOOTH (α=${config.smallMovementAlpha})`;
  } else if (movement > config.largeMovementThreshold) {
    return `RESPONSIVE (α=${config.largeMovementAlpha})`;
  } else {
    return `BALANCED (α=${config.mediumMovementAlpha})`;
  }
}
