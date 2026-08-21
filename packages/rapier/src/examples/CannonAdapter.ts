/**
 * Cannon.js Physics Adapter (Example)
 *
 * Demonstrates how to implement PhysicsAdapter for Cannon.js physics engine.
 * This is a reference implementation showing all required methods.
 *
 * Note: This is an example only. To use it, install cannon-es:
 * npm install cannon-es
 */

import * as THREE from 'three';
import type { PhysicsAdapter } from '../adapters/types';
import { BodyType } from '../adapters/types';

/**
 * Cannon.js Body interface (minimal subset)
 *
 * This interface represents the Cannon.js Body API.
 * In actual usage, you would import from 'cannon-es'.
 */
interface CannonBody {
  type: number;
  velocity: { x: number; y: number; z: number };
  angularVelocity: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  applyImpulse(impulse: { x: number; y: number; z: number }, point?: { x: number; y: number; z: number }): void;
}

/**
 * Cannon.js constants
 *
 * In actual Cannon.js:
 * - DYNAMIC = 1
 * - KINEMATIC = 4
 * - STATIC = 2
 */
const CANNON_BODY_TYPES = {
  DYNAMIC: 1,
  STATIC: 2,
  KINEMATIC: 4,
} as const;

/**
 * Cannon.js Physics Adapter
 *
 * Implements PhysicsAdapter interface for Cannon.js physics engine.
 * Provides unified API for HandTrack3D interactions.
 *
 * @example
 * ```typescript
 * import * as CANNON from 'cannon-es';
 * import { CannonAdapter } from '@handtrack3d/rapier/examples';
 * import { GrabPlugin } from '@handtrack3d/rapier';
 *
 * // Create adapter
 * const adapter = new CannonAdapter();
 *
 * // Use with GrabPlugin
 * const grabPlugin = new GrabPlugin(adapter);
 *
 * // In your physics world
 * const body = new CANNON.Body({
 *   mass: 1,
 *   shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
 * });
 *
 * // GrabPlugin can now control Cannon.js bodies
 * const rigidBodies = new Map([['box1', body]]);
 * grabPlugin.update(hand, rigidBodies);
 * ```
 */
export class CannonAdapter implements PhysicsAdapter<CannonBody> {
  /**
   * Set the body type (dynamic, kinematic, or static)
   *
   * Maps HandTrack3D body types to Cannon.js types:
   * - Dynamic (0) → CANNON.Body.DYNAMIC (1)
   * - Kinematic (1) → CANNON.Body.KINEMATIC (4)
   * - Static (2) → CANNON.Body.STATIC (2)
   */
  setBodyType(body: CannonBody, type: BodyType): void {
    switch (type) {
      case BodyType.Dynamic:
        body.type = CANNON_BODY_TYPES.DYNAMIC;
        break;
      case BodyType.Kinematic:
        body.type = CANNON_BODY_TYPES.KINEMATIC;
        break;
      case BodyType.Static:
        body.type = CANNON_BODY_TYPES.STATIC;
        break;
    }
  }

  /**
   * Set linear velocity of the body
   *
   * Cannon.js uses its own Vec3 class, so we convert from THREE.Vector3.
   */
  setLinearVelocity(body: CannonBody, velocity: THREE.Vector3): void {
    body.velocity.x = velocity.x;
    body.velocity.y = velocity.y;
    body.velocity.z = velocity.z;
  }

  /**
   * Set position (translation) of the body
   *
   * Cannon.js uses body.position instead of setTranslation().
   */
  setTranslation(body: CannonBody, position: THREE.Vector3): void {
    body.position.x = position.x;
    body.position.y = position.y;
    body.position.z = position.z;
  }

  /**
   * Get current position (translation) of the body
   *
   * Converts Cannon.js Vec3 to THREE.Vector3.
   */
  getTranslation(body: CannonBody): THREE.Vector3 {
    return new THREE.Vector3(
      body.position.x,
      body.position.y,
      body.position.z
    );
  }

  /**
   * Apply an impulse to the body
   *
   * Cannon.js supports impulses at specific points.
   *
   * @param body - Cannon.js body
   * @param impulse - Impulse vector
   * @param point - Optional world-space point of application
   */
  applyImpulse(body: CannonBody, impulse: THREE.Vector3, point?: THREE.Vector3): void {
    const cannonImpulse = { x: impulse.x, y: impulse.y, z: impulse.z };

    if (point) {
      const cannonPoint = { x: point.x, y: point.y, z: point.z };
      body.applyImpulse(cannonImpulse, cannonPoint);
    } else {
      body.applyImpulse(cannonImpulse);
    }
  }

  /**
   * Set angular velocity of the body
   *
   * Optional method - Cannon.js supports this natively.
   */
  setAngularVelocity(body: CannonBody, velocity: THREE.Vector3): void {
    body.angularVelocity.x = velocity.x;
    body.angularVelocity.y = velocity.y;
    body.angularVelocity.z = velocity.z;
  }

  /**
   * Get linear velocity of the body
   *
   * Optional method - useful for advanced interactions.
   */
  getLinearVelocity(body: CannonBody): THREE.Vector3 {
    return new THREE.Vector3(
      body.velocity.x,
      body.velocity.y,
      body.velocity.z
    );
  }

  /**
   * Get angular velocity of the body
   *
   * Optional method - useful for spin-based interactions.
   */
  getAngularVelocity(body: CannonBody): THREE.Vector3 {
    return new THREE.Vector3(
      body.angularVelocity.x,
      body.angularVelocity.y,
      body.angularVelocity.z
    );
  }
}

/**
 * Usage Example:
 *
 * ```typescript
 * import * as CANNON from 'cannon-es';
 * import { CannonAdapter } from '@handtrack3d/rapier/examples';
 * import { GrabPlugin } from '@handtrack3d/rapier';
 *
 * // Setup Cannon.js world
 * const world = new CANNON.World();
 * world.gravity.set(0, -9.82, 0);
 *
 * // Create physics body
 * const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
 * const body = new CANNON.Body({
 *   mass: 1,
 *   position: new CANNON.Vec3(0, 2, 0),
 * });
 * body.addShape(shape);
 * world.addBody(body);
 *
 * // Create adapter and plugin
 * const adapter = new CannonAdapter();
 * const grabPlugin = new GrabPlugin(adapter, {
 *   grabRadius: 0.5,
 *   throwVelocityScale: 60,
 * });
 *
 * // In your render loop
 * function animate() {
 *   // Update physics
 *   world.step(1/60);
 *
 *   // Update grab interaction
 *   const hand = {
 *     id: 'left',
 *     position: new THREE.Vector3(0, 1, -0.5),
 *     gesture: 'pinch',
 *   };
 *   const rigidBodies = new Map([['box', body]]);
 *   grabPlugin.update(hand, rigidBodies);
 *
 *   // Sync Three.js mesh with Cannon.js body
 *   mesh.position.copy(body.position);
 *   mesh.quaternion.copy(body.quaternion);
 *
 *   requestAnimationFrame(animate);
 * }
 * ```
 *
 * Key Differences from Rapier:
 * 1. Body type constants: Cannon uses DYNAMIC=1, KINEMATIC=4, STATIC=2
 * 2. No wakeUp parameter: Cannon bodies wake automatically
 * 3. Direct property access: body.position vs body.setTranslation()
 * 4. Vec3 class: Cannon uses CANNON.Vec3 instead of plain objects
 *
 * Performance Considerations:
 * - Cannon.js is generally slower than Rapier for complex scenes
 * - Better browser compatibility (pure JavaScript, no WASM)
 * - Good choice for simple physics or broad device support
 */
