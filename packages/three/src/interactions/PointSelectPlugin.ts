/**
 * Point-to-Select Interaction Plugin (Example)
 *
 * Demonstrates custom interaction plugin for Three.js.
 * Implements gaze-like selection by pointing at objects.
 */

import * as THREE from 'three';

/**
 * Hand state for interaction
 */
export interface HandState {
  id: string;
  position: THREE.Vector3;
  gesture: string;
  /** Index finger tip position (used for raycasting) */
  indexTip?: THREE.Vector3;
  /** Hand forward direction vector */
  forward?: THREE.Vector3;
}

/**
 * Selection event data
 */
export interface SelectionEvent {
  type: 'select' | 'deselect' | 'hover';
  target: THREE.Object3D;
  hand: HandState;
  timestamp: number;
}

/**
 * Point-to-select plugin configuration
 */
export interface PointSelectOptions {
  /** Time in milliseconds to hover before selection (default: 500) */
  hoverDuration?: number;
  /** Maximum raycast distance (default: 10) */
  maxDistance?: number;
  /** Require specific gesture to select (default: 'point') */
  selectGesture?: string;
  /** Visual feedback for hover state */
  showHoverIndicator?: boolean;
}

/**
 * Point-to-Select Interaction Plugin
 *
 * Enables object selection by pointing at them with index finger.
 * Uses raycasting from finger tip in hand direction.
 *
 * Features:
 * - Hover detection with configurable duration
 * - Selection on sustained point gesture
 * - Deselection when pointing away
 * - Event emission for hover/select/deselect
 *
 * @example
 * ```typescript
 * import { PointSelectPlugin } from '@handtrack3d/three';
 *
 * const selectPlugin = new PointSelectPlugin({
 *   hoverDuration: 500,  // 500ms hover to select
 *   maxDistance: 10,     // Raycast up to 10 units
 *   selectGesture: 'point',
 * });
 *
 * // Register selectable objects
 * selectPlugin.registerObject(mesh1);
 * selectPlugin.registerObject(mesh2);
 *
 * // Listen for selection events
 * selectPlugin.on('select', (event) => {
 *   console.log('Selected:', event.target.name);
 * });
 *
 * // In your render loop
 * useFrame(() => {
 *   const hand = {
 *     id: 'right',
 *     position: cursor.position,
 *     gesture: 'point',
 *     indexTip: landmarks[8],
 *     forward: new THREE.Vector3(0, 0, -1),
 *   };
 *   selectPlugin.update(hand);
 * });
 * ```
 */
export class PointSelectPlugin {
  readonly name = 'interaction:point-select';
  readonly version = '1.0.0';

  private options: Required<PointSelectOptions>;
  private selectableObjects: Set<THREE.Object3D> = new Set();
  private listeners = new Map<string, Set<(event: SelectionEvent) => void>>();
  private raycaster = new THREE.Raycaster();

  // Hover tracking
  private hoveredObject: THREE.Object3D | null = null;
  private hoverStartTime: number | null = null;
  private selectedObject: THREE.Object3D | null = null;

  constructor(options: PointSelectOptions = {}) {
    this.options = {
      hoverDuration: options.hoverDuration ?? 500,
      maxDistance: options.maxDistance ?? 10,
      selectGesture: options.selectGesture ?? 'point',
      showHoverIndicator: options.showHoverIndicator ?? true,
    };

    this.raycaster.far = this.options.maxDistance;
  }

  /**
   * Register an object for selection
   */
  registerObject(object: THREE.Object3D): void {
    this.selectableObjects.add(object);
  }

  /**
   * Unregister an object
   */
  unregisterObject(object: THREE.Object3D): void {
    this.selectableObjects.delete(object);

    // Clear selection if this was selected
    if (this.selectedObject === object) {
      this.deselectObject(object);
    }
  }

  /**
   * Register event listener
   */
  on(event: 'select' | 'deselect' | 'hover', listener: (event: SelectionEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Unregister event listener
   */
  off(event: 'select' | 'deselect' | 'hover', listener: (event: SelectionEvent) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(type: 'select' | 'deselect' | 'hover', target: THREE.Object3D, hand: HandState): void {
    const event: SelectionEvent = {
      type,
      target,
      hand,
      timestamp: Date.now(),
    };

    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }

  /**
   * Update interaction state (call every frame)
   */
  update(hand: HandState): void {
    // Only process if using select gesture
    if (hand.gesture !== this.options.selectGesture) {
      this.clearHover();
      return;
    }

    // Setup raycast from index finger
    const origin = hand.indexTip || hand.position;
    const direction = hand.forward || new THREE.Vector3(0, 0, -1);

    this.raycaster.set(origin, direction.normalize());

    // Raycast against selectable objects
    const objectsArray = Array.from(this.selectableObjects);
    const intersects = this.raycaster.intersectObjects(objectsArray, true);

    if (intersects.length > 0 && intersects[0]) {
      const hitObject = this.findSelectableParent(intersects[0].object);

      if (hitObject) {
        this.handleHover(hitObject, hand);
      } else {
        this.clearHover();
      }
    } else {
      this.clearHover();
    }
  }

  /**
   * Find the registered selectable object in the parent chain
   */
  private findSelectableParent(object: THREE.Object3D): THREE.Object3D | null {
    let current: THREE.Object3D | null = object;

    while (current) {
      if (this.selectableObjects.has(current)) {
        return current;
      }
      current = current.parent;
    }

    return null;
  }

  /**
   * Handle hover state
   */
  private handleHover(object: THREE.Object3D, hand: HandState): void {
    const now = Date.now();

    // New object being hovered
    if (object !== this.hoveredObject) {
      this.hoveredObject = object;
      this.hoverStartTime = now;
      this.emit('hover', object, hand);
      return;
    }

    // Continue hovering - check if duration reached
    if (this.hoverStartTime && now - this.hoverStartTime >= this.options.hoverDuration) {
      this.selectObject(object, hand);
      this.hoverStartTime = null; // Prevent re-selection
    }
  }

  /**
   * Clear hover state
   */
  private clearHover(): void {
    this.hoveredObject = null;
    this.hoverStartTime = null;
  }

  /**
   * Select an object
   */
  private selectObject(object: THREE.Object3D, hand: HandState): void {
    // Deselect previous if different
    if (this.selectedObject && this.selectedObject !== object) {
      this.deselectObject(this.selectedObject, hand);
    }

    if (this.selectedObject !== object) {
      this.selectedObject = object;
      this.emit('select', object, hand);
    }
  }

  /**
   * Deselect an object
   */
  private deselectObject(object: THREE.Object3D, hand?: HandState): void {
    if (this.selectedObject === object) {
      this.selectedObject = null;
      this.emit('deselect', object, hand || { id: '', position: new THREE.Vector3(), gesture: '' });
    }
  }

  /**
   * Get currently selected object
   */
  getSelectedObject(): THREE.Object3D | null {
    return this.selectedObject;
  }

  /**
   * Get currently hovered object
   */
  getHoveredObject(): THREE.Object3D | null {
    return this.hoveredObject;
  }

  /**
   * Get hover progress (0-1)
   */
  getHoverProgress(): number {
    if (!this.hoverStartTime) return 0;
    const elapsed = Date.now() - this.hoverStartTime;
    return Math.min(elapsed / this.options.hoverDuration, 1);
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    if (this.selectedObject) {
      this.deselectObject(this.selectedObject);
    }
    this.clearHover();
  }

  /**
   * Dispose plugin
   */
  dispose(): void {
    this.selectableObjects.clear();
    this.listeners.clear();
    this.selectedObject = null;
    this.hoveredObject = null;
    this.hoverStartTime = null;
  }
}
