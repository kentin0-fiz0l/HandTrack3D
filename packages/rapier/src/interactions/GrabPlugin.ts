/**
 * Grab interaction plugin
 *
 * Handles grab, hold, and throw interactions using a physics adapter.
 * Works with any physics engine that implements PhysicsAdapter.
 */

import * as THREE from 'three';
import type { PhysicsAdapter } from '../adapters/types';
import { BodyType } from '../adapters/types';

/**
 * Configuration for grab interaction
 */
export interface GrabPluginOptions {
  /** Maximum distance to grab objects (default: 0.5) */
  grabRadius?: number;
  /** Velocity multiplier for throwing (default: 60) */
  throwVelocityScale?: number;
  /** Enable physics simulation while grabbed (default: false) */
  simulateWhileGrabbed?: boolean;
}

/**
 * Grabbed object state
 */
interface GrabbedObject<TBody> {
  /** Object ID */
  id: string;
  /** Physics body reference */
  body: TBody;
  /** Grab offset from hand position */
  offset: THREE.Vector3;
  /** Original body type before grab */
  originalBodyType: BodyType;
}

/**
 * Hand state for grab detection
 */
export interface HandState {
  /** Hand ID */
  id: string;
  /** Hand position in 3D space */
  position: THREE.Vector3;
  /** Current gesture */
  gesture: string;
}

/**
 * Grab interaction plugin
 *
 * Implements grab-hold-throw mechanics using a physics adapter.
 * Physics-engine agnostic - works with Rapier, Cannon.js, etc.
 *
 * @example
 * ```typescript
 * import { GrabPlugin, RapierAdapter } from '@handtrack3d/rapier';
 *
 * const adapter = new RapierAdapter();
 * const grabPlugin = new GrabPlugin(adapter, {
 *   grabRadius: 0.5,
 *   throwVelocityScale: 60,
 * });
 *
 * // In your render loop
 * grabPlugin.update(hand, rigidBodies);
 * ```
 */
export class GrabPlugin<TBody = unknown> {
  private adapter: PhysicsAdapter<TBody>;
  private options: Required<GrabPluginOptions>;
  private grabbedObjects = new Map<string, GrabbedObject<TBody>>();
  private previousPositions = new Map<string, THREE.Vector3>();

  /**
   * Create a grab plugin
   * @param adapter - Physics adapter for the engine you're using
   * @param options - Optional configuration
   */
  constructor(adapter: PhysicsAdapter<TBody>, options: GrabPluginOptions = {}) {
    this.adapter = adapter;
    this.options = {
      grabRadius: options.grabRadius ?? 0.5,
      throwVelocityScale: options.throwVelocityScale ?? 60,
      simulateWhileGrabbed: options.simulateWhileGrabbed ?? false,
    };
  }

  /**
   * Update grab state for a hand
   * Call this every frame in your render loop
   *
   * @param hand - Hand state (position, gesture)
   * @param rigidBodies - Map of object IDs to physics bodies
   */
  update(hand: HandState, rigidBodies: Map<string, TBody>): void {
    const isPinching = hand.gesture === 'pinch';
    const isOpen = hand.gesture === 'open';
    const currentlyGrabbed = this.grabbedObjects.get(hand.id);

    // Release logic
    if (currentlyGrabbed && isOpen) {
      this.releaseObject(hand.id, currentlyGrabbed);
      return;
    }

    // Update position if grabbed
    if (currentlyGrabbed) {
      this.updateGrabbedObject(hand, currentlyGrabbed);
      return;
    }

    // Grab logic (only if not currently grabbing)
    if (isPinching && !currentlyGrabbed) {
      this.tryGrabObject(hand, rigidBodies);
    }
  }

  /**
   * Try to grab an object in range
   */
  private tryGrabObject(hand: HandState, rigidBodies: Map<string, TBody>): void {
    // Find closest object in grab range
    type ClosestObject = { id: string; body: TBody; distance: number };
    let closestObject: ClosestObject | null = null;

    rigidBodies.forEach((body, id) => {
      const objectPos = this.adapter.getTranslation(body);
      const distance = hand.position.distanceTo(objectPos);

      if (distance < this.options.grabRadius) {
        if (!closestObject || distance < closestObject.distance) {
          closestObject = { id, body, distance };
        }
      }
    });

    if (closestObject !== null) {
      const closest: ClosestObject = closestObject;
      this.grabObject(hand, closest.id, closest.body);
    }
  }

  /**
   * Grab an object
   */
  private grabObject(hand: HandState, objectId: string, body: TBody): void {
    const objectPos = this.adapter.getTranslation(body);
    const offset = objectPos.clone().sub(hand.position);

    // Store original body type (assume dynamic if no way to query)
    const originalBodyType = BodyType.Dynamic;

    this.grabbedObjects.set(hand.id, {
      id: objectId,
      body,
      offset,
      originalBodyType,
    });

    // Make kinematic (controlled by hand, not physics)
    this.adapter.setBodyType(body, BodyType.Kinematic);
    this.adapter.setLinearVelocity(body, new THREE.Vector3(0, 0, 0));

    // Initialize previous position for velocity calculation
    this.previousPositions.set(objectId, objectPos.clone());
  }

  /**
   * Update grabbed object position
   */
  private updateGrabbedObject(hand: HandState, grabbed: GrabbedObject<TBody>): void {
    const newPos = hand.position.clone().add(grabbed.offset);
    this.adapter.setTranslation(grabbed.body, newPos);

    // Update previous position for velocity calculation
    this.previousPositions.set(grabbed.id, newPos);
  }

  /**
   * Release object with throw velocity
   */
  private releaseObject(handId: string, grabbed: GrabbedObject<TBody>): void {
    const currentPos = this.adapter.getTranslation(grabbed.body);
    const prevPos = this.previousPositions.get(grabbed.id);

    // Calculate throw velocity
    const velocity = new THREE.Vector3(0, 0, 0);
    if (prevPos) {
      velocity.subVectors(currentPos, prevPos).multiplyScalar(this.options.throwVelocityScale);
    }

    // Restore original body type (dynamic)
    this.adapter.setBodyType(grabbed.body, grabbed.originalBodyType);
    this.adapter.setLinearVelocity(grabbed.body, velocity);

    // Clean up
    this.grabbedObjects.delete(handId);
    this.previousPositions.delete(grabbed.id);
  }

  /**
   * Check if an object is currently grabbed by any hand
   * @param objectId - Object ID to check
   * @returns True if object is grabbed
   */
  isGrabbed(objectId: string): boolean {
    for (const grabbed of this.grabbedObjects.values()) {
      if (grabbed.id === objectId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if an object is grabbed by a specific hand
   * @param handId - Hand ID
   * @param objectId - Object ID
   * @returns True if object is grabbed by this hand
   */
  isGrabbedBy(handId: string, objectId: string): boolean {
    const grabbed = this.grabbedObjects.get(handId);
    return grabbed ? grabbed.id === objectId : false;
  }

  /**
   * Get the object grabbed by a specific hand
   * @param handId - Hand ID
   * @returns Object ID if grabbed, undefined otherwise
   */
  getGrabbedObject(handId: string): string | undefined {
    return this.grabbedObjects.get(handId)?.id;
  }

  /**
   * Force release all grabbed objects
   */
  releaseAll(): void {
    this.grabbedObjects.forEach((grabbed, handId) => {
      this.releaseObject(handId, grabbed);
    });
  }

  /**
   * Force release object from a specific hand
   * @param handId - Hand ID
   */
  releaseHand(handId: string): void {
    const grabbed = this.grabbedObjects.get(handId);
    if (grabbed) {
      this.releaseObject(handId, grabbed);
    }
  }
}
