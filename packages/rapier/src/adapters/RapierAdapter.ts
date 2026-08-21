/**
 * Rapier physics adapter
 *
 * Wraps Rapier's RigidBody API to implement the PhysicsAdapter interface.
 */

import * as THREE from 'three';
import type { PhysicsAdapter } from './types';
import { BodyType } from './types';

/**
 * Rapier RigidBody interface
 * Re-declaring to avoid direct dependency on @dimforge/rapier3d-compat
 */
export interface RapierRigidBody {
  setBodyType(type: number, wakeUp: boolean): void;
  setLinvel(velocity: { x: number; y: number; z: number }, wakeUp: boolean): void;
  setTranslation(position: { x: number; y: number; z: number }, wakeUp: boolean): void;
  translation(): { x: number; y: number; z: number };
  applyImpulse(impulse: { x: number; y: number; z: number }, wakeUp: boolean): void;
  applyImpulseAtPoint(
    impulse: { x: number; y: number; z: number },
    point: { x: number; y: number; z: number },
    wakeUp: boolean
  ): void;
  setAngvel(velocity: { x: number; y: number; z: number }, wakeUp: boolean): void;
  linvel(): { x: number; y: number; z: number };
  angvel(): { x: number; y: number; z: number };
}

/**
 * Rapier physics engine adapter
 *
 * Provides a unified interface for Rapier physics operations.
 * Compatible with @react-three/rapier's RigidBody refs.
 *
 * @example
 * ```typescript
 * import { RapierAdapter } from '@handtrack3d/rapier';
 * import { GrabPlugin } from '@handtrack3d/rapier';
 *
 * const adapter = new RapierAdapter();
 * const grabPlugin = new GrabPlugin(adapter);
 * ```
 */
export class RapierAdapter implements PhysicsAdapter<RapierRigidBody> {
  /**
   * Set the body type (dynamic, kinematic, or static)
   * @param body - Rapier rigid body
   * @param type - Body type to set
   */
  setBodyType(body: RapierRigidBody, type: BodyType): void {
    body.setBodyType(type, true);
  }

  /**
   * Set linear velocity of the body
   * @param body - Rapier rigid body
   * @param velocity - Velocity vector (THREE.Vector3)
   */
  setLinearVelocity(body: RapierRigidBody, velocity: THREE.Vector3): void {
    body.setLinvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true);
  }

  /**
   * Set position (translation) of the body
   * @param body - Rapier rigid body
   * @param position - Position vector (THREE.Vector3)
   */
  setTranslation(body: RapierRigidBody, position: THREE.Vector3): void {
    body.setTranslation({ x: position.x, y: position.y, z: position.z }, true);
  }

  /**
   * Get current position (translation) of the body
   * @param body - Rapier rigid body
   * @returns Position as THREE.Vector3
   */
  getTranslation(body: RapierRigidBody): THREE.Vector3 {
    const translation = body.translation();
    return new THREE.Vector3(translation.x, translation.y, translation.z);
  }

  /**
   * Apply an impulse to the body
   * @param body - Rapier rigid body
   * @param impulse - Impulse vector (THREE.Vector3)
   * @param point - Optional point of application in world space
   */
  applyImpulse(body: RapierRigidBody, impulse: THREE.Vector3, point?: THREE.Vector3): void {
    if (point) {
      body.applyImpulseAtPoint(
        { x: impulse.x, y: impulse.y, z: impulse.z },
        { x: point.x, y: point.y, z: point.z },
        true
      );
    } else {
      body.applyImpulse({ x: impulse.x, y: impulse.y, z: impulse.z }, true);
    }
  }

  /**
   * Set angular velocity of the body
   * @param body - Rapier rigid body
   * @param velocity - Angular velocity vector
   */
  setAngularVelocity(body: RapierRigidBody, velocity: THREE.Vector3): void {
    body.setAngvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true);
  }

  /**
   * Get linear velocity of the body
   * @param body - Rapier rigid body
   * @returns Velocity as THREE.Vector3
   */
  getLinearVelocity(body: RapierRigidBody): THREE.Vector3 {
    const velocity = body.linvel();
    return new THREE.Vector3(velocity.x, velocity.y, velocity.z);
  }

  /**
   * Get angular velocity of the body
   * @param body - Rapier rigid body
   * @returns Angular velocity as THREE.Vector3
   */
  getAngularVelocity(body: RapierRigidBody): THREE.Vector3 {
    const velocity = body.angvel();
    return new THREE.Vector3(velocity.x, velocity.y, velocity.z);
  }
}
