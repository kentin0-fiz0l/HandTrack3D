import type { HandLandmark } from '../types/hand';
import type { GestureSettings } from '../types/gesture';

/**
 * Multi-hand gesture plugin interface
 *
 * Unlike single-hand GesturePlugin, this interface detects gestures
 * that require multiple hands (e.g., scale, rotate, clap).
 *
 * @example
 * ```typescript
 * class TwoHandScalePlugin implements MultiHandGesturePlugin {
 *   readonly name = 'two-hand:scale';
 *   readonly priority = 70;
 *   readonly gestureType = 'scale';
 *   readonly requiredHands = 2;
 *
 *   detect(hands: HandLandmark[][], settings: GestureSettings) {
 *     // Check if both hands are pinching and moving apart/together
 *     return detectScaleGesture(hands[0], hands[1]);
 *   }
 * }
 * ```
 */
export interface MultiHandGesturePlugin {
  /**
   * Unique identifier for this plugin
   * Convention: "namespace:gesture-name"
   * @example "two-hand:scale", "two-hand:rotate", "two-hand:clap"
   */
  readonly name: string;

  /**
   * Priority for gesture matching (0-100)
   * Higher priority plugins are checked first
   * @default 60
   */
  readonly priority: number;

  /**
   * Gesture type identifier
   * Used as the return value when this gesture is detected
   * @example "scale", "rotate", "clap"
   */
  readonly gestureType: string;

  /**
   * Number of hands required for this gesture
   * @default 2
   */
  readonly requiredHands: number;

  /**
   * Detect gesture from multiple hands
   *
   * @param hands - Array of hand landmarks (one per hand)
   * @param settings - Gesture detection settings
   * @returns True if gesture is detected
   *
   * @example
   * ```typescript
   * detect(hands, settings) {
   *   if (hands.length < this.requiredHands) return false;
   *   const [leftHand, rightHand] = hands;
   *   return checkTwoHandGesture(leftHand, rightHand);
   * }
   * ```
   */
  detect(hands: HandLandmark[][], settings: GestureSettings): boolean;

  /**
   * Optional initialization logic
   * Called when plugin is registered
   */
  initialize?(): void;

  /**
   * Optional cleanup logic
   * Called when plugin is unregistered or detector is disposed
   */
  dispose?(): void;
}

/**
 * Multi-hand gesture detection result
 *
 * Provides additional data about the detected gesture beyond just the type.
 */
export interface MultiHandGestureResult {
  /**
   * Detected gesture type
   */
  type: string;

  /**
   * Number of hands involved
   */
  handCount: number;

  /**
   * Optional gesture-specific data
   * @example For scale: { distance: number, delta: number }
   * @example For rotate: { angle: number, delta: number }
   */
  data?: Record<string, unknown>;
}
