import * as THREE from 'three';
import { getIndexFingerTip, mapHandTo3D } from '@handtrack3d/core';
import type { Hand } from '@handtrack3d/core';

export interface PointInteractionOptions {
  maxDistance?: number;
  layers?: THREE.Layers;
}

const DEFAULT_OPTIONS: Required<PointInteractionOptions> = {
  maxDistance: 50,
  layers: new THREE.Layers(),
};

/**
 * Point interaction helper for raycasting from finger tip
 *
 * Detects objects being pointed at using raycasting from the index finger tip.
 * Useful for hover effects, selection, or pointing-based interactions.
 *
 * @example
 * ```ts
 * const pointInteraction = new PointInteraction();
 *
 * // Update on every frame
 * const result = pointInteraction.update(hand, camera, objects);
 *
 * if (result.object) {
 *   console.log('Pointing at:', result.object.name);
 *   console.log('Distance:', result.distance);
 * }
 * ```
 */
export class PointInteraction {
  private raycaster: THREE.Raycaster;
  private options: Required<PointInteractionOptions>;
  private currentlyPointed: THREE.Object3D | null = null;

  constructor(options: PointInteractionOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = this.options.maxDistance;

    if (options.layers) {
      this.raycaster.layers = options.layers;
    }
  }

  /**
   * Update interaction based on hand data
   *
   * @param hand - Hand tracking data
   * @param camera - Camera for raycasting
   * @param objects - Objects to test against
   * @returns Intersection result or null
   */
  update(
    hand: Hand,
    camera: THREE.Camera,
    objects: THREE.Object3D[]
  ): { object: THREE.Object3D; point: THREE.Vector3; distance: number } | null {
    // Get index finger tip position
    const indexTip = getIndexFingerTip(hand.landmarks);
    const position3D = mapHandTo3D(indexTip);

    // Calculate ray direction (from finger tip forward)
    const fingerPosition = new THREE.Vector3(position3D.x, position3D.y, position3D.z);

    // Use camera direction as default, or calculate from hand orientation
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);

    // Set up raycaster
    this.raycaster.set(fingerPosition, direction);

    // Perform raycast
    const intersections = this.raycaster.intersectObjects(objects, true);

    if (intersections.length > 0) {
      const first = intersections[0];
      if (first) {
        this.currentlyPointed = first.object;

        return {
          object: first.object,
          point: first.point,
          distance: first.distance,
        };
      }
    }

    this.currentlyPointed = null;
    return null;
  }

  /**
   * Get currently pointed-at object
   */
  getCurrentlyPointed(): THREE.Object3D | null {
    return this.currentlyPointed;
  }

  /**
   * Check if a specific object is being pointed at
   */
  isPointingAt(object: THREE.Object3D): boolean {
    return this.currentlyPointed === object;
  }

  /**
   * Set maximum raycast distance
   */
  setMaxDistance(distance: number): void {
    this.raycaster.far = distance;
  }

  /**
   * Set layers for raycasting
   */
  setLayers(layers: THREE.Layers): void {
    this.raycaster.layers = layers;
  }
}
