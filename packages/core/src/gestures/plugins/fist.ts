/**
 * Built-in fist gesture plugin
 *
 * Detects when all fingers are curled into a fist.
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
 * Fist gesture plugin
 *
 * Priority: 40 (medium-low - checked after pinch and point)
 */
export class FistGesturePlugin implements GesturePlugin {
  readonly name = 'builtin:fist';
  readonly version = '1.0.0';
  readonly priority = 40;
  readonly gestureType = 'fist';

  detect(landmarks: HandLandmark[], settings: GestureSettings): boolean {
    // Check if all fingertips are close to palm
    const wrist = landmarks[0];
    const fingertips = [
      landmarks[4],  // thumb
      landmarks[8],  // index
      landmarks[12], // middle
      landmarks[16], // ring
      landmarks[20], // pinky
    ];

    // All fingertips should be within a small radius of wrist
    const allCurled = fingertips.every((tip) => {
      const dist = distance(tip, wrist);
      return dist < settings.fistCurlThreshold;
    });

    return allCurled;
  }
}
