# Building a Custom Physics Adapter

This tutorial shows you how to create a physics adapter for HandTrack3D, enabling support for different physics engines like Cannon.js, Ammo.js, or custom solutions.

## Prerequisites

- Understanding of physics engines
- Knowledge of rigid body dynamics
- Familiarity with the target physics engine
- Three.js vector mathematics

## What is a Physics Adapter?

A physics adapter translates between HandTrack3D's unified API and a specific physics engine's API. This allows interaction plugins (like GrabPlugin) to work with any physics engine.

## The PhysicsAdapter Interface

```typescript
import * as THREE from 'three';

enum BodyType {
  Dynamic = 0,   // Fully simulated by physics
  Kinematic = 1, // Position-controlled, affects others
  Static = 2,    // Fixed in place
}

interface PhysicsAdapter<TBody = unknown> {
  // Required methods
  setBodyType(body: TBody, type: BodyType): void;
  setLinearVelocity(body: TBody, velocity: THREE.Vector3): void;
  setTranslation(body: TBody, position: THREE.Vector3): void;
  getTranslation(body: TBody): THREE.Vector3;
  applyImpulse(body: TBody, impulse: THREE.Vector3, point?: THREE.Vector3): void;

  // Optional methods
  setAngularVelocity?(body: TBody, velocity: THREE.Vector3): void;
  getLinearVelocity?(body: TBody): THREE.Vector3;
  getAngularVelocity?(body: TBody): THREE.Vector3;
}
```

## Example: Cannon.js Adapter

### Step 1: Understand the Target API

**Cannon.js Body API:**
```typescript
// Body types
CANNON.Body.DYNAMIC   = 1
CANNON.Body.STATIC    = 2
CANNON.Body.KINEMATIC = 4

// Setting properties
body.type = CANNON.Body.DYNAMIC;
body.velocity.set(x, y, z);
body.position.set(x, y, z);
body.applyImpulse(impulseVec3, pointVec3);
```

### Step 2: Map Body Types

```typescript
import * as CANNON from 'cannon-es';
import { BodyType } from '@handtrack3d/rapier';

// HandTrack3D → Cannon.js mapping
const BODY_TYPE_MAP = {
  [BodyType.Dynamic]: CANNON.Body.DYNAMIC,    // 0 → 1
  [BodyType.Kinematic]: CANNON.Body.KINEMATIC, // 1 → 4
  [BodyType.Static]: CANNON.Body.STATIC,      // 2 → 2
};
```

### Step 3: Implement Required Methods

```typescript
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsAdapter, BodyType } from '@handtrack3d/rapier';

export class CannonAdapter implements PhysicsAdapter<CANNON.Body> {
  setBodyType(body: CANNON.Body, type: BodyType): void {
    // Map HandTrack3D type to Cannon type
    switch (type) {
      case BodyType.Dynamic:
        body.type = CANNON.Body.DYNAMIC;
        break;
      case BodyType.Kinematic:
        body.type = CANNON.Body.KINEMATIC;
        break;
      case BodyType.Static:
        body.type = CANNON.Body.STATIC;
        break;
    }
  }

  setLinearVelocity(body: CANNON.Body, velocity: THREE.Vector3): void {
    // Convert THREE.Vector3 to CANNON.Vec3
    body.velocity.set(velocity.x, velocity.y, velocity.z);
  }

  setTranslation(body: CANNON.Body, position: THREE.Vector3): void {
    // Set position (Cannon uses 'position', not 'translation')
    body.position.set(position.x, position.y, position.z);
  }

  getTranslation(body: CANNON.Body): THREE.Vector3 {
    // Convert CANNON.Vec3 to THREE.Vector3
    return new THREE.Vector3(
      body.position.x,
      body.position.y,
      body.position.z
    );
  }

  applyImpulse(
    body: CANNON.Body,
    impulse: THREE.Vector3,
    point?: THREE.Vector3
  ): void {
    const cannonImpulse = new CANNON.Vec3(impulse.x, impulse.y, impulse.z);

    if (point) {
      const cannonPoint = new CANNON.Vec3(point.x, point.y, point.z);
      body.applyImpulse(cannonImpulse, cannonPoint);
    } else {
      body.applyImpulse(cannonImpulse);
    }
  }
}
```

### Step 4: Implement Optional Methods

```typescript
export class CannonAdapter implements PhysicsAdapter<CANNON.Body> {
  // ... required methods ...

  setAngularVelocity(body: CANNON.Body, velocity: THREE.Vector3): void {
    body.angularVelocity.set(velocity.x, velocity.y, velocity.z);
  }

  getLinearVelocity(body: CANNON.Body): THREE.Vector3 {
    return new THREE.Vector3(
      body.velocity.x,
      body.velocity.y,
      body.velocity.z
    );
  }

  getAngularVelocity(body: CANNON.Body): THREE.Vector3 {
    return new THREE.Vector3(
      body.angularVelocity.x,
      body.angularVelocity.y,
      body.angularVelocity.z
    );
  }
}
```

## Step 5: Use with GrabPlugin

```typescript
import { GrabPlugin } from '@handtrack3d/rapier';
import { CannonAdapter } from './CannonAdapter';
import * as CANNON from 'cannon-es';

// Setup Cannon.js world
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Create physics body
const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
const body = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 2, 0),
});
body.addShape(shape);
world.addBody(body);

// Create adapter and plugin
const adapter = new CannonAdapter();
const grabPlugin = new GrabPlugin(adapter, {
  grabRadius: 0.5,
  throwVelocityScale: 60,
});

// In render loop
function animate() {
  world.step(1/60);

  const hand = {
    id: 'right',
    position: new THREE.Vector3(0, 1, -0.5),
    gesture: 'pinch',
  };

  const rigidBodies = new Map([['box', body]]);
  grabPlugin.update(hand, rigidBodies);

  // Sync Three.js mesh
  mesh.position.copy(body.position);
  mesh.quaternion.copy(body.quaternion);

  requestAnimationFrame(animate);
}
```

## Advanced: Ammo.js Adapter

Ammo.js is a WASM port of Bullet Physics, more complex than Cannon.js.

```typescript
import * as THREE from 'three';
import Ammo from 'ammojs-typed';

export class AmmoAdapter implements PhysicsAdapter<Ammo.btRigidBody> {
  setBodyType(body: Ammo.btRigidBody, type: BodyType): void {
    // Ammo uses collision flags
    const flags = body.getCollisionFlags();

    switch (type) {
      case BodyType.Dynamic:
        body.setCollisionFlags(flags & ~2); // Remove kinematic flag
        body.setActivationState(1); // Active
        break;

      case BodyType.Kinematic:
        body.setCollisionFlags(flags | 2); // Set kinematic flag
        body.setActivationState(4); // Disable deactivation
        break;

      case BodyType.Static:
        body.setCollisionFlags(flags | 1); // Set static flag
        body.setActivationState(0); // Island sleeping
        break;
    }
  }

  setLinearVelocity(body: Ammo.btRigidBody, velocity: THREE.Vector3): void {
    const ammoVec = new Ammo.btVector3(velocity.x, velocity.y, velocity.z);
    body.setLinearVelocity(ammoVec);
    Ammo.destroy(ammoVec); // Manual memory management!
  }

  setTranslation(body: Ammo.btRigidBody, position: THREE.Vector3): void {
    const transform = new Ammo.btTransform();
    body.getMotionState().getWorldTransform(transform);

    const origin = new Ammo.btVector3(position.x, position.y, position.z);
    transform.setOrigin(origin);

    body.setWorldTransform(transform);
    body.getMotionState().setWorldTransform(transform);

    // Cleanup
    Ammo.destroy(origin);
    Ammo.destroy(transform);
  }

  getTranslation(body: Ammo.btRigidBody): THREE.Vector3 {
    const transform = new Ammo.btTransform();
    body.getMotionState().getWorldTransform(transform);

    const origin = transform.getOrigin();
    const position = new THREE.Vector3(origin.x(), origin.y(), origin.z());

    Ammo.destroy(transform);

    return position;
  }

  applyImpulse(
    body: Ammo.btRigidBody,
    impulse: THREE.Vector3,
    point?: THREE.Vector3
  ): void {
    const ammoImpulse = new Ammo.btVector3(impulse.x, impulse.y, impulse.z);

    if (point) {
      const ammoPoint = new Ammo.btVector3(point.x, point.y, point.z);
      body.applyImpulse(ammoImpulse, ammoPoint);
      Ammo.destroy(ammoPoint);
    } else {
      body.applyCentralImpulse(ammoImpulse);
    }

    Ammo.destroy(ammoImpulse);
  }
}
```

## Custom Physics Engine Example

For a simple 2D physics engine:

```typescript
interface Simple2DBody {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  mass: number;
  isStatic: boolean;
}

export class Simple2DAdapter implements PhysicsAdapter<Simple2DBody> {
  setBodyType(body: Simple2DBody, type: BodyType): void {
    body.isStatic = type === BodyType.Static;
    // Kinematic = controlled position, still affects others
  }

  setLinearVelocity(body: Simple2DBody, velocity: THREE.Vector3): void {
    body.velocity.x = velocity.x;
    body.velocity.y = velocity.y;
    // Ignore Z in 2D
  }

  setTranslation(body: Simple2DBody, position: THREE.Vector3): void {
    body.position.x = position.x;
    body.position.y = position.y;
  }

  getTranslation(body: Simple2DBody): THREE.Vector3 {
    return new THREE.Vector3(body.position.x, body.position.y, 0);
  }

  applyImpulse(body: Simple2DBody, impulse: THREE.Vector3): void {
    if (body.mass === 0) return; // Static body

    // J = m * Δv  →  Δv = J / m
    body.velocity.x += impulse.x / body.mass;
    body.velocity.y += impulse.y / body.mass;
  }
}
```

## Testing Your Adapter

```typescript
describe('CannonAdapter', () => {
  it('should set body type correctly', () => {
    const body = new CANNON.Body({ mass: 1 });
    const adapter = new CannonAdapter();

    adapter.setBodyType(body, BodyType.Kinematic);
    expect(body.type).toBe(CANNON.Body.KINEMATIC);

    adapter.setBodyType(body, BodyType.Dynamic);
    expect(body.type).toBe(CANNON.Body.DYNAMIC);
  });

  it('should set velocity', () => {
    const body = new CANNON.Body({ mass: 1 });
    const adapter = new CannonAdapter();

    const velocity = new THREE.Vector3(1, 2, 3);
    adapter.setLinearVelocity(body, velocity);

    expect(body.velocity.x).toBe(1);
    expect(body.velocity.y).toBe(2);
    expect(body.velocity.z).toBe(3);
  });

  it('should get/set translation', () => {
    const body = new CANNON.Body({ mass: 1 });
    const adapter = new CannonAdapter();

    const position = new THREE.Vector3(5, 10, 15);
    adapter.setTranslation(body, position);

    const retrieved = adapter.getTranslation(body);
    expect(retrieved.x).toBe(5);
    expect(retrieved.y).toBe(10);
    expect(retrieved.z).toBe(15);
  });

  it('should apply impulse', () => {
    const body = new CANNON.Body({ mass: 1 });
    const adapter = new CannonAdapter();

    const impulse = new THREE.Vector3(10, 0, 0);
    adapter.applyImpulse(body, impulse);

    // Impulse = mass * velocity, so velocity = impulse / mass
    expect(body.velocity.x).toBeCloseTo(10);
  });
});
```

## Common Pitfalls

### 1. Memory Management (Ammo.js)

```typescript
// ❌ Bad: Memory leak
setLinearVelocity(body: Ammo.btRigidBody, velocity: THREE.Vector3): void {
  const ammoVec = new Ammo.btVector3(velocity.x, velocity.y, velocity.z);
  body.setLinearVelocity(ammoVec);
  // ammoVec is never destroyed!
}

// ✅ Good: Cleanup
setLinearVelocity(body: Ammo.btRigidBody, velocity: THREE.Vector3): void {
  const ammoVec = new Ammo.btVector3(velocity.x, velocity.y, velocity.z);
  body.setLinearVelocity(ammoVec);
  Ammo.destroy(ammoVec);
}
```

### 2. Coordinate System Differences

```typescript
// Some engines use Y-up, others Z-up
getTranslation(body: CustomBody): THREE.Vector3 {
  // If engine uses Z-up but Three.js uses Y-up
  return new THREE.Vector3(
    body.position.x,
    body.position.z, // Z becomes Y
    -body.position.y // Y becomes -Z
  );
}
```

### 3. Body Type Semantics

```typescript
// Understand engine-specific behavior
setBodyType(body: PhysicsBody, type: BodyType): void {
  if (type === BodyType.Kinematic) {
    // Some engines: kinematic = no forces
    // Others: kinematic = no collision response
    // Rapier: kinematic = position-controlled but affects others

    // Choose the right mapping for your engine!
  }
}
```

## Best Practices

### 1. Document Engine-Specific Behavior

```typescript
/**
 * Cannon.js Physics Adapter
 *
 * Body Type Mapping:
 * - Dynamic (0) → CANNON.Body.DYNAMIC (1)
 * - Kinematic (1) → CANNON.Body.KINEMATIC (4)
 * - Static (2) → CANNON.Body.STATIC (2)
 *
 * Note: Cannon.js kinematic bodies don't respond to forces
 * but still affect other bodies in collisions.
 */
```

### 2. Handle Edge Cases

```typescript
applyImpulse(body: CANNON.Body, impulse: THREE.Vector3): void {
  // Don't apply impulse to static bodies
  if (body.type === CANNON.Body.STATIC) {
    console.warn('Cannot apply impulse to static body');
    return;
  }

  // Cannon.js requires bodies to be awake
  body.wakeUp();

  const cannonImpulse = new CANNON.Vec3(impulse.x, impulse.y, impulse.z);
  body.applyImpulse(cannonImpulse);
}
```

### 3. Provide Helper Methods

```typescript
export class CannonAdapter implements PhysicsAdapter<CANNON.Body> {
  // ... required methods ...

  // Convenience: Get body mass
  getMass(body: CANNON.Body): number {
    return body.mass;
  }

  // Convenience: Wake up body
  wakeUp(body: CANNON.Body): void {
    body.wakeUp();
  }

  // Convenience: Check if body is sleeping
  isSleeping(body: CANNON.Body): boolean {
    return body.sleepState === CANNON.Body.SLEEPING;
  }
}
```

## Resources

- [Cannon.js Documentation](https://pmndrs.github.io/cannon-es/)
- [Ammo.js GitHub](https://github.com/kripken/ammo.js/)
- [Bullet Physics Manual](https://github.com/bulletphysics/bullet3/blob/master/docs/Bullet_User_Manual.pdf)
- [Physics Engine Comparison](https://github.com/pmndrs/cannon-es#comparison-with-other-physics-engines)

## Next Steps

1. Create adapters for other engines (Oimo.js, Jolt)
2. Add performance benchmarks
3. Implement constraint/joint adapters
4. Support soft body physics
5. Create adapter test suite

Happy physics coding! ⚛️
