/**
 * @handtrack3d/core - Framework-agnostic 3D hand tracking library
 *
 * Core functionality for hand tracking using MediaPipe Hands.
 * Can be used with any JavaScript framework or vanilla JS.
 */

export const version = '0.2.0-alpha.2';

// Main hand tracking class
export { HandTracker, DEFAULT_MEDIAPIPE_CONFIG } from './tracking/mediapipe';
export type {
  MediaPipeConfig,
  HandTrackingCallback,
  ErrorCallback,
} from './tracking/mediapipe';

// Gesture detection
export {
  GestureDetector,
  detectGesture,
  detectPinch,
  detectOpenHand,
  detectFist,
  detectPoint,
} from './gestures/detector';

// Multi-hand gesture detection
export { MultiHandGestureDetector } from './gestures/multi-hand-detector';

// Built-in gesture plugins
export {
  PinchGesturePlugin,
  OpenHandGesturePlugin,
  FistGesturePlugin,
  PointGesturePlugin,
  SwipeLeftGesturePlugin,
  SwipeRightGesturePlugin,
  SwipeUpGesturePlugin,
  SwipeDownGesturePlugin,
} from './gestures/plugins';
export type { SwipeGestureOptions } from './gestures/plugins';

// Multi-hand gesture plugins
export {
  TwoHandScaleGesturePlugin,
  TwoHandRotateGesturePlugin,
  ClapGesturePlugin,
} from './gestures/plugins';
export type { TwoHandScaleOptions } from './gestures/plugins';

// Coordinate mapping utilities
export {
  mapHandTo3D,
  getIndexFingerTip,
  getThumbTip,
  getWrist,
  getMiddleFingerTip,
  getRingFingerTip,
  getPinkyTip,
  getHandCentroid,
} from './utils/mapping';

// Collision detection utilities
export {
  distance3D,
  isInGrabRange,
  calculateGrabOffset,
  sphereIntersectsSphere,
  pointInSphere,
  pointInBox,
} from './utils/collision';

// Type exports
export type { Hand, HandLandmark, HandLandmarks, HandState } from './types/hand';
export type {
  GestureType,
  HandGesture,
  GestureSettings,
  SwipeDetectionState,
} from './types/gesture';
export { DEFAULT_GESTURE_SETTINGS } from './types/gesture';
export type { Vector3D } from './utils/mapping';

// Plugin system
export type {
  BasePlugin,
  GesturePlugin,
  InteractionPlugin,
  InteractionEvent,
  InteractionEventType,
  EventListener,
  MultiHandGesturePlugin,
  MultiHandGestureResult,
} from './plugins';
export { PluginRegistry, GesturePluginRegistry } from './plugins';
