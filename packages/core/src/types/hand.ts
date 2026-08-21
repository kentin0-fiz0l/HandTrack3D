/**
 * Represents a single hand landmark in 3D space
 */
export interface HandLandmark {
  /** X coordinate (0-1, left to right) */
  x: number;
  /** Y coordinate (0-1, top to bottom) */
  y: number;
  /** Z coordinate (depth, negative = closer to camera) */
  z: number;
}

/**
 * Array of hand landmarks (21 points per hand)
 */
export type HandLandmarks = HandLandmark[];

/**
 * Detected hand with landmarks and metadata
 */
export interface Hand {
  /** Unique identifier for this hand */
  id: string;
  /** Which hand (Left or Right) */
  handedness: 'Left' | 'Right';
  /** Normalized screen-space landmarks (0-1 range) */
  landmarks: HandLandmarks;
  /** Real-world 3D landmarks (in meters from wrist) */
  worldLandmarks: HandLandmarks;
}

/**
 * Current state of hand tracking
 */
export interface HandState {
  /** Array of currently detected hands */
  hands: Hand[];
  /** Current frames per second */
  fps: number;
  /** Timestamp of last update */
  lastUpdate: number;
}
