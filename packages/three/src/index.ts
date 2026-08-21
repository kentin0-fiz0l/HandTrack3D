/**
 * @handtrack3d/three
 *
 * Three.js integration for hand tracking with MediaPipe
 * Provides pure Three.js classes and React Three Fiber components
 */

export const version = '0.1.0-alpha.0';

// Pure Three.js classes - can be used without React
export { HandCursor3D } from './cursors/HandCursor3D';
export type { HandCursor3DOptions } from './cursors/HandCursor3D';

export { HandSkeleton3D } from './cursors/HandSkeleton3D';
export type { HandSkeleton3DOptions } from './cursors/HandSkeleton3D';

// Interaction helpers - pure Three.js
export { GrabInteraction } from './interactions/GrabInteraction';
export type {
  GrabbedObject,
  GrabInteractionOptions,
} from './interactions/GrabInteraction';

export { PointInteraction } from './interactions/PointInteraction';
export type { PointInteractionOptions } from './interactions/PointInteraction';

export { PinchToZoomInteraction } from './interactions/PinchToZoomInteraction';
export type { PinchToZoomInteractionOptions } from './interactions/PinchToZoomInteraction';

// Coordinate mapping utilities
export {
  landmarkToVector3,
  landmarksToVector3Array,
  projectToScreen,
  screenToRay,
  screenToWorld,
  getLandmarksBoundingBox,
  getLandmarksCenter,
  customMapping,
  lerpVector3D,
  smoothDampVector3D,
} from './utils/mapping';

// Re-export core types for convenience
export type {
  Hand,
  HandLandmark,
  HandLandmarks,
  HandState,
  GestureType,
  HandGesture,
  Vector3D,
} from '@handtrack3d/core';

// Re-export core utilities
export {
  detectGesture,
  detectPinch,
  detectOpenHand,
  detectFist,
  detectPoint,
  distance3D,
  isInGrabRange,
  calculateGrabOffset,
} from '@handtrack3d/core';
