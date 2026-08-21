/**
 * Built-in pinch gesture plugin
 *
 * Detects when thumb and index finger tips are close together.
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
 * Pinch gesture plugin
 *
 * Priority: 80 (high - checked before most other gestures)
 */
export class PinchGesturePlugin implements GesturePlugin {
  readonly name = 'builtin:pinch';
  readonly version = '1.0.0';
  readonly priority = 80;
  readonly gestureType = 'pinch';

  detect(landmarks: HandLandmark[], settings: GestureSettings): boolean {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const dist = distance(thumbTip, indexTip);

    return dist < settings.pinchThreshold;
  }
}
