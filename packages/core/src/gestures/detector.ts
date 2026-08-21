import type { HandLandmark } from '../types/hand';
import type { GestureType, GestureSettings } from '../types/gesture';
import { DEFAULT_GESTURE_SETTINGS } from '../types/gesture';
import type { GesturePlugin } from '../plugins';
import { GesturePluginRegistry } from '../plugins';
import {
  PinchGesturePlugin,
  OpenHandGesturePlugin,
  FistGesturePlugin,
  PointGesturePlugin,
} from './plugins';

/**
 * Calculate Euclidean distance between two landmarks
 * @param a - First landmark
 * @param b - Second landmark
 * @returns Distance between landmarks
 */
function distance(a: HandLandmark, b: HandLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate angle at a joint formed by three landmarks (in degrees)
 * @param a - First landmark
 * @param b - Joint landmark (vertex)
 * @param c - Third landmark
 * @returns Angle in degrees (0-180)
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
 * @param landmarks - Array of hand landmarks
 * @param fingerIndices - Indices of landmarks forming the finger
 * @param threshold - Angle threshold for extension
 * @returns True if finger is extended
 */
function isFingerExtended(
  landmarks: HandLandmark[],
  fingerIndices: number[],
  threshold: number
): boolean {
  // Check angles at each joint
  const angles = [];
  for (let i = 0; i < fingerIndices.length - 2; i++) {
    const angle = calculateAngle(
      landmarks[fingerIndices[i]],
      landmarks[fingerIndices[i + 1]],
      landmarks[fingerIndices[i + 2]]
    );
    angles.push(angle);
  }

  // Finger is extended if all joint angles exceed threshold
  return angles.every((angle) => angle > threshold);
}

/**
 * Detect pinch gesture (thumb and index finger close together)
 * @param landmarks - Hand landmarks
 * @param settings - Gesture detection settings
 * @returns True if pinch detected
 */
export function detectPinch(
  landmarks: HandLandmark[],
  settings: GestureSettings = DEFAULT_GESTURE_SETTINGS
): boolean {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const dist = distance(thumbTip, indexTip);

  return dist < settings.pinchThreshold;
}

/**
 * Detect open hand gesture (all fingers extended)
 * @param landmarks - Hand landmarks
 * @param settings - Gesture detection settings
 * @returns True if open hand detected
 */
export function detectOpenHand(
  landmarks: HandLandmark[],
  settings: GestureSettings = DEFAULT_GESTURE_SETTINGS
): boolean {
  // Check each finger
  const thumb = isFingerExtended(landmarks, [1, 2, 3, 4], settings.fingerExtensionAngle);
  const index = isFingerExtended(landmarks, [5, 6, 7, 8], settings.fingerExtensionAngle);
  const middle = isFingerExtended(landmarks, [9, 10, 11, 12], settings.fingerExtensionAngle);
  const ring = isFingerExtended(landmarks, [13, 14, 15, 16], settings.fingerExtensionAngle);
  const pinky = isFingerExtended(landmarks, [17, 18, 19, 20], settings.fingerExtensionAngle);

  // All fingers must be extended
  return thumb && index && middle && ring && pinky;
}

/**
 * Detect fist gesture (all fingers curled)
 * @param landmarks - Hand landmarks
 * @param settings - Gesture detection settings
 * @returns True if fist detected
 */
export function detectFist(
  landmarks: HandLandmark[],
  settings: GestureSettings = DEFAULT_GESTURE_SETTINGS
): boolean {
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

/**
 * Detect point gesture (index finger extended, others curled)
 * @param landmarks - Hand landmarks
 * @param settings - Gesture detection settings
 * @returns True if point detected
 */
export function detectPoint(
  landmarks: HandLandmark[],
  settings: GestureSettings = DEFAULT_GESTURE_SETTINGS
): boolean {
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

/**
 * Gesture detector class for stateful gesture recognition with plugin support
 */
export class GestureDetector {
  private settings: GestureSettings;
  private pluginRegistry: GesturePluginRegistry;

  /**
   * Create a new gesture detector
   * @param settings - Optional gesture detection settings
   * @param options - Optional configuration
   * @param options.registerBuiltins - Auto-register built-in gestures (default: true)
   */
  constructor(
    settings: Partial<GestureSettings> = {},
    options: { registerBuiltins?: boolean } = {}
  ) {
    this.settings = { ...DEFAULT_GESTURE_SETTINGS, ...settings };
    this.pluginRegistry = new GesturePluginRegistry();

    // Auto-register built-in gesture plugins by default
    const { registerBuiltins = true } = options;
    if (registerBuiltins) {
      this.registerGesture(new PinchGesturePlugin());
      this.registerGesture(new PointGesturePlugin());
      this.registerGesture(new FistGesturePlugin());
      this.registerGesture(new OpenHandGesturePlugin());
    }
  }

  /**
   * Update gesture detection settings
   * @param settings - Partial settings to update
   */
  updateSettings(settings: Partial<GestureSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current settings
   * @returns Current gesture detection settings
   */
  getSettings(): GestureSettings {
    return { ...this.settings };
  }

  /**
   * Register a custom gesture plugin
   * @param plugin - Gesture plugin to register
   * @example
   * ```typescript
   * const detector = new GestureDetector();
   * detector.registerGesture(new ThumbsUpPlugin());
   * ```
   */
  registerGesture(plugin: GesturePlugin): void {
    this.pluginRegistry.register(plugin);
  }

  /**
   * Unregister a gesture plugin by name
   * @param name - Plugin name to unregister
   * @returns True if plugin was found and removed
   * @example
   * ```typescript
   * detector.unregisterGesture('builtin:pinch'); // Disable pinch detection
   * ```
   */
  unregisterGesture(name: string): boolean {
    return this.pluginRegistry.unregister(name);
  }

  /**
   * Get all registered gesture plugins
   * @returns Array of registered plugins (sorted by priority)
   */
  getGesturePlugins(): GesturePlugin[] {
    return this.pluginRegistry.list();
  }

  /**
   * Check if a gesture plugin is registered
   * @param name - Plugin name
   * @returns True if plugin exists
   */
  hasGesture(name: string): boolean {
    return this.pluginRegistry.has(name);
  }

  /**
   * Detect gesture from hand landmarks using registered plugins
   * @param landmarks - Hand landmarks
   * @returns Detected gesture type
   */
  detectGesture(landmarks: HandLandmark[]): GestureType {
    // Check plugins in priority order (highest priority first)
    for (const plugin of this.pluginRegistry.list()) {
      if (plugin.detect(landmarks, this.settings)) {
        return plugin.gestureType as GestureType;
      }
    }

    return 'none';
  }
}

/**
 * Detect gesture from hand landmarks (standalone function)
 * @param landmarks - Hand landmarks
 * @param settings - Optional gesture detection settings
 * @returns Detected gesture type
 */
export function detectGesture(
  landmarks: HandLandmark[],
  settings: GestureSettings = DEFAULT_GESTURE_SETTINGS
): GestureType {
  // Check gestures in priority order
  if (detectPinch(landmarks, settings)) {
    return 'pinch';
  }
  if (detectPoint(landmarks, settings)) {
    return 'point';
  }
  if (detectFist(landmarks, settings)) {
    return 'fist';
  }
  if (detectOpenHand(landmarks, settings)) {
    return 'open';
  }
  return 'none';
}
