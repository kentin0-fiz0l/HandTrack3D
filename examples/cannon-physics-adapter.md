# Cannon.js Physics Adapter Guide

Learn how to use Cannon.js as an alternative physics engine for HandTrack3D interactions.

## Overview

The `CannonAdapter` implements the `PhysicsAdapter` interface for [Cannon.js](https://github.com/pmndrs/cannon-es), a lightweight pure-JavaScript 3D physics engine. This allows you to use HandTrack3D's interaction plugins (like `GrabPlugin`) with Cannon.js instead of Rapier.

### Why Cannon.js?

**Advantages:**
- ✅ Smaller bundle size (~100KB vs Rapier's ~300KB)
- ✅ Pure JavaScript (no WASM compilation delay)
- ✅ Simpler API for basic physics
- ✅ Better browser compatibility
- ✅ Faster initialization

**Trade-offs:**
- ❌ Slower performance for complex scenes
- ❌ Less accurate collision detection
- ❌ Fewer advanced features
- ❌ Less active development

**Best for:** Simple grab/throw interactions, bundle size constraints, broad device support

## Installation

```bash
# Install Cannon.js
npm install cannon-es

# Install React Three Cannon (if using React Three Fiber)
npm install @react-three/cannon

# HandTrack3D packages (if not already installed)
npm install @handtrack3d/rapier@alpha
```

## Quick Start

### Basic Setup

```typescript
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { CannonAdapter } from '@handtrack3d/rapier/examples';
import { GrabPlugin } from '@handtrack3d/rapier';

// Create Cannon.js world
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Create physics body
const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
const body = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 5, 0),
});
body.addShape(shape);
world.addBody(body);

// Create adapter and grab plugin
const adapter = new CannonAdapter();
const grabPlugin = new GrabPlugin(adapter, {
  grabRadius: 0.5,
  throwVelocityScale: 60,
});

// Animation loop
function animate() {
  // Update physics (60 FPS)
  world.step(1 / 60);

  // Update grab interaction
  const hand = {
    id: 'left',
    position: new THREE.Vector3(0, 1, -0.5),
    gesture: 'pinch',
  };

  const rigidBodies = new Map([['box', body]]);
  grabPlugin.update(hand, rigidBodies);

  // Sync Three.js mesh with Cannon.js body
  mesh.position.copy(body.position as any);
  mesh.quaternion.copy(body.quaternion as any);

  requestAnimationFrame(animate);
}

animate();
```

## React Three Fiber Integration

### Using @react-three/cannon

```typescript
import { Canvas } from '@react-three/fiber';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import { CannonAdapter } from '@handtrack3d/rapier/examples';
import { GrabPlugin } from '@handtrack3d/rapier';
import { useHandTracking } from '@handtrack3d/react';
import { HandMesh } from '@handtrack3d/three';
import { useMemo } from 'react';

function GrabbableBox() {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: [0, 5, 0],
    args: [1, 1, 1], // Box dimensions
  }));

  // Create grab plugin with Cannon adapter
  const grabPlugin = useMemo(() => {
    const adapter = new CannonAdapter();
    return new GrabPlugin(adapter, {
      grabRadius: 0.5,
      throwVelocityScale: 60,
    });
  }, []);

  // Get hands from hand tracking
  const { hands } = useHandTracking();

  useFrame(() => {
    if (!ref.current || hands.length === 0) return;

    // Get Cannon.js body from @react-three/cannon ref
    const body = (ref.current as any).body;
    if (!body) return;

    const hand = {
      id: 'left',
      position: hands[0].position, // From hand tracking
      gesture: hands[0].gesture,
    };

    const rigidBodies = new Map([['box', body]]);
    grabPlugin.update(hand, rigidBodies);
  });

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="lightgray" />
    </mesh>
  );
}

function App() {
  return (
    <Canvas shadows camera={{ position: [0, 5, 10] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} castShadow />

      {/* Cannon.js physics */}
      <Physics gravity={[0, -9.82, 0]}>
        <GrabbableBox />
        <Ground />
      </Physics>

      {/* Hand tracking visualization */}
      <HandMesh />
    </Canvas>
  );
}

export default App;
```

## API Reference

### CannonAdapter

Implements `PhysicsAdapter<CannonBody>` interface for Cannon.js.

```typescript
class CannonAdapter {
  /**
   * Set body type (dynamic, kinematic, or static)
   */
  setBodyType(body: CannonBody, type: BodyType): void;

  /**
   * Set linear velocity
   */
  setLinearVelocity(body: CannonBody, velocity: THREE.Vector3): void;

  /**
   * Set position
   */
  setTranslation(body: CannonBody, position: THREE.Vector3): void;

  /**
   * Get current position
   */
  getTranslation(body: CannonBody): THREE.Vector3;

  /**
   * Apply impulse (optional point of application)
   */
  applyImpulse(
    body: CannonBody,
    impulse: THREE.Vector3,
    point?: THREE.Vector3
  ): void;

  /**
   * Set angular velocity (optional)
   */
  setAngularVelocity(body: CannonBody, velocity: THREE.Vector3): void;

  /**
   * Get linear velocity (optional)
   */
  getLinearVelocity(body: CannonBody): THREE.Vector3;

  /**
   * Get angular velocity (optional)
   */
  getAngularVelocity(body: CannonBody): THREE.Vector3;
}
```

### Body Types

```typescript
enum BodyType {
  Dynamic = 0,    // Fully simulated, affected by forces
  Kinematic = 1,  // Controlled programmatically
  Static = 2,     // Never moves, infinite mass
}
```

Cannon.js mapping:
- `BodyType.Dynamic` → `CANNON.Body.DYNAMIC` (1)
- `BodyType.Kinematic` → `CANNON.Body.KINEMATIC` (4)
- `BodyType.Static` → `CANNON.Body.STATIC` (2)

## Migration from Rapier

### Step 1: Install Cannon.js

```bash
npm uninstall @react-three/rapier
npm install cannon-es @react-three/cannon
```

### Step 2: Update Physics Provider

```tsx
// Before (Rapier)
import { Physics } from '@react-three/rapier';

<Physics>
  {/* your scene */}
</Physics>

// After (Cannon)
import { Physics } from '@react-three/cannon';

<Physics gravity={[0, -9.82, 0]}>
  {/* your scene */}
</Physics>
```

### Step 3: Update Body Hooks

```tsx
// Before (Rapier)
import { RigidBody } from '@react-three/rapier';

<RigidBody>
  <mesh>...</mesh>
</RigidBody>

// After (Cannon)
import { useBox } from '@react-three/cannon';

function Box() {
  const [ref] = useBox(() => ({ mass: 1 }));
  return <mesh ref={ref}>...</mesh>;
}
```

### Step 4: Update Adapter

```typescript
// Before (Rapier)
import { RapierAdapter } from '@handtrack3d/rapier';
const adapter = new RapierAdapter();

// After (Cannon)
import { CannonAdapter } from '@handtrack3d/rapier/examples';
const adapter = new CannonAdapter();
```

### Step 5: Update Body References

```typescript
// Before (Rapier) - ref.current is RigidBody
const body = rigidBodyRef.current;

// After (Cannon) - ref.current.body is CANNON.Body
const body = (ref.current as any).body;
```

That's it! The `GrabPlugin` API remains identical.

## Advanced Usage

### Custom Shapes

```typescript
import * as CANNON from 'cannon-es';

// Sphere
const sphereShape = new CANNON.Sphere(0.5);
const sphereBody = new CANNON.Body({
  mass: 1,
  shape: sphereShape,
  position: new CANNON.Vec3(0, 5, 0),
});

// Cylinder
const cylinderShape = new CANNON.Cylinder(0.5, 0.5, 2, 8);
const cylinderBody = new CANNON.Body({
  mass: 2,
  shape: cylinderShape,
});

// Compound shapes
const compoundBody = new CANNON.Body({ mass: 1 });
compoundBody.addShape(new CANNON.Box(new CANNON.Vec3(1, 0.5, 1)));
compoundBody.addShape(
  new CANNON.Sphere(0.5),
  new CANNON.Vec3(0, 1, 0) // Offset
);
```

### Materials and Friction

```typescript
// Create materials
const groundMaterial = new CANNON.Material('ground');
const objectMaterial = new CANNON.Material('object');

// Define contact material
const contactMaterial = new CANNON.ContactMaterial(
  groundMaterial,
  objectMaterial,
  {
    friction: 0.4,
    restitution: 0.3, // Bounciness
  }
);

world.addContactMaterial(contactMaterial);

// Apply to bodies
groundBody.material = groundMaterial;
objectBody.material = objectMaterial;
```

### Constraints

```typescript
// Point-to-point constraint (hinge)
const constraint = new CANNON.PointToPointConstraint(
  bodyA,
  new CANNON.Vec3(0, 1, 0),
  bodyB,
  new CANNON.Vec3(0, -1, 0)
);
world.addConstraint(constraint);

// Lock constraint (fixed joint)
const lockConstraint = new CANNON.LockConstraint(bodyA, bodyB);
world.addConstraint(lockConstraint);

// Distance constraint (rope/cable)
const distanceConstraint = new CANNON.DistanceConstraint(
  bodyA,
  bodyB,
  2.0 // distance
);
world.addConstraint(distanceConstraint);
```

### Collision Events

```typescript
body.addEventListener('collide', (event) => {
  const { body: otherBody, contact } = event;

  console.log('Collision detected!');
  console.log('Impact velocity:', contact.getImpactVelocityAlongNormal());
  console.log('Contact normal:', contact.ni);
  console.log('Contact point:', contact.ri);
});
```

## Performance Optimization

### 1. Use Broadphase

```typescript
import * as CANNON from 'cannon-es';

// Faster collision detection for many objects
world.broadphase = new CANNON.SAPBroadphase(world);
```

### 2. Simplify Shapes

```typescript
// Instead of complex mesh
const complexShape = new CANNON.Trimesh(vertices, indices);

// Use simpler approximation
const simpleShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
```

### 3. Sleep Inactive Bodies

```typescript
// Bodies that haven't moved recently will sleep
world.allowSleep = true;
body.sleepSpeedLimit = 0.1;
body.sleepTimeLimit = 1.0;
```

### 4. Adjust Solver Iterations

```typescript
// Lower = faster but less accurate
world.solver.iterations = 5; // Default: 10
```

### 5. Fixed Timestep

```typescript
const timeStep = 1 / 60;
let lastTime = performance.now();

function animate() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Fixed timestep with interpolation
  world.step(timeStep, deltaTime, 3);

  requestAnimationFrame(animate);
}
```

## Comparison: Cannon.js vs Rapier

| Feature | Cannon.js | Rapier |
|---------|-----------|--------|
| **Bundle Size** | ~100 KB | ~300 KB |
| **Language** | Pure JS | Rust (WASM) |
| **Initialization** | Instant | ~100ms (WASM) |
| **Performance (simple)** | Good | Excellent |
| **Performance (complex)** | Fair | Excellent |
| **Collision Accuracy** | Good | Excellent |
| **Feature Set** | Basic | Advanced |
| **Browser Support** | Excellent | Good |
| **Maintenance** | Moderate | Active |

## Troubleshooting

### Bodies Fall Through Ground

```typescript
// Increase solver iterations
world.solver.iterations = 10;

// Use larger contact distance
world.defaultContactMaterial.contactEquationStiffness = 1e7;
world.defaultContactMaterial.contactEquationRelaxation = 3;
```

### Jittery Movement

```typescript
// Increase damping
body.linearDamping = 0.3;
body.angularDamping = 0.3;

// Use smoother interpolation
world.quatNormalizeSkip = 0;
world.quatNormalizeFast = false;
```

### Poor Performance

```typescript
// Enable sleeping
world.allowSleep = true;

// Use simpler broadphase
world.broadphase = new CANNON.NaiveBroadphase();

// Reduce solver iterations
world.solver.iterations = 5;
```

### Grabbed Objects Lag

```typescript
// Increase grab plugin update rate
const grabPlugin = new GrabPlugin(adapter, {
  grabRadius: 0.5,
  throwVelocityScale: 60,
});

// Update at physics rate, not render rate
world.step(1 / 60);
grabPlugin.update(hand, rigidBodies);
```

## Example Projects

### Complete Grab Demo

See [examples/cannon-grab-demo](../src/examples/cannon-grab-demo.tsx) for a full working example with:
- Multiple grabbable objects
- Ground plane
- Hand tracking integration
- React Three Fiber
- @react-three/cannon

### Comparison Demo

See [examples/rapier-vs-cannon](../src/examples/rapier-vs-cannon.tsx) for side-by-side comparison of Rapier and Cannon.js with identical interactions.

## Next Steps

- Read the [PhysicsAdapter interface](./custom-physics-adapter.md) guide
- Try the [GrabPlugin](../packages/rapier/README.md) with Cannon.js
- Build your own physics adapter for Ammo.js or Box2D
- Experiment with Cannon.js constraints and materials

## Resources

- [Cannon.js Documentation](https://pmndrs.github.io/cannon-es/)
- [React Three Cannon](https://github.com/pmndrs/use-cannon)
- [Cannon.js Examples](https://pmndrs.github.io/cannon-es/examples/)
- [PhysicsAdapter Interface](./custom-physics-adapter.md)
- [GrabPlugin Guide](../packages/rapier/README.md)

---

**Note**: This adapter is provided as an example. For production use with Cannon.js, consider creating a dedicated `@handtrack3d/cannon` package with optimized implementations and additional features.
