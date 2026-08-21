/**
 * Plugin system types for HandTrack3D
 *
 * This module defines the base interfaces for the plugin system,
 * enabling developers to extend HandTrack3D with custom gestures,
 * interactions, and physics adapters.
 */

import type { HandLandmark } from '../types/hand';
import type { GestureSettings } from '../types/gesture';

/**
 * Base plugin interface
 * All plugins must implement this interface
 */
export interface BasePlugin {
  /** Unique plugin identifier (e.g., "builtin:pinch", "custom:thumbs-up") */
  readonly name: string;

  /** Plugin version (semantic versioning recommended) */
  readonly version?: string;

  /** Optional initialization logic */
  initialize?(): void | Promise<void>;

  /** Optional cleanup logic */
  dispose?(): void | Promise<void>;
}

/**
 * Gesture detection plugin
 *
 * Enables custom gesture recognition algorithms. Gestures are checked
 * in priority order (highest priority first). The first plugin that
 * returns true from detect() will determine the current gesture.
 *
 * @example
 * ```typescript
 * class ThumbsUpPlugin implements GesturePlugin {
 *   readonly name = 'asl:thumbs-up';
 *   readonly priority = 70;
 *   readonly gestureType = 'thumbs-up';
 *
 *   detect(landmarks: HandLandmark[]): boolean {
 *     const thumbTip = landmarks[4];
 *     const thumbBase = landmarks[2];
 *     return thumbTip.y < thumbBase.y; // Thumb pointing up
 *   }
 * }
 * ```
 */
export interface GesturePlugin extends BasePlugin {
  /**
   * Detection priority (0-100)
   * Higher priority plugins are checked first
   * Built-in gestures use 80 for pinch, 60 for point, 40 for fist/open
   */
  readonly priority: number;

  /**
   * Gesture type identifier
   * This value is returned when the gesture is detected
   */
  readonly gestureType: string;

  /**
   * Detect if this gesture is currently active
   * @param landmarks - Hand landmarks from MediaPipe
   * @param settings - Gesture detection settings (thresholds, etc.)
   * @returns True if gesture is detected
   */
  detect(landmarks: HandLandmark[], settings: GestureSettings): boolean;
}

/**
 * Interaction event types
 * Plugins can emit these events to notify subscribers
 */
export type InteractionEventType =
  | 'grab'
  | 'release'
  | 'hover'
  | 'select'
  | 'deselect';

/**
 * Interaction event data
 */
export interface InteractionEvent<T = unknown> {
  /** Event type */
  type: InteractionEventType;
  /** Target object (e.g., THREE.Object3D) */
  target?: T;
  /** Custom event data */
  data?: Record<string, unknown>;
  /** Timestamp */
  timestamp: number;
}

/**
 * Event listener callback
 */
export type EventListener<T = unknown> = (event: InteractionEvent<T>) => void;

/**
 * Interaction plugin for 3D environments
 *
 * Enables custom hand interactions with 3D objects (e.g., grab, point-select, etc.)
 *
 * @example
 * ```typescript
 * class PointSelectPlugin implements InteractionPlugin {
 *   readonly name = 'interaction:point-select';
 *   private listeners = new Map<InteractionEventType, Set<EventListener>>();
 *
 *   update(hand: Hand, cursor: Vector3): void {
 *     if (hand.gesture === 'point') {
 *       // Raycast from index finger
 *       const hit = this.raycast(cursor, hand.landmarks[8]);
 *       if (hit) {
 *         this.emit('select', { target: hit });
 *       }
 *     }
 *   }
 *
 *   on(event: InteractionEventType, listener: EventListener): void {
 *     // ... event registration
 *   }
 * }
 * ```
 */
export interface InteractionPlugin extends BasePlugin {
  /**
   * Update interaction state
   * Called every frame by the interaction system
   * @param hand - Current hand state
   * @param args - Additional context (cursor position, scene objects, etc.)
   */
  update(hand: unknown, ...args: unknown[]): void;

  /**
   * Register event listener
   * @param event - Event type to listen for
   * @param listener - Callback function
   */
  on(event: InteractionEventType, listener: EventListener): void;

  /**
   * Unregister event listener
   * @param event - Event type
   * @param listener - Callback to remove
   */
  off?(event: InteractionEventType, listener: EventListener): void;

  /**
   * Register an object for interaction
   * @param object - Object to make interactive (e.g., THREE.Object3D)
   */
  registerObject?(object: unknown): void;

  /**
   * Unregister an object
   * @param object - Object to remove
   */
  unregisterObject?(object: unknown): void;
}
