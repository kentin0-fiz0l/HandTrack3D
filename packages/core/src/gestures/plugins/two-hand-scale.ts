import type { HandLandmark } from '../../types/hand';
import type { GestureSettings } from '../../types/gesture';
import type { MultiHandGesturePlugin } from '../../plugins/multi-hand-types';

/**
 * Configuration options for two-hand scale gesture
 */
export interface TwoHandScaleOptions {
  /**
   * Minimum distance between hands to detect scale (in normalized units)
   * @default 0.1
   */
  minDistance?: number;

  /**
   * Distance change threshold to trigger scale detection
   * @default 0.05
   */
  distanceThreshold?: number;

  /**
   * Maximum time window for distance tracking (milliseconds)
   * @default 500
   */
  maxDuration?: number;

  /**
   * Number of distance samples to track
   * @default 5
   */
  historySamples?: number;
}

/**
 * Distance sample with timestamp
 */
interface DistanceSample {
  distance: number;
  timestamp: number;
}

/**
 * Two-hand scale gesture plugin
 *
 * Detects when both hands are pinching and moving apart (zoom in)
 * or together (zoom out).
 *
 * @example
 * ```typescript
 * const detector = new MultiHandGestureDetector();
 * detector.registerGesture(new TwoHandScaleGesturePlugin());
 *
 * // With both hands pinching and moving apart
 * const gesture = detector.detectGesture([leftHand, rightHand]);
 * if (gesture === 'scale') {
 *   console.log('User is scaling!');
 * }
 * ```
 */
export class TwoHandScaleGesturePlugin implements MultiHandGesturePlugin {
  readonly name = 'two-hand:scale';
  readonly priority = 70;
  readonly gestureType = 'scale';
  readonly requiredHands = 2;

  private distanceHistory: DistanceSample[] = [];
  private readonly minDistance: number;
  private readonly distanceThreshold: number;
  private readonly maxDuration: number;
  private readonly historySamples: number;

  constructor(options: TwoHandScaleOptions = {}) {
    this.minDistance = options.minDistance ?? 0.1;
    this.distanceThreshold = options.distanceThreshold ?? 0.05;
    this.maxDuration = options.maxDuration ?? 500;
    this.historySamples = options.historySamples ?? 5;
  }

  /**
   * Detect two-hand scale gesture
   *
   * Requirements:
   * 1. Both hands must be pinching
   * 2. Distance between hands must be changing
   * 3. Change must exceed threshold
   */
  detect(hands: HandLandmark[][], settings: GestureSettings): boolean {
    if (hands.length < 2) {
      return false;
    }

    const [hand1, hand2] = hands;

    // Check if both hands are pinching
    if (!this.isPinching(hand1, settings) || !this.isPinching(hand2, settings)) {
      // Clear history if not both pinching
      this.distanceHistory = [];
      return false;
    }

    // Calculate distance between hands (using wrists)
    const distance = this.calculateDistance(hand1[0], hand2[0]);

    // Check minimum distance
    if (distance < this.minDistance) {
      return false;
    }

    // Track distance over time
    const now = Date.now();
    this.distanceHistory.push({ distance, timestamp: now });

    // Cleanup old samples
    this.cleanupHistory(now);

    // Keep only recent samples
    if (this.distanceHistory.length > this.historySamples) {
      this.distanceHistory.shift();
    }

    // Need at least 3 samples to detect change
    if (this.distanceHistory.length < 3) {
      return false;
    }

    // Calculate distance change
    const first = this.distanceHistory[0];
    const last = this.distanceHistory[this.distanceHistory.length - 1];
    const distanceChange = Math.abs(last.distance - first.distance);

    // Check if distance is changing enough
    return distanceChange >= this.distanceThreshold;
  }

  /**
   * Check if hand is in pinch gesture
   */
  private isPinching(landmarks: HandLandmark[], settings: GestureSettings): boolean {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    const distance = this.calculateDistance(thumbTip, indexTip);
    return distance < (settings.pinchThreshold || 0.05);
  }

  /**
   * Calculate Euclidean distance between two points
   */
  private calculateDistance(p1: HandLandmark, p2: HandLandmark): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Remove samples older than maxDuration
   */
  private cleanupHistory(currentTime: number): void {
    const cutoffTime = currentTime - this.maxDuration;
    while (this.distanceHistory.length > 0 && this.distanceHistory[0].timestamp < cutoffTime) {
      this.distanceHistory.shift();
    }
  }

  /**
   * Get current scale delta (positive = zooming in, negative = zooming out)
   * Call this after detect() returns true to get scale amount
   */
  getScaleDelta(): number {
    if (this.distanceHistory.length < 2) {
      return 0;
    }

    const first = this.distanceHistory[0];
    const last = this.distanceHistory[this.distanceHistory.length - 1];
    return last.distance - first.distance;
  }

  /**
   * Clear distance history
   */
  dispose(): void {
    this.distanceHistory = [];
  }
}

/**
 * Two-hand rotate gesture plugin
 *
 * Detects when both hands are moving in a circular motion
 * to rotate an object.
 *
 * @example
 * ```typescript
 * const detector = new MultiHandGestureDetector();
 * detector.registerGesture(new TwoHandRotateGesturePlugin());
 *
 * const gesture = detector.detectGesture([leftHand, rightHand]);
 * if (gesture === 'rotate') {
 *   const angle = plugin.getRotationAngle();
 *   console.log(`Rotating by ${angle} radians`);
 * }
 * ```
 */
export class TwoHandRotateGesturePlugin implements MultiHandGesturePlugin {
  readonly name = 'two-hand:rotate';
  readonly priority = 70;
  readonly gestureType = 'rotate';
  readonly requiredHands = 2;

  private angleHistory: Array<{ angle: number; timestamp: number }> = [];
  private readonly angleThreshold: number;
  private readonly maxDuration: number;
  private readonly historySamples: number;

  constructor(options: {
    angleThreshold?: number;
    maxDuration?: number;
    historySamples?: number;
  } = {}) {
    this.angleThreshold = options.angleThreshold ?? 0.1; // ~5.7 degrees
    this.maxDuration = options.maxDuration ?? 500;
    this.historySamples = options.historySamples ?? 5;
  }

  detect(hands: HandLandmark[][], settings: GestureSettings): boolean {
    if (hands.length < 2) {
      return false;
    }

    const [hand1, hand2] = hands;

    // Check if both hands are in fist or pinch (gripping)
    const hand1Gripping = this.isGripping(hand1, settings);
    const hand2Gripping = this.isGripping(hand2, settings);

    if (!hand1Gripping || !hand2Gripping) {
      this.angleHistory = [];
      return false;
    }

    // Calculate angle between hands
    const angle = this.calculateAngle(hand1[0], hand2[0]);

    // Track angle over time
    const now = Date.now();
    this.angleHistory.push({ angle, timestamp: now });

    // Cleanup old samples
    this.cleanupHistory(now);

    // Keep only recent samples
    if (this.angleHistory.length > this.historySamples) {
      this.angleHistory.shift();
    }

    // Need at least 3 samples
    if (this.angleHistory.length < 3) {
      return false;
    }

    // Calculate angle change
    const first = this.angleHistory[0];
    const last = this.angleHistory[this.angleHistory.length - 1];
    let angleDelta = last.angle - first.angle;

    // Handle angle wrapping (-π to π)
    if (angleDelta > Math.PI) angleDelta -= 2 * Math.PI;
    if (angleDelta < -Math.PI) angleDelta += 2 * Math.PI;

    // Check if angle is changing enough
    return Math.abs(angleDelta) >= this.angleThreshold;
  }

  /**
   * Check if hand is gripping (fist or pinch)
   */
  private isGripping(landmarks: HandLandmark[], settings: GestureSettings): boolean {
    // Check pinch
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const pinchDist = this.calculateDistance(thumbTip, indexTip);

    if (pinchDist < (settings.pinchThreshold || 0.05)) {
      return true;
    }

    // Check fist (all fingers curled)
    const wrist = landmarks[0];
    const fingerTips = [landmarks[8], landmarks[12], landmarks[16], landmarks[20]];

    const allCurled = fingerTips.every((tip) => {
      const dist = this.calculateDistance(wrist, tip);
      return dist < 0.15;
    });

    return allCurled;
  }

  /**
   * Calculate angle from hand1 to hand2 (in radians, -π to π)
   */
  private calculateAngle(p1: HandLandmark, p2: HandLandmark): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.atan2(dy, dx);
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(p1: HandLandmark, p2: HandLandmark): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Remove samples older than maxDuration
   */
  private cleanupHistory(currentTime: number): void {
    const cutoffTime = currentTime - this.maxDuration;
    while (this.angleHistory.length > 0 && this.angleHistory[0].timestamp < cutoffTime) {
      this.angleHistory.shift();
    }
  }

  /**
   * Get rotation delta in radians
   */
  getRotationAngle(): number {
    if (this.angleHistory.length < 2) {
      return 0;
    }

    const first = this.angleHistory[0];
    const last = this.angleHistory[this.angleHistory.length - 1];
    let delta = last.angle - first.angle;

    // Handle wrapping
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;

    return delta;
  }

  dispose(): void {
    this.angleHistory = [];
  }
}

/**
 * Clap gesture plugin
 *
 * Detects when both hands come together quickly (clapping motion).
 *
 * @example
 * ```typescript
 * const detector = new MultiHandGestureDetector();
 * detector.registerGesture(new ClapGesturePlugin());
 *
 * const gesture = detector.detectGesture([leftHand, rightHand]);
 * if (gesture === 'clap') {
 *   console.log('User clapped!');
 * }
 * ```
 */
export class ClapGesturePlugin implements MultiHandGesturePlugin {
  readonly name = 'two-hand:clap';
  readonly priority = 80; // Higher priority - distinctive gesture
  readonly gestureType = 'clap';
  readonly requiredHands = 2;

  private distanceHistory: DistanceSample[] = [];
  private lastClapTime = 0;
  private readonly clapDistance: number;
  private readonly clapVelocity: number;
  private readonly cooldownMs: number;
  private readonly maxDuration: number;

  constructor(options: {
    clapDistance?: number;
    clapVelocity?: number;
    cooldownMs?: number;
    maxDuration?: number;
  } = {}) {
    this.clapDistance = options.clapDistance ?? 0.15; // Close proximity
    this.clapVelocity = options.clapVelocity ?? 2.0; // Fast approach
    this.cooldownMs = options.cooldownMs ?? 500; // Prevent rapid re-triggering
    this.maxDuration = options.maxDuration ?? 300; // Quick motion
  }

  detect(hands: HandLandmark[][], _settings: GestureSettings): boolean {
    if (hands.length < 2) {
      return false;
    }

    const now = Date.now();

    // Check cooldown
    if (now - this.lastClapTime < this.cooldownMs) {
      return false;
    }

    const [hand1, hand2] = hands;

    // Calculate distance between palm centers (wrist landmarks)
    const distance = this.calculateDistance(hand1[0], hand2[0]);

    // Track distance over time
    this.distanceHistory.push({ distance, timestamp: now });

    // Cleanup old samples
    this.cleanupHistory(now);

    // Need at least 3 samples
    if (this.distanceHistory.length < 3) {
      return false;
    }

    // Check if hands are close
    if (distance > this.clapDistance) {
      return false;
    }

    // Calculate approach velocity
    const velocity = this.calculateVelocity();

    // Check if hands approached quickly (negative velocity = coming together)
    if (velocity !== null && velocity < -this.clapVelocity) {
      this.lastClapTime = now;
      this.distanceHistory = []; // Reset for next clap
      return true;
    }

    return false;
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(p1: HandLandmark, p2: HandLandmark): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate velocity from distance history (units per second)
   */
  private calculateVelocity(): number | null {
    if (this.distanceHistory.length < 2) {
      return null;
    }

    const first = this.distanceHistory[0];
    const last = this.distanceHistory[this.distanceHistory.length - 1];
    const deltaTime = (last.timestamp - first.timestamp) / 1000;

    if (deltaTime === 0) {
      return null;
    }

    return (last.distance - first.distance) / deltaTime;
  }

  /**
   * Remove samples older than maxDuration
   */
  private cleanupHistory(currentTime: number): void {
    const cutoffTime = currentTime - this.maxDuration;
    while (this.distanceHistory.length > 0 && this.distanceHistory[0].timestamp < cutoffTime) {
      this.distanceHistory.shift();
    }
  }

  dispose(): void {
    this.distanceHistory = [];
    this.lastClapTime = 0;
  }
}
