import type { HandLandmark } from '../../types/hand';
import type { GestureSettings } from '../../types/gesture';
import type { GesturePlugin } from '../../plugins';

/**
 * Configuration options for swipe detection
 */
export interface SwipeGestureOptions {
  /**
   * Minimum velocity required to trigger swipe (units per second)
   * @default 2.0
   */
  minVelocity?: number;

  /**
   * Maximum time window for swipe detection (milliseconds)
   * @default 500
   */
  maxDuration?: number;

  /**
   * Number of position samples to track for velocity calculation
   * @default 5
   */
  historySamples?: number;

  /**
   * Minimum ratio of dominant direction vs. perpendicular direction
   * Higher values require more directional swipes
   * @default 1.5
   */
  directionalityThreshold?: number;
}

/**
 * Position sample with timestamp
 */
interface PositionSample {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

/**
 * Swipe direction
 */
type SwipeDirection = 'left' | 'right' | 'up' | 'down';

/**
 * Base class for swipe gesture detection
 * Tracks hand movement velocity and direction over time
 */
abstract class BaseSwipePlugin implements GesturePlugin {
  abstract readonly name: string;
  abstract readonly gestureType: string;
  abstract readonly direction: SwipeDirection;
  readonly priority = 60; // Between pinch (80) and fist (40)

  private positionHistory: Map<string, PositionSample[]> = new Map();
  private readonly minVelocity: number;
  private readonly maxDuration: number;
  private readonly historySamples: number;
  private readonly directionalityThreshold: number;

  constructor(options: SwipeGestureOptions = {}) {
    this.minVelocity = options.minVelocity ?? 2.0;
    this.maxDuration = options.maxDuration ?? 500;
    this.historySamples = options.historySamples ?? 5;
    this.directionalityThreshold = options.directionalityThreshold ?? 1.5;
  }

  /**
   * Detect swipe gesture based on hand movement
   */
  detect(landmarks: HandLandmark[], _settings: GestureSettings): boolean {
    // Use wrist (landmark 0) for position tracking
    const wrist = landmarks[0];

    // Use a single global history for simplicity
    // In real usage, the detector would be per-hand instance
    const handId = 'default';
    const now = Date.now();

    // Get or initialize history for this hand
    let history = this.positionHistory.get(handId);
    if (!history) {
      history = [];
      this.positionHistory.set(handId, history);
    }

    // Add current position to history
    history.push({
      x: wrist.x,
      y: wrist.y,
      z: wrist.z,
      timestamp: now,
    });

    // Cleanup old samples
    this.cleanupHistory(history, now);

    // Keep only recent samples
    if (history.length > this.historySamples) {
      history.shift();
    }

    // Need at least 3 samples for reliable velocity calculation
    if (history.length < 3) {
      return false;
    }

    // Calculate velocity
    const velocity = this.calculateVelocity(history);
    if (!velocity) {
      return false;
    }

    // Check if velocity meets threshold
    const speed = Math.sqrt(
      velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z
    );
    if (speed < this.minVelocity) {
      return false;
    }

    // Check if movement matches expected direction
    return this.matchesDirection(velocity);
  }

  /**
   * Remove samples older than maxDuration
   */
  private cleanupHistory(history: PositionSample[], currentTime: number): void {
    const cutoffTime = currentTime - this.maxDuration;
    while (history.length > 0 && history[0].timestamp < cutoffTime) {
      history.shift();
    }
  }

  /**
   * Calculate velocity from position history
   * Returns velocity in units per second
   */
  private calculateVelocity(
    history: PositionSample[]
  ): { x: number; y: number; z: number } | null {
    if (history.length < 2) {
      return null;
    }

    const first = history[0];
    const last = history[history.length - 1];
    const deltaTime = (last.timestamp - first.timestamp) / 1000; // Convert to seconds

    if (deltaTime === 0) {
      return null;
    }

    return {
      x: (last.x - first.x) / deltaTime,
      y: (last.y - first.y) / deltaTime,
      z: (last.z - first.z) / deltaTime,
    };
  }

  /**
   * Check if velocity vector matches expected swipe direction
   */
  private matchesDirection(velocity: { x: number; y: number; z: number }): boolean {
    const absX = Math.abs(velocity.x);
    const absY = Math.abs(velocity.y);

    switch (this.direction) {
      case 'left':
        // Negative X, dominant over Y
        return velocity.x < 0 && absX > absY * this.directionalityThreshold;

      case 'right':
        // Positive X, dominant over Y
        return velocity.x > 0 && absX > absY * this.directionalityThreshold;

      case 'up':
        // Negative Y (up in screen coordinates), dominant over X
        return velocity.y < 0 && absY > absX * this.directionalityThreshold;

      case 'down':
        // Positive Y (down in screen coordinates), dominant over X
        return velocity.y > 0 && absY > absX * this.directionalityThreshold;

      default:
        return false;
    }
  }

  /**
   * Clear position history for all hands (useful for testing)
   */
  dispose(): void {
    this.positionHistory.clear();
  }
}

/**
 * Swipe left gesture plugin
 * Detects horizontal left swipe motion
 */
export class SwipeLeftGesturePlugin extends BaseSwipePlugin {
  readonly name = 'builtin:swipe-left';
  readonly gestureType = 'swipeLeft';
  readonly direction = 'left' as const;
}

/**
 * Swipe right gesture plugin
 * Detects horizontal right swipe motion
 */
export class SwipeRightGesturePlugin extends BaseSwipePlugin {
  readonly name = 'builtin:swipe-right';
  readonly gestureType = 'swipeRight';
  readonly direction = 'right' as const;
}

/**
 * Swipe up gesture plugin
 * Detects vertical upward swipe motion
 */
export class SwipeUpGesturePlugin extends BaseSwipePlugin {
  readonly name = 'builtin:swipe-up';
  readonly gestureType = 'swipeUp';
  readonly direction = 'up' as const;
}

/**
 * Swipe down gesture plugin
 * Detects vertical downward swipe motion
 */
export class SwipeDownGesturePlugin extends BaseSwipePlugin {
  readonly name = 'builtin:swipe-down';
  readonly gestureType = 'swipeDown';
  readonly direction = 'down' as const;
}
