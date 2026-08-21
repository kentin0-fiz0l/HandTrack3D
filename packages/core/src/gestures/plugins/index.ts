/**
 * Built-in gesture plugins
 *
 * These plugins implement the standard HandTrack3D gestures:
 * - Pinch (thumb + index finger close)
 * - Point (index finger extended, others curled)
 * - Fist (all fingers curled)
 * - Open hand (all fingers extended)
 * - Swipe (directional hand movement)
 */

export { PinchGesturePlugin } from './pinch';
export { OpenHandGesturePlugin } from './open-hand';
export { FistGesturePlugin } from './fist';
export { PointGesturePlugin } from './point';

/**
 * Swipe gesture plugins
 *
 * Velocity-based directional swipe detection:
 * - Swipe Left
 * - Swipe Right
 * - Swipe Up
 * - Swipe Down
 */
export {
  SwipeLeftGesturePlugin,
  SwipeRightGesturePlugin,
  SwipeUpGesturePlugin,
  SwipeDownGesturePlugin,
  type SwipeGestureOptions,
} from './swipe';

/**
 * Example gesture plugins
 *
 * Demonstrates custom gesture detection:
 * - ASL Thumbs-Up
 * - ASL Thumbs-Down
 */
export { ASLThumbsUpGesturePlugin, ASLThumbsDownGesturePlugin } from './asl-thumbs-up';

/**
 * Multi-hand gesture plugins
 *
 * Gestures requiring two or more hands:
 * - Two-hand scale (pinch zoom)
 * - Two-hand rotate
 * - Clap
 */
export {
  TwoHandScaleGesturePlugin,
  TwoHandRotateGesturePlugin,
  ClapGesturePlugin,
  type TwoHandScaleOptions,
} from './two-hand-scale';
