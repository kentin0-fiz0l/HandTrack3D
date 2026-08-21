import type { HandLandmark } from '../types/hand';
import type { GestureSettings, GestureType } from '../types/gesture';
import { DEFAULT_GESTURE_SETTINGS } from '../types/gesture';
import type { MultiHandGesturePlugin } from '../plugins/multi-hand-types';

/**
 * Registry for multi-hand gesture plugins
 */
class MultiHandGesturePluginRegistry {
  private plugins: Map<string, MultiHandGesturePlugin> = new Map();

  /**
   * Register a multi-hand gesture plugin
   */
  register(plugin: MultiHandGesturePlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(
        `Plugin "${plugin.name}" is already registered. Unregister it first or use a unique name.`
      );
    }

    plugin.initialize?.();
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Unregister a plugin by name
   */
  unregister(name: string): boolean {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.dispose?.();
      return this.plugins.delete(name);
    }
    return false;
  }

  /**
   * Get all plugins sorted by priority (highest first)
   */
  list(): MultiHandGesturePlugin[] {
    return Array.from(this.plugins.values()).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Check if a plugin is registered
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Clear all plugins
   */
  clear(): void {
    for (const plugin of this.plugins.values()) {
      plugin.dispose?.();
    }
    this.plugins.clear();
  }
}

/**
 * Multi-hand gesture detector
 *
 * Detects gestures that require multiple hands (scale, rotate, clap).
 * Unlike GestureDetector which works with a single hand, this detector
 * takes an array of hands and checks multi-hand gestures.
 *
 * @example
 * ```typescript
 * import { MultiHandGestureDetector } from '@handtrack3d/core';
 * import { TwoHandScaleGesturePlugin } from '@handtrack3d/core';
 *
 * const detector = new MultiHandGestureDetector();
 * detector.registerGesture(new TwoHandScaleGesturePlugin());
 *
 * // With hand tracking results
 * const hands = [leftHandLandmarks, rightHandLandmarks];
 * const gesture = detector.detectGesture(hands);
 *
 * if (gesture === 'scale') {
 *   console.log('User is scaling!');
 * }
 * ```
 */
export class MultiHandGestureDetector {
  private settings: GestureSettings;
  private pluginRegistry: MultiHandGesturePluginRegistry;

  /**
   * Create a new multi-hand gesture detector
   *
   * @param settings - Optional gesture detection settings
   *
   * @example
   * ```typescript
   * const detector = new MultiHandGestureDetector({
   *   pinchThreshold: 0.05,
   * });
   * ```
   */
  constructor(settings: Partial<GestureSettings> = {}) {
    this.settings = { ...DEFAULT_GESTURE_SETTINGS, ...settings };
    this.pluginRegistry = new MultiHandGesturePluginRegistry();
  }

  /**
   * Update gesture settings
   */
  updateSettings(settings: Partial<GestureSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current gesture settings
   */
  getSettings(): GestureSettings {
    return { ...this.settings };
  }

  /**
   * Register a multi-hand gesture plugin
   *
   * @param plugin - Multi-hand gesture plugin to register
   *
   * @example
   * ```typescript
   * detector.registerGesture(new TwoHandScaleGesturePlugin());
   * detector.registerGesture(new TwoHandRotateGesturePlugin());
   * detector.registerGesture(new ClapGesturePlugin());
   * ```
   */
  registerGesture(plugin: MultiHandGesturePlugin): void {
    this.pluginRegistry.register(plugin);
  }

  /**
   * Unregister a gesture plugin by name
   *
   * @param name - Plugin name to unregister
   * @returns True if plugin was found and removed
   *
   * @example
   * ```typescript
   * detector.unregisterGesture('two-hand:scale');
   * ```
   */
  unregisterGesture(name: string): boolean {
    return this.pluginRegistry.unregister(name);
  }

  /**
   * Get all registered gesture plugins
   *
   * @returns Array of registered plugins (sorted by priority)
   */
  getGesturePlugins(): MultiHandGesturePlugin[] {
    return this.pluginRegistry.list();
  }

  /**
   * Check if a gesture plugin is registered
   *
   * @param name - Plugin name
   * @returns True if plugin exists
   */
  hasGesture(name: string): boolean {
    return this.pluginRegistry.has(name);
  }

  /**
   * Detect multi-hand gesture from array of hands
   *
   * @param hands - Array of hand landmarks (one per hand)
   * @returns Detected gesture type or 'none'
   *
   * @example
   * ```typescript
   * // With two hands
   * const gesture = detector.detectGesture([leftHand, rightHand]);
   * if (gesture === 'scale') {
   *   console.log('Scaling detected!');
   * }
   * ```
   */
  detectGesture(hands: HandLandmark[][]): GestureType {
    // Check plugins in priority order (highest priority first)
    for (const plugin of this.pluginRegistry.list()) {
      // Skip if not enough hands
      if (hands.length < plugin.requiredHands) {
        continue;
      }

      // Check if plugin detects the gesture
      if (plugin.detect(hands, this.settings)) {
        return plugin.gestureType as GestureType;
      }
    }

    return 'none';
  }

  /**
   * Detect gestures with detailed result
   *
   * Returns both the gesture type and additional metadata.
   *
   * @param hands - Array of hand landmarks
   * @returns Gesture type and metadata
   *
   * @example
   * ```typescript
   * const result = detector.detectGestureDetailed([leftHand, rightHand]);
   * console.log(`Gesture: ${result.type}, Hands: ${result.handCount}`);
   * ```
   */
  detectGestureDetailed(hands: HandLandmark[][]) {
    const gestureType = this.detectGesture(hands);

    return {
      type: gestureType,
      handCount: hands.length,
      timestamp: Date.now(),
    };
  }

  /**
   * Clear all registered gestures and dispose resources
   */
  dispose(): void {
    this.pluginRegistry.clear();
  }
}
