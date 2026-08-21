/**
 * @handtrack3d/react
 * React hooks and components for hand tracking
 */

export const version = '0.1.0-alpha.0';

// Hooks
export { useHandTracking } from './hooks/useHandTracking';
export type {
  UseHandTrackingOptions,
  UseHandTrackingReturn,
} from './hooks/useHandTracking';

export {
  useGestureRecognition,
  useMultiHandGestures,
} from './hooks/useGestureRecognition';
export type {
  UseGestureRecognitionOptions,
  UseGestureRecognitionReturn,
} from './hooks/useGestureRecognition';

export { useWebcam } from './hooks/useWebcam';
export type {
  UseWebcamOptions,
  UseWebcamReturn,
} from './hooks/useWebcam';

export {
  useHandTo3DMapping,
  useMultiHandMapping,
} from './hooks/useHandTo3DMapping';
export type {
  UseHandTo3DMappingOptions,
  UseHandTo3DMappingReturn,
  LandmarkType,
} from './hooks/useHandTo3DMapping';

// Provider
export {
  HandTrackingProvider,
  useHandTrackingContext,
} from './providers/HandTrackingProvider';
export type {
  HandTrackingContextValue,
  HandTrackingProviderProps,
} from './providers/HandTrackingProvider';

// Components
export { WebcamView } from './components/WebcamView';
export type { WebcamViewProps } from './components/WebcamView';

export { HandCanvas } from './components/HandCanvas';
export type { HandCanvasProps } from './components/HandCanvas';

// Re-export core types for convenience
export type {
  Hand,
  HandLandmark,
  HandLandmarks,
  HandState,
  GestureType,
  HandGesture,
  GestureSettings,
  MediaPipeConfig,
  Vector3D,
} from '@handtrack3d/core';

export { DEFAULT_GESTURE_SETTINGS } from '@handtrack3d/core';
