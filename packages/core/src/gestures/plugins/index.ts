/**
 * Built-in gesture plugins
 *
 * These plugins implement the standard HandTrack3D gestures:
 * - Pinch (thumb + index finger close)
 * - Point (index finger extended, others curled)
 * - Fist (all fingers curled)
 * - Open hand (all fingers extended)
 */

export { PinchGesturePlugin } from './pinch';
export { OpenHandGesturePlugin } from './open-hand';
export { FistGesturePlugin } from './fist';
export { PointGesturePlugin } from './point';

/**
 * Example gesture plugins
 *
 * Demonstrates custom gesture detection:
 * - ASL Thumbs-Up
 * - ASL Thumbs-Down
 */
export { ASLThumbsUpGesturePlugin, ASLThumbsDownGesturePlugin } from './asl-thumbs-up';
