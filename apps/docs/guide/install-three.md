# Install @handtrack3d/three

Add hand interaction to your Three.js and React Three Fiber projects.

## Installation

::: code-group
```bash [npm]
npm install @handtrack3d/three @handtrack3d/react
```

```bash [pnpm]
pnpm add @handtrack3d/three @handtrack3d/react
```

```bash [yarn]
yarn add @handtrack3d/three @handtrack3d/react
```
:::

## Peer Dependencies

```json
{
  "peerDependencies": {
    "@react-three/fiber": "^8.0.0 || ^9.0.0",
    "three": ">=0.150.0",
    "react": "^18.0.0 || ^19.0.0"
  }
}
```

Install peer dependencies:

```bash
npm install three @react-three/fiber @react-three/drei
```

## Quick Start

```tsx
import { Canvas } from '@react-three/fiber'
import { useHandInteraction } from '@handtrack3d/three'
import { HandTrackingProvider } from '@handtrack3d/react'

function Scene() {
  const { grabbedObject, grabPosition } = useHandInteraction()

  return (
    <mesh position={grabPosition}>
      <boxGeometry />
      <meshStandardMaterial
        color={grabbedObject ? 'red' : 'blue'}
      />
    </mesh>
  )
}

function App() {
  return (
    <HandTrackingProvider>
      <Canvas>
        <Scene />
      </Canvas>
    </HandTrackingProvider>
  )
}
```

## Available Hooks

### useHandInteraction()

Track hand interactions with 3D objects:

```tsx
const {
  grabbedObject,    // Currently grabbed object (if any)
  grabPosition,     // 3D position of grab
  isPinching,       // Is hand in pinch gesture?
  leftHand,         // Left hand data
  rightHand         // Right hand data
} = useHandInteraction()
```

### useHandPosition()

Get 3D position of a hand:

```tsx
import { useHandPosition } from '@handtrack3d/three'

function Scene() {
  const leftPos = useHandPosition('Left')
  const rightPos = useHandPosition('Right')

  return (
    <>
      {leftPos && <mesh position={leftPos} />}
      {rightPos && <mesh position={rightPos} />}
    </>
  )
}
```

### useHandRay()

Cast a ray from hand for selection:

```tsx
import { useHandRay } from '@handtrack3d/three'

function Scene() {
  const { ray, hit } = useHandRay('Right')

  return (
    <mesh position={hit?.point}>
      <sphereGeometry args={[0.1]} />
    </mesh>
  )
}
```

## Components

### HandMesh

Render 3D hand model:

```tsx
import { HandMesh } from '@handtrack3d/three'

function Scene() {
  return (
    <>
      <HandMesh handedness="Left" color="blue" />
      <HandMesh handedness="Right" color="red" />
    </>
  )
}
```

### HandSkeleton

Render hand skeleton (landmarks + connections):

```tsx
import { HandSkeleton } from '@handtrack3d/three'

function Scene() {
  return (
    <HandSkeleton
      handedness="Left"
      landmarkSize={0.02}
      connectionWidth={0.01}
    />
  )
}
```

## Interaction Patterns

### Object Grabbing

```tsx
import { useHandInteraction } from '@handtrack3d/three'
import { useRef } from 'react'

function GrabbableBox() {
  const meshRef = useRef()
  const { isPinching, grabPosition } = useHandInteraction({
    target: meshRef
  })

  return (
    <mesh
      ref={meshRef}
      position={isPinching ? grabPosition : [0, 0, 0]}
    >
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  )
}
```

### Two-Hand Scaling

```tsx
import { useTwoHandGesture } from '@handtrack3d/three'

function ScalableBox() {
  const { distance, center } = useTwoHandGesture()

  return (
    <mesh position={center} scale={distance}>
      <boxGeometry />
    </mesh>
  )
}
```

### Pointing Selection

```tsx
import { useHandPointer } from '@handtrack3d/three'

function SelectableObjects() {
  const { hoveredObject } = useHandPointer({
    handedness: 'Right'
  })

  return (
    <group>
      {objects.map(obj => (
        <mesh
          key={obj.id}
          userData={{ id: obj.id }}
        >
          <boxGeometry />
          <meshStandardMaterial
            color={hoveredObject?.id === obj.id ? 'yellow' : 'gray'}
          />
        </mesh>
      ))}
    </group>
  )
}
```

## Configuration

```tsx
import { HandInteractionProvider } from '@handtrack3d/three'

<HandInteractionProvider
  grabThreshold={0.05}        // Distance threshold for grabbing
  releaseThreshold={0.1}      // Distance threshold for release
  smoothing={0.5}             // Position smoothing (0-1)
  coordinateMapping="viewport" // or "world"
>
  <Scene />
</HandInteractionProvider>
```

## Coordinate Mapping

Convert hand coordinates (0-1 normalized) to 3D space:

```tsx
import { handToWorld } from '@handtrack3d/three'

const hand = { landmarks: [...] }
const worldPos = handToWorld(hand.landmarks[8], camera)
```

## TypeScript Types

```tsx
import type {
  HandInteractionState,
  HandRay,
  GrabEvent
} from '@handtrack3d/three'
```

## Performance

```tsx
// Limit interaction check frequency
<HandInteractionProvider updateInterval={50}>
  <Scene />
</HandInteractionProvider>

// Use bounding box checks before precise detection
<HandInteractionProvider useBoundingBox={true}>
  <Scene />
</HandInteractionProvider>
```

## Next Steps

- [Three.js API Reference](/api/three)
- [3D Interaction Guide](/guide/3d-interaction)
- [Three.js Examples](/examples/three)
