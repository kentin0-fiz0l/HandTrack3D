# @handtrack3d/rapier

> Rapier physics adapter and interaction plugins for HandTrack3D

[![npm version](https://img.shields.io/npm/v/@handtrack3d/rapier.svg)](https://www.npmjs.com/package/@handtrack3d/rapier)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Physics-engine agnostic interaction system for hand tracking in 3D environments. Provides grab-hold-throw mechanics with Rapier physics integration.

## Features

- 🎯 **Physics Adapter System** - Abstract physics engine interface
- 🤲 **Grab Plugin** - Complete grab-hold-throw interaction
- ⚛️ **React Hooks** - Easy integration with React Three Fiber
- 🛠️ **Utilities** - Physics calculation helpers
- 🔌 **Extensible** - Support for other physics engines (Cannon.js, Ammo.js)

## Installation

```bash
npm install @handtrack3d/rapier @react-three/rapier
# or
pnpm add @handtrack3d/rapier @react-three/rapier
```

**Peer Dependencies:**
- `@react-three/rapier` ^1.0.0 || ^2.0.0
- `react` ^18.0.0 || ^19.0.0
- `three` >=0.160.0

## Quick Start

### Basic Grab Interaction

```typescript
import { usePhysicsGrab } from '@handtrack3d/rapier';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';

function InteractiveObject({ object }) {
  const rigidBodyRef = useRef();
  const grabPlugin = usePhysicsGrab({
    grabRadius: 0.5,        // Max distance to grab
    throwVelocityScale: 60, // Throw force multiplier
  });

  useFrame(() => {
    // Create hand state from your hand tracking data
    const hand = {
      id: 'left-hand',
      position: new THREE.Vector3(0, 1, -0.5),
      gesture: 'pinch', // or 'open', 'none', etc.
    };

    // Map of object IDs to rigid bodies
    const rigidBodies = new Map([
      [object.id, rigidBodyRef.current],
    ]);

    // Update grab plugin (handles grab, hold, release, throw)
    grabPlugin.update(hand, rigidBodies);
  });

  const isGrabbed = grabPlugin.isGrabbed(object.id);

  return (
    <RigidBody ref={rigidBodyRef} position={[0, 1, 0]}>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial
          color={isGrabbed ? 'yellow' : 'white'}
        />
      </mesh>
    </RigidBody>
  );
}
```

### Custom Physics Adapter

```typescript
import { PhysicsAdapter, BodyType } from '@handtrack3d/rapier';
import * as THREE from 'three';

class CannonAdapter implements PhysicsAdapter<CANNON.Body> {
  setBodyType(body: CANNON.Body, type: BodyType): void {
    body.type = type; // CANNON uses same enum values
  }

  setLinearVelocity(body: CANNON.Body, velocity: THREE.Vector3): void {
    body.velocity.set(velocity.x, velocity.y, velocity.z);
  }

  // ... implement other methods
}

// Use with GrabPlugin
const adapter = new CannonAdapter();
const grabPlugin = new GrabPlugin(adapter);
```

## API Reference

### Hooks

#### `usePhysicsGrab(options?)`

Creates a memoized GrabPlugin instance with RapierAdapter.

**Parameters:**
- `options?: GrabPluginOptions`
  - `grabRadius?: number` - Max distance to grab objects (default: 0.5)
  - `throwVelocityScale?: number` - Velocity multiplier for throwing (default: 60)
  - `simulateWhileGrabbed?: boolean` - Enable physics while grabbed (default: false)

**Returns:** `GrabPlugin` instance

---

### Classes

#### `GrabPlugin<TBody>`

Handles grab-hold-throw mechanics using a physics adapter.

**Constructor:**
```typescript
new GrabPlugin(adapter: PhysicsAdapter<TBody>, options?: GrabPluginOptions)
```

**Methods:**
- `update(hand: HandState, rigidBodies: Map<string, TBody>): void`
  - Update grab state (call every frame)
- `isGrabbed(objectId: string): boolean`
  - Check if object is grabbed by any hand
- `isGrabbedBy(handId: string, objectId: string): boolean`
  - Check if object is grabbed by specific hand
- `getGrabbedObject(handId: string): string | undefined`
  - Get object ID grabbed by hand
- `releaseAll(): void`
  - Force release all grabbed objects
- `releaseHand(handId: string): void`
  - Force release from specific hand

**Types:**
```typescript
interface HandState {
  id: string;              // Hand identifier
  position: THREE.Vector3; // Hand position in 3D space
  gesture: string;         // Current gesture ('pinch', 'open', etc.)
}
```

#### `RapierAdapter`

Rapier physics engine adapter implementing `PhysicsAdapter<RigidBody>`.

**Constructor:**
```typescript
new RapierAdapter()
```

**Methods:**
- `setBodyType(body: RigidBody, type: BodyType): void`
- `setLinearVelocity(body: RigidBody, velocity: THREE.Vector3): void`
- `setTranslation(body: RigidBody, position: THREE.Vector3): void`
- `getTranslation(body: RigidBody): THREE.Vector3`
- `applyImpulse(body: RigidBody, impulse: THREE.Vector3, point?: THREE.Vector3): void`
- `setAngularVelocity(body: RigidBody, velocity: THREE.Vector3): void`
- `getLinearVelocity(body: RigidBody): THREE.Vector3`
- `getAngularVelocity(body: RigidBody): THREE.Vector3`

---

### Utilities

#### `calculateThrowVelocity(positions, frameRate?)`

Calculate throw velocity from position history using finite difference.

```typescript
const positions = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0.1, 0.1, 0),
  new THREE.Vector3(0.2, 0.2, 0),
];
const velocity = calculateThrowVelocity(positions, 60);
```

#### `applyDamping(velocity, damping, deltaTime)`

Apply exponential damping to velocity (simulates air resistance).

```typescript
const velocity = new THREE.Vector3(10, 0, 0);
applyDamping(velocity, 0.5, 1/60); // Damp for one frame
```

#### `calculateSmoothedVelocity(positions, frameRate?, smoothingWindow?)`

Calculate smoothed velocity by averaging recent samples (reduces jitter).

```typescript
const smoothedVel = calculateSmoothedVelocity(positions, 60, 3);
```

#### `clampMagnitude(vector, maxMagnitude)`

Limit vector length while preserving direction.

```typescript
const velocity = new THREE.Vector3(100, 0, 0);
clampMagnitude(velocity, 20); // Clamp to max 20 units/s
```

#### `isWithinBounds(position, min, max)`

Check if position is within axis-aligned bounds.

```typescript
const inBounds = isWithinBounds(
  new THREE.Vector3(1, 2, 3),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(5, 5, 5)
); // true
```

---

### Interfaces

#### `PhysicsAdapter<TBody>`

Abstract physics engine interface. Implement this to support other physics engines.

```typescript
interface PhysicsAdapter<TBody = unknown> {
  setBodyType(body: TBody, type: BodyType): void;
  setLinearVelocity(body: TBody, velocity: THREE.Vector3): void;
  setTranslation(body: TBody, position: THREE.Vector3): void;
  getTranslation(body: TBody): THREE.Vector3;
  applyImpulse(body: TBody, impulse: THREE.Vector3, point?: THREE.Vector3): void;
  setAngularVelocity?(body: TBody, velocity: THREE.Vector3): void;
  getLinearVelocity?(body: TBody): THREE.Vector3;
  getAngularVelocity?(body: TBody): THREE.Vector3;
}
```

#### `BodyType`

Physics body types (enum).

```typescript
enum BodyType {
  Dynamic = 0,   // Fully simulated
  Kinematic = 1, // Position controlled
  Static = 2,    // Fixed in place
}
```

## Migration Guide

### From Embedded Physics (v0.1.x)

**Before:**
```typescript
// Manual physics manipulation in component
if (isPinching && inRange) {
  rigidBodyRef.current.setBodyType(1, true);
  rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
  // ... 50+ lines of grab logic
}
```

**After:**
```typescript
// Use GrabPlugin
const grabPlugin = usePhysicsGrab();

useFrame(() => {
  const hand = { id: cursor.id, position: cursor.position, gesture };
  const rigidBodies = new Map([[object.id, rigidBodyRef.current]]);
  grabPlugin.update(hand, rigidBodies);
});
```

**Benefits:**
- ✅ 50+ lines → 4 lines
- ✅ Physics-engine agnostic
- ✅ Easier to test
- ✅ Reusable across projects

## Examples

See the [HandTrack3D showcase app](../../src/components/HandTrackingCanvas/InteractiveObject.refactored.tsx) for a complete example.

## License

MIT © Kentino

## Links

- [Documentation](https://github.com/kentino/handtrack3d#readme)
- [GitHub](https://github.com/kentino/handtrack3d)
- [Issues](https://github.com/kentino/handtrack3d/issues)
