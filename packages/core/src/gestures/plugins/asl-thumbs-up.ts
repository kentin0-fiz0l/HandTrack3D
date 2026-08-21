/**
 * ASL Thumbs-Up Gesture Plugin (Example)
 *
 * Demonstrates custom gesture detection for American Sign Language.
 * Detects when thumb is extended upward with other fingers curled.
 */

import type { HandLandmark } from '../../types/hand';
import type { GestureSettings } from '../../types/gesture';
import type { GesturePlugin } from '../../plugins';

/**
 * Calculate Euclidean distance between two landmarks
 */
function distance(a: HandLandmark, b: HandLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * ASL Thumbs-Up gesture plugin
 *
 * Priority: 70 (higher than fist/open, lower than pinch)
 *
 * Detection criteria:
 * - Thumb tip (4) is above thumb base (2) in Y axis
 * - Index, middle, ring, pinky fingertips are close to palm
 * - Hand is roughly vertical (thumb pointing up, not sideways)
 *
 * @example
 * ```typescript
 * import { GestureDetector } from '@handtrack3d/core';
 * import { ASLThumbsUpGesturePlugin } from '@handtrack3d/core/gestures/plugins';
 *
 * const detector = new GestureDetector();
 * detector.registerGesture(new ASLThumbsUpGesturePlugin());
 *
 * const gesture = detector.detectGesture(landmarks);
 * if (gesture === 'thumbs-up') {
 *   console.log('👍 Thumbs up detected!');
 * }
 * ```
 */
export class ASLThumbsUpGesturePlugin implements GesturePlugin {
  readonly name = 'asl:thumbs-up';
  readonly version = '1.0.0';
  readonly priority = 70;
  readonly gestureType = 'thumbs-up';

  detect(landmarks: HandLandmark[], settings: GestureSettings): boolean {
    const wrist = landmarks[0];
    const thumbBase = landmarks[2];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // 1. Thumb must be extended upward (tip above base in Y)
    const thumbExtended = thumbTip.y < thumbBase.y - 0.05;

    if (!thumbExtended) {
      return false;
    }

    // 2. Other fingers should be curled (tips close to wrist)
    const fingerTips = [indexTip, middleTip, ringTip, pinkyTip];
    const allFingersCurled = fingerTips.every((tip) => {
      const dist = distance(tip, wrist);
      return dist < settings.fistCurlThreshold * 1.2; // Slightly more lenient
    });

    if (!allFingersCurled) {
      return false;
    }

    // 3. Hand should be roughly vertical (thumb pointing up, not sideways)
    // Check that thumb is significantly higher than other fingertips
    const thumbIsHighest = fingerTips.every((tip) => thumbTip.y < tip.y - 0.03);

    if (!thumbIsHighest) {
      return false;
    }

    // 4. Thumb should be away from palm (not tucked in)
    const thumbDistanceFromWrist = distance(thumbTip, wrist);
    const thumbExtendedFromPalm = thumbDistanceFromWrist > 0.08;

    return thumbExtendedFromPalm;
  }
}

/**
 * ASL Thumbs-Down gesture plugin
 *
 * Similar to thumbs-up but with thumb pointing downward.
 *
 * @example
 * ```typescript
 * detector.registerGesture(new ASLThumbsDownGesturePlugin());
 * ```
 */
export class ASLThumbsDownGesturePlugin implements GesturePlugin {
  readonly name = 'asl:thumbs-down';
  readonly version = '1.0.0';
  readonly priority = 70;
  readonly gestureType = 'thumbs-down';

  detect(landmarks: HandLandmark[], settings: GestureSettings): boolean {
    const wrist = landmarks[0];
    const thumbBase = landmarks[2];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // 1. Thumb must be extended downward (tip below base in Y)
    const thumbExtended = thumbTip.y > thumbBase.y + 0.05;

    if (!thumbExtended) {
      return false;
    }

    // 2. Other fingers should be curled
    const fingerTips = [indexTip, middleTip, ringTip, pinkyTip];
    const allFingersCurled = fingerTips.every((tip) => {
      const dist = distance(tip, wrist);
      return dist < settings.fistCurlThreshold * 1.2;
    });

    if (!allFingersCurled) {
      return false;
    }

    // 3. Thumb should be lowest point
    const thumbIsLowest = fingerTips.every((tip) => thumbTip.y > tip.y + 0.03);

    return thumbIsLowest;
  }
}
