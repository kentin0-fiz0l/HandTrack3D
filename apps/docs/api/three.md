# @handtrack3d/three API Reference

Complete API reference for Three.js integration.

::: info Auto-Generated Documentation
Detailed API docs will be auto-generated from TypeScript definitions using TypeDoc.
:::

## Hooks

### useHandInteraction()

Main hook for 3D hand interaction.

```tsx
function useHandInteraction(options?: InteractionOptions): InteractionState
```

**Options:**

```ts
interface InteractionOptions {
  target?: RefObject<Object3D>
  grabThreshold?: number
  releaseThreshold?: number
  smoothing?: number
}
```

**Returns:**

```ts
interface InteractionState {
  grabbedObject: Object3D | null
  grabPosition: Vector3
  isPinching: boolean
  leftHand: Hand | null
  rightHand: Hand | null
}
```

**Example:**

```tsx
import { useHandInteraction } from '@handtrack3d/three'

function Scene() {
  const { grabbedObject, grabPosition, isPinching } = useHandInteraction()

  return (
    <mesh position={isPinching ? grabPosition : [0, 0, 0]}>
      <boxGeometry />
    </mesh>
  )
}
```

### useHandPosition()

Get 3D position of a hand.

```tsx
function useHandPosition(
  handedness: 'Left' | 'Right'
): Vector3 | null
```

**Example:**

```tsx
import { useHandPosition } from '@handtrack3d/three'

function Scene() {
  const leftPos = useHandPosition('Left')

  return leftPos && <mesh position={leftPos} />
}
```

### useHandRay()

Cast ray from hand for selection.

```tsx
function useHandRay(handedness: 'Left' | 'Right'): RayState
```

**Returns:**

```ts
interface RayState {
  ray: Ray
  hit: Intersection | null
}
```

**Example:**

```tsx
import { useHandRay } from '@handtrack3d/three'

function Scene() {
  const { hit } = useHandRay('Right')

  return hit && <mesh position={hit.point} />
}
```

### useTwoHandGesture()

Track two-hand gestures for scaling/rotation.

```tsx
function useTwoHandGesture(): TwoHandState
```

**Returns:**

```ts
interface TwoHandState {
  distance: number
  center: Vector3
  rotation: Euler
  active: boolean
}
```

**Example:**

```tsx
import { useTwoHandGesture } from '@handtrack3d/three'

function Scene() {
  const { distance, center, active } = useTwoHandGesture()

  return active && (
    <mesh position={center} scale={distance}>
      <boxGeometry />
    </mesh>
  )
}
```

### useHandPointer()

Point-based object selection.

```tsx
function useHandPointer(options?: PointerOptions): PointerState
```

**Options:**

```ts
interface PointerOptions {
  handedness: 'Left' | 'Right'
  selectGesture?: Gesture
  hoverDistance?: number
}
```

**Returns:**

```ts
interface PointerState {
  hoveredObject: Object3D | null
  selectedObject: Object3D | null
}
```

## Components

### HandMesh

Render 3D hand model.

```tsx
interface HandMeshProps {
  handedness: 'Left' | 'Right'
  color?: string | Color
  opacity?: number
  wireframe?: boolean
}
```

**Example:**

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

Render hand skeleton.

```tsx
interface HandSkeletonProps {
  handedness: 'Left' | 'Right'
  landmarkSize?: number
  connectionWidth?: number
  landmarkColor?: string | Color
  connectionColor?: string | Color
}
```

**Example:**

```tsx
import { HandSkeleton } from '@handtrack3d/three'

function Scene() {
  return (
    <HandSkeleton
      handedness="Left"
      landmarkSize={0.02}
      connectionWidth={0.01}
      landmarkColor="yellow"
    />
  )
}
```

### HandInteractionProvider

Provider for hand interaction context.

```tsx
interface HandInteractionProviderProps {
  children: ReactNode
  grabThreshold?: number
  releaseThreshold?: number
  smoothing?: number
  coordinateMapping?: 'viewport' | 'world'
  updateInterval?: number
  useBoundingBox?: boolean
}
```

**Example:**

```tsx
import { HandInteractionProvider } from '@handtrack3d/three'

<HandInteractionProvider
  grabThreshold={0.05}
  smoothing={0.5}
  coordinateMapping="world"
>
  <Scene />
</HandInteractionProvider>
```

## Utilities

### handToWorld()

Convert hand coordinates to world space.

```tsx
function handToWorld(
  landmark: Landmark,
  camera: Camera
): Vector3
```

**Example:**

```tsx
import { handToWorld } from '@handtrack3d/three'
import { useThree } from '@react-three/fiber'

function Scene() {
  const { camera } = useThree()
  const hand = useHand('Right')

  const worldPos = hand && handToWorld(
    hand.landmarks[8],
    camera
  )
}
```

### worldToHand()

Convert world coordinates to hand space.

```tsx
function worldToHand(
  position: Vector3,
  camera: Camera
): Landmark
```

### isPointingAt()

Check if hand is pointing at an object.

```tsx
function isPointingAt(
  hand: Hand,
  object: Object3D,
  threshold?: number
): boolean
```

**Example:**

```tsx
import { isPointingAt } from '@handtrack3d/three'

const pointing = isPointingAt(hand, mesh, 0.1)
```

### getGrabDistance()

Calculate grab distance between thumb and index.

```tsx
function getGrabDistance(hand: Hand): number
```

### smoothPosition()

Smooth position updates.

```tsx
function smoothPosition(
  current: Vector3,
  target: Vector3,
  smoothing: number
): Vector3
```

## Types

### InteractionState

```ts
interface InteractionState {
  grabbedObject: Object3D | null
  grabPosition: Vector3
  isPinching: boolean
  leftHand: Hand | null
  rightHand: Hand | null
}
```

### RayState

```ts
interface RayState {
  ray: Ray
  hit: Intersection | null
}
```

### TwoHandState

```ts
interface TwoHandState {
  distance: number
  center: Vector3
  rotation: Euler
  active: boolean
}
```

## Constants

### DEFAULT_GRAB_THRESHOLD

```ts
export const DEFAULT_GRAB_THRESHOLD = 0.05
```

### DEFAULT_RELEASE_THRESHOLD

```ts
export const DEFAULT_RELEASE_THRESHOLD = 0.1
```

### DEFAULT_SMOOTHING

```ts
export const DEFAULT_SMOOTHING = 0.5
```

## Events

### Grab Events

```tsx
import { useHandInteraction } from '@handtrack3d/three'

function Scene() {
  useHandInteraction({
    onGrab: (object, hand) => console.log('Grabbed', object),
    onRelease: (object, hand) => console.log('Released', object),
    onMove: (position, hand) => console.log('Moving', position)
  })
}
```

## Examples

### Basic Object Manipulation

```tsx
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
function ScalableObject() {
  const { distance, center, active } = useTwoHandGesture()

  return (
    <mesh
      position={active ? center : [0, 0, 0]}
      scale={active ? distance : 1}
    >
      <sphereGeometry />
      <meshStandardMaterial />
    </mesh>
  )
}
```

## See Also

- [Getting Started](/guide/getting-started)
- [Installation Guide](/guide/install-three)
- [3D Interaction Guide](/guide/3d-interaction)
- [Three.js Examples](/examples/three)
