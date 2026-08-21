/**
 * Physics adapter interfaces
 *
 * These interfaces provide a unified API for different physics engines,
 * allowing HandTrack3D plugins to work with Rapier, Cannon.js, Ammo.js, etc.
 */

import type * as THREE from 'three';

/**
 * Physics body types
 * Maps to common physics engine body types
 */
export enum BodyType {
  /** Fully simulated by physics (affected by forces) */
  Dynamic = 0,
  /** Position controlled by user, affects other bodies */
  Kinematic = 1,
  /** Fixed in place, never moves */
  Static = 2,
}

/**
 * Generic physics adapter interface
 *
 * Provides a unified API for physics operations across different engines.
 * Implement this interface to support a new physics engine.
 *
 * @template TBody - Physics body type (e.g., Rapier's RigidBody)
 *
 * @example
 * ```typescript
 * // Rapier implementation
 * class RapierAdapter implements PhysicsAdapter<RigidBody> {
 *   setBodyType(body: RigidBody, type: BodyType): void {
 *     body.setBodyType(type, true);
 *   }
 *   // ... other methods
 * }
 * ```
 */
export interface PhysicsAdapter<TBody = unknown> {
  /**
   * Set the body type (dynamic, kinematic, or static)
   * @param body - Physics body
   * @param type - Body type to set
   */
  setBodyType(body: TBody, type: BodyType): void;

  /**
   * Set linear velocity of the body
   * @param body - Physics body
   * @param velocity - Velocity vector
   */
  setLinearVelocity(body: TBody, velocity: THREE.Vector3): void;

  /**
   * Set position (translation) of the body
   * @param body - Physics body
   * @param position - Position vector
   */
  setTranslation(body: TBody, position: THREE.Vector3): void;

  /**
   * Get current position (translation) of the body
   * @param body - Physics body
   * @returns Position vector
   */
  getTranslation(body: TBody): THREE.Vector3;

  /**
   * Apply an impulse to the body
   * @param body - Physics body
   * @param impulse - Impulse vector
   * @param point - Optional point of application (world space)
   */
  applyImpulse(body: TBody, impulse: THREE.Vector3, point?: THREE.Vector3): void;

  /**
   * Set angular velocity of the body
   * @param body - Physics body
   * @param velocity - Angular velocity vector
   */
  setAngularVelocity?(body: TBody, velocity: THREE.Vector3): void;

  /**
   * Get linear velocity of the body
   * @param body - Physics body
   * @returns Velocity vector
   */
  getLinearVelocity?(body: TBody): THREE.Vector3;

  /**
   * Get angular velocity of the body
   * @param body - Physics body
   * @returns Angular velocity vector
   */
  getAngularVelocity?(body: TBody): THREE.Vector3;
}
