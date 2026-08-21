/**
 * Available gesture types
 *
 * Built-in gestures: none, pinch, open, fist, point, swipeLeft, swipeRight, swipeUp, swipeDown
 * Custom gestures can be added via GesturePlugin (any string is allowed)
 */
export type GestureType =
  | 'none'
  | 'pinch'
  | 'open'
  | 'fist'
  | 'point'
  | 'swipeLeft'
  | 'swipeRight'
  | 'swipeUp'
  | 'swipeDown'
  | (string & {}); // Allow custom gesture types via plugins

/**
 * Detected gesture for a specific hand
 */
export interface HandGesture {
  /** ID of the hand performing the gesture */
  handId: string;
  /** Type of gesture detected */
  gesture: GestureType;
  /** Confidence level (0-1) */
  confidence: number;
}

/**
 * Configuration for gesture detection thresholds
 */
export interface GestureSettings {
  /** Distance threshold for pinch detection (0.03 - 0.08) */
  pinchThreshold: number;
  /** Minimum angle for finger extension (140 - 175 degrees) */
  fingerExtensionAngle: number;
  /** Distance threshold for fist detection (0.10 - 0.20) */
  fistCurlThreshold: number;
  /** Minimum angle for point gesture (140 - 175 degrees) */
  pointExtensionAngle: number;
  /** Minimum velocity for swipe detection (0.3 - 1.0) */
  swipeVelocityThreshold: number;
  /** Cooldown between swipe detections in ms (300 - 1000) */
  swipeCooldown: number;
}

/**
 * State tracking for swipe gesture detection
 */
export interface SwipeDetectionState {
  /** History of hand positions for velocity calculation */
  positionHistory: { x: number; y: number; z: number; timestamp: number }[];
  /** Timestamp of last detected swipe */
  lastSwipeTimestamp: number;
}

/**
 * Default gesture detection settings
 */
export const DEFAULT_GESTURE_SETTINGS: GestureSettings = {
  pinchThreshold: 0.05,
  fingerExtensionAngle: 160,
  fistCurlThreshold: 0.15,
  pointExtensionAngle: 160,
  swipeVelocityThreshold: 0.5,
  swipeCooldown: 500,
};
