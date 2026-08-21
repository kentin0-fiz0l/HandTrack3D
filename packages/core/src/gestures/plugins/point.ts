/**
 * Built-in point gesture plugin
 *
 * Detects when index finger is extended and others are curled.
 */

import type { HandLandmark } from '../../types/hand';
import type { GestureSettings } from '../../types/gesture';
import type { GesturePlugin } from '../../plugins';

/**
 * Calculate angle at a joint formed by three landmarks (in degrees)
 */
function calculateAngle(
  a: HandLandmark,
  b: HandLandmark,
  c: HandLandmark
): number {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y + ba.z * ba.z);
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y + bc.z * bc.z);

  const cosAngle = dot / (magBA * magBC);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

  return (angle * 180) / Math.PI;
}

/**
 * Check if a finger is extended based on joint angles
 */
function isFingerExtended(
  landmarks: HandLandmark[],
  fingerIndices: number[],
  threshold: number
): boolean {
  const angles = [];
  for (let i = 0; i < fingerIndices.length - 2; i++) {
    const angle = calculateAngle(
      landmarks[fingerIndices[i]],
      landmarks[fingerIndices[i + 1]],
      landmarks[fingerIndices[i + 2]]
    );
    angles.push(angle);
  }

  return angles.every((angle) => angle > threshold);
}

/**
 * Point gesture plugin
 *
 * Priority: 60 (medium - checked after pinch but before fist/open)
 */
export class PointGesturePlugin implements GesturePlugin {
  readonly name = 'builtin:point';
  readonly version = '1.0.0';
  readonly priority = 60;
  readonly gestureType = 'point';

  detect(landmarks: HandLandmark[], settings: GestureSettings): boolean {
    // Check index finger is extended
    const indexExtended = isFingerExtended(
      landmarks,
      [5, 6, 7, 8],
      settings.pointExtensionAngle
    );

    if (!indexExtended) {
      return false;
    }

    // Check other fingers are curled (not extended)
    const middleCurled = !isFingerExtended(
      landmarks,
      [9, 10, 11, 12],
      settings.pointExtensionAngle
    );
    const ringCurled = !isFingerExtended(
      landmarks,
      [13, 14, 15, 16],
      settings.pointExtensionAngle
    );
    const pinkyCurled = !isFingerExtended(
      landmarks,
      [17, 18, 19, 20],
      settings.pointExtensionAngle
    );

    // Check thumb is not extended (to distinguish from "L" shape)
    const thumbCurled = !isFingerExtended(
      landmarks,
      [1, 2, 3, 4],
      settings.pointExtensionAngle
    );

    return middleCurled && ringCurled && pinkyCurled && thumbCurled;
  }
}
