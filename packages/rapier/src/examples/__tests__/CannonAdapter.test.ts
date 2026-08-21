import { describe, it, expect, beforeEach } from 'vitest';
import { CannonAdapter } from '../CannonAdapter';
import { BodyType } from '../../adapters/types';
import * as THREE from 'three';

/**
 * Mock Cannon.js Body
 */
class MockCannonBody {
  type: number = 1; // DYNAMIC
  velocity = { x: 0, y: 0, z: 0 };
  angularVelocity = { x: 0, y: 0, z: 0 };
  position = { x: 0, y: 0, z: 0 };
  private impulses: Array<{ impulse: { x: number; y: number; z: number }; point?: { x: number; y: number; z: number } }> = [];

  applyImpulse(impulse: { x: number; y: number; z: number }, point?: { x: number; y: number; z: number }): void {
    this.impulses.push({ impulse, point });

    // Simulate impulse effect on velocity
    this.velocity.x += impulse.x;
    this.velocity.y += impulse.y;
    this.velocity.z += impulse.z;
  }

  getImpulses() {
    return this.impulses;
  }

  clearImpulses() {
    this.impulses = [];
  }
}

describe('CannonAdapter', () => {
  let adapter: CannonAdapter;
  let body: MockCannonBody;

  beforeEach(() => {
    adapter = new CannonAdapter();
    body = new MockCannonBody();
  });

  describe('setBodyType', () => {
    it('should set body to dynamic type', () => {
      adapter.setBodyType(body, BodyType.Dynamic);
      expect(body.type).toBe(1); // CANNON.Body.DYNAMIC
    });

    it('should set body to kinematic type', () => {
      adapter.setBodyType(body, BodyType.Kinematic);
      expect(body.type).toBe(4); // CANNON.Body.KINEMATIC
    });

    it('should set body to static type', () => {
      adapter.setBodyType(body, BodyType.Static);
      expect(body.type).toBe(2); // CANNON.Body.STATIC
    });

    it('should allow switching between types', () => {
      adapter.setBodyType(body, BodyType.Dynamic);
      expect(body.type).toBe(1);

      adapter.setBodyType(body, BodyType.Kinematic);
      expect(body.type).toBe(4);

      adapter.setBodyType(body, BodyType.Static);
      expect(body.type).toBe(2);
    });
  });

  describe('setLinearVelocity', () => {
    it('should set velocity from THREE.Vector3', () => {
      const velocity = new THREE.Vector3(1, 2, 3);
      adapter.setLinearVelocity(body, velocity);

      expect(body.velocity.x).toBe(1);
      expect(body.velocity.y).toBe(2);
      expect(body.velocity.z).toBe(3);
    });

    it('should set zero velocity', () => {
      body.velocity = { x: 5, y: 5, z: 5 };

      const velocity = new THREE.Vector3(0, 0, 0);
      adapter.setLinearVelocity(body, velocity);

      expect(body.velocity.x).toBe(0);
      expect(body.velocity.y).toBe(0);
      expect(body.velocity.z).toBe(0);
    });

    it('should handle negative velocities', () => {
      const velocity = new THREE.Vector3(-10, -5, -2);
      adapter.setLinearVelocity(body, velocity);

      expect(body.velocity.x).toBe(-10);
      expect(body.velocity.y).toBe(-5);
      expect(body.velocity.z).toBe(-2);
    });
  });

  describe('setTranslation', () => {
    it('should set position from THREE.Vector3', () => {
      const position = new THREE.Vector3(10, 20, 30);
      adapter.setTranslation(body, position);

      expect(body.position.x).toBe(10);
      expect(body.position.y).toBe(20);
      expect(body.position.z).toBe(30);
    });

    it('should update position', () => {
      const pos1 = new THREE.Vector3(1, 1, 1);
      adapter.setTranslation(body, pos1);

      const pos2 = new THREE.Vector3(5, 10, 15);
      adapter.setTranslation(body, pos2);

      expect(body.position.x).toBe(5);
      expect(body.position.y).toBe(10);
      expect(body.position.z).toBe(15);
    });

    it('should handle negative positions', () => {
      const position = new THREE.Vector3(-5, -10, -15);
      adapter.setTranslation(body, position);

      expect(body.position.x).toBe(-5);
      expect(body.position.y).toBe(-10);
      expect(body.position.z).toBe(-15);
    });
  });

  describe('getTranslation', () => {
    it('should return position as THREE.Vector3', () => {
      body.position = { x: 7, y: 8, z: 9 };
      const position = adapter.getTranslation(body);

      expect(position).toBeInstanceOf(THREE.Vector3);
      expect(position.x).toBe(7);
      expect(position.y).toBe(8);
      expect(position.z).toBe(9);
    });

    it('should return current position after update', () => {
      const newPos = new THREE.Vector3(100, 200, 300);
      adapter.setTranslation(body, newPos);

      const retrieved = adapter.getTranslation(body);
      expect(retrieved.x).toBe(100);
      expect(retrieved.y).toBe(200);
      expect(retrieved.z).toBe(300);
    });
  });

  describe('applyImpulse', () => {
    it('should apply impulse without point', () => {
      const impulse = new THREE.Vector3(5, 10, 0);
      adapter.applyImpulse(body, impulse);

      const impulses = body.getImpulses();
      expect(impulses).toHaveLength(1);
      expect(impulses[0].impulse).toEqual({ x: 5, y: 10, z: 0 });
      expect(impulses[0].point).toBeUndefined();
    });

    it('should apply impulse with point', () => {
      const impulse = new THREE.Vector3(1, 2, 3);
      const point = new THREE.Vector3(0.5, 0.5, 0.5);
      adapter.applyImpulse(body, impulse, point);

      const impulses = body.getImpulses();
      expect(impulses).toHaveLength(1);
      expect(impulses[0].impulse).toEqual({ x: 1, y: 2, z: 3 });
      expect(impulses[0].point).toEqual({ x: 0.5, y: 0.5, z: 0.5 });
    });

    it('should apply multiple impulses', () => {
      const impulse1 = new THREE.Vector3(1, 0, 0);
      const impulse2 = new THREE.Vector3(0, 1, 0);
      const impulse3 = new THREE.Vector3(0, 0, 1);

      adapter.applyImpulse(body, impulse1);
      adapter.applyImpulse(body, impulse2);
      adapter.applyImpulse(body, impulse3);

      const impulses = body.getImpulses();
      expect(impulses).toHaveLength(3);
    });

    it('should affect body velocity', () => {
      const initialVelocity = { ...body.velocity };
      const impulse = new THREE.Vector3(5, 10, 15);

      adapter.applyImpulse(body, impulse);

      expect(body.velocity.x).toBe(initialVelocity.x + 5);
      expect(body.velocity.y).toBe(initialVelocity.y + 10);
      expect(body.velocity.z).toBe(initialVelocity.z + 15);
    });
  });

  describe('optional methods', () => {
    it('should set angular velocity', () => {
      const angularVel = new THREE.Vector3(1, 2, 3);
      adapter.setAngularVelocity(body, angularVel);

      expect(body.angularVelocity.x).toBe(1);
      expect(body.angularVelocity.y).toBe(2);
      expect(body.angularVelocity.z).toBe(3);
    });

    it('should get linear velocity', () => {
      body.velocity = { x: 10, y: 20, z: 30 };
      const velocity = adapter.getLinearVelocity(body);

      expect(velocity).toBeInstanceOf(THREE.Vector3);
      expect(velocity.x).toBe(10);
      expect(velocity.y).toBe(20);
      expect(velocity.z).toBe(30);
    });

    it('should get angular velocity', () => {
      body.angularVelocity = { x: 5, y: 10, z: 15 };
      const angularVel = adapter.getAngularVelocity(body);

      expect(angularVel).toBeInstanceOf(THREE.Vector3);
      expect(angularVel.x).toBe(5);
      expect(angularVel.y).toBe(10);
      expect(angularVel.z).toBe(15);
    });
  });

  describe('integration scenarios', () => {
    it('should support grab interaction workflow', () => {
      // Initial state: dynamic body
      adapter.setBodyType(body, BodyType.Dynamic);
      expect(body.type).toBe(1);

      // Grab: make kinematic, set position, stop movement
      adapter.setBodyType(body, BodyType.Kinematic);
      adapter.setLinearVelocity(body, new THREE.Vector3(0, 0, 0));
      adapter.setTranslation(body, new THREE.Vector3(1, 2, 3));

      expect(body.type).toBe(4); // Kinematic
      expect(body.velocity.x).toBe(0);
      expect(body.position.x).toBe(1);

      // Release: make dynamic, apply throw impulse
      adapter.setBodyType(body, BodyType.Dynamic);
      const throwVelocity = new THREE.Vector3(5, 5, 0);
      adapter.setLinearVelocity(body, throwVelocity);

      expect(body.type).toBe(1); // Dynamic
      expect(body.velocity.x).toBe(5);
      expect(body.velocity.y).toBe(5);
    });

    it('should support throwing workflow', () => {
      // Start kinematic (being held)
      adapter.setBodyType(body, BodyType.Kinematic);
      adapter.setTranslation(body, new THREE.Vector3(0, 2, 0));

      // Release with velocity
      adapter.setBodyType(body, BodyType.Dynamic);

      // Calculate and apply throw velocity
      const throwVelocity = new THREE.Vector3(10, 5, 0);
      adapter.setLinearVelocity(body, throwVelocity);

      expect(body.type).toBe(1); // Dynamic
      expect(body.velocity.x).toBe(10);
      expect(body.velocity.y).toBe(5);

      // Verify position hasn't changed
      expect(body.position.y).toBe(2);
    });

    it('should support impulse-based throwing', () => {
      adapter.setBodyType(body, BodyType.Dynamic);
      const initialVel = new THREE.Vector3(0, 0, 0);
      adapter.setLinearVelocity(body, initialVel);

      // Apply throw impulse
      const impulse = new THREE.Vector3(50, 30, 0);
      adapter.applyImpulse(body, impulse);

      // Verify impulse was applied
      const impulses = body.getImpulses();
      expect(impulses).toHaveLength(1);
      expect(impulses[0].impulse.x).toBe(50);
      expect(impulses[0].impulse.y).toBe(30);
    });
  });

  describe('type safety', () => {
    it('should accept BodyType enum values', () => {
      // All BodyType enum values should work
      expect(() => adapter.setBodyType(body, BodyType.Dynamic)).not.toThrow();
      expect(() => adapter.setBodyType(body, BodyType.Kinematic)).not.toThrow();
      expect(() => adapter.setBodyType(body, BodyType.Static)).not.toThrow();
    });

    it('should work with THREE.Vector3 instances', () => {
      const vec = new THREE.Vector3(1, 2, 3);

      expect(() => adapter.setLinearVelocity(body, vec)).not.toThrow();
      expect(() => adapter.setTranslation(body, vec)).not.toThrow();
      expect(() => adapter.applyImpulse(body, vec)).not.toThrow();
    });

    it('should return THREE.Vector3 instances', () => {
      const position = adapter.getTranslation(body);
      const velocity = adapter.getLinearVelocity(body);
      const angularVel = adapter.getAngularVelocity(body);

      expect(position).toBeInstanceOf(THREE.Vector3);
      expect(velocity).toBeInstanceOf(THREE.Vector3);
      expect(angularVel).toBeInstanceOf(THREE.Vector3);
    });
  });
});
