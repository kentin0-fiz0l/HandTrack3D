import * as THREE from 'three';
import { detectPinch, detectOpenHand } from '@handtrack3d/core';
import type { Hand } from '@handtrack3d/core';

export interface GrabbedObject {
  object: THREE.Object3D;
  offset: THREE.Vector3;
  initialRotation: THREE.Quaternion;
}

export interface GrabInteractionOptions {
  grabRadius?: number;
  smoothing?: number;
  enableRotation?: boolean;
}

const DEFAULT_OPTIONS: Required<GrabInteractionOptions> = {
  grabRadius: 0.5,
  smoothing: 0.3,
  enableRotation: false,
};

/**
 * Grab interaction helper for Three.js objects
 *
 * Detects pinch gestures and manages grabbing/releasing objects.
 * Works with pure Three.js transforms (no physics engine required).
 *
 * @example
 * ```ts
 * const grabInteraction = new GrabInteraction();
 *
 * // Register grabbable objects
 * grabInteraction.registerObject(cube);
 * grabInteraction.registerObject(sphere);
 *
 * // Update on every frame
 * grabInteraction.update(hand, handCursorPosition);
 *
 * // Check if object is grabbed
 * if (grabInteraction.isGrabbed(cube)) {
 *   console.log('Cube is grabbed!');
 * }
 * ```
 */
export class GrabInteraction {
  private grabbableObjects: Set<THREE.Object3D> = new Set();
  private grabbedObjects: Map<string, GrabbedObject> = new Map();
  private options: Required<GrabInteractionOptions>;
  private previousHandPosition: THREE.Vector3 = new THREE.Vector3();

  constructor(options: GrabInteractionOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Register an object as grabbable
   */
  registerObject(object: THREE.Object3D): void {
    this.grabbableObjects.add(object);
  }

  /**
   * Unregister a grabbable object
   */
  unregisterObject(object: THREE.Object3D): void {
    this.grabbableObjects.delete(object);
    // Release if currently grabbed
    for (const [handId, grabbed] of this.grabbedObjects.entries()) {
      if (grabbed.object === object) {
        this.grabbedObjects.delete(handId);
      }
    }
  }

  /**
   * Update interaction based on hand data
   *
   * @param hand - Hand tracking data
   * @param handPosition - Current hand cursor position in world space
   */
  update(hand: Hand, handPosition: THREE.Vector3): void {
    const handId = `${hand.handedness}-hand`;
    const isPinching = detectPinch(hand.landmarks);
    const isOpen = detectOpenHand(hand.landmarks);

    const currentlyGrabbed = this.grabbedObjects.get(handId);

    // Release logic
    if (currentlyGrabbed && isOpen) {
      this.release(handId);
      this.previousHandPosition.copy(handPosition);
      return;
    }

    // Update position if already grabbed
    if (currentlyGrabbed) {
      const newPosition = handPosition.clone().add(currentlyGrabbed.offset);
      currentlyGrabbed.object.position.lerp(newPosition, this.options.smoothing);

      // Optional: Update rotation based on hand movement
      if (this.options.enableRotation) {
        const movement = new THREE.Vector3().subVectors(handPosition, this.previousHandPosition);
        if (movement.length() > 0.01) {
          const axis = new THREE.Vector3().crossVectors(
            new THREE.Vector3(0, 1, 0),
            movement.normalize()
          );
          const angle = movement.length() * 2;
          const rotation = new THREE.Quaternion().setFromAxisAngle(axis, angle);
          currentlyGrabbed.object.quaternion.multiply(rotation);
        }
      }

      this.previousHandPosition.copy(handPosition);
      return;
    }

    // Grab logic - find nearest object in range
    if (isPinching && !currentlyGrabbed) {
      let nearestObject: THREE.Object3D | null = null;
      let nearestDistance = this.options.grabRadius;

      for (const object of this.grabbableObjects) {
        const distance = handPosition.distanceTo(object.position);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestObject = object;
        }
      }

      if (nearestObject) {
        this.grab(handId, nearestObject, handPosition);
      }
    }

    this.previousHandPosition.copy(handPosition);
  }

  /**
   * Manually grab an object
   */
  grab(handId: string, object: THREE.Object3D, handPosition: THREE.Vector3): void {
    const offset = new THREE.Vector3().subVectors(object.position, handPosition);
    const initialRotation = object.quaternion.clone();

    this.grabbedObjects.set(handId, {
      object,
      offset,
      initialRotation,
    });
  }

  /**
   * Manually release grabbed object
   */
  release(handId: string): void {
    this.grabbedObjects.delete(handId);
  }

  /**
   * Check if an object is currently grabbed
   */
  isGrabbed(object: THREE.Object3D): boolean {
    for (const grabbed of this.grabbedObjects.values()) {
      if (grabbed.object === object) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if an object is grabbable
   */
  isGrabbable(object: THREE.Object3D): boolean {
    return this.grabbableObjects.has(object);
  }

  /**
   * Get all currently grabbed objects
   */
  getGrabbedObjects(): GrabbedObject[] {
    return Array.from(this.grabbedObjects.values());
  }

  /**
   * Get object grabbed by specific hand
   */
  getGrabbedByHand(handId: string): GrabbedObject | undefined {
    return this.grabbedObjects.get(handId);
  }

  /**
   * Release all grabbed objects
   */
  releaseAll(): void {
    this.grabbedObjects.clear();
  }

  /**
   * Clear all grabbable objects and release all grabs
   */
  clear(): void {
    this.grabbableObjects.clear();
    this.grabbedObjects.clear();
  }
}
