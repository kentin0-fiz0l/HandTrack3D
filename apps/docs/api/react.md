# @handtrack3d/react API Reference

Complete API reference for React hooks and components.

::: info Auto-Generated Documentation
Detailed API docs will be auto-generated from TypeScript definitions using TypeDoc.
:::

## Hooks

### useHandTracking()

Main hook for accessing hand tracking state.

```tsx
function useHandTracking(): HandTrackingState
```

**Returns:**

```ts
interface HandTrackingState {
  hands: Hand[]
  enabled: boolean
  error: Error | null
  start: () => Promise<void>
  stop: () => void
  toggle: () => void
}
```

**Example:**

```tsx
import { useHandTracking } from '@handtrack3d/react'

function App() {
  const { hands, enabled, toggle } = useHandTracking()

  return (
    <button onClick={toggle}>
      {enabled ? 'Stop' : 'Start'}
    </button>
  )
}
```

### useHand()

Get a specific hand by handedness.

```tsx
function useHand(handedness: 'Left' | 'Right'): Hand | null
```

**Example:**

```tsx
import { useHand } from '@handtrack3d/react'

function App() {
  const leftHand = useHand('Left')

  return <div>{leftHand?.gesture}</div>
}
```

### useHandGestures()

Listen for gesture events.

```tsx
function useHandGestures(callbacks: GestureCallbacks): void
```

**Callbacks:**

```ts
interface GestureCallbacks {
  onPinch?: (hand: Hand) => void
  onRelease?: (hand: Hand) => void
  onPoint?: (hand: Hand) => void
  onOpen?: (hand: Hand) => void
  onClosed?: (hand: Hand) => void
}
```

**Example:**

```tsx
import { useHandGestures } from '@handtrack3d/react'

function App() {
  useHandGestures({
    onPinch: (hand) => console.log('Pinch!'),
    onRelease: (hand) => console.log('Released')
  })
}
```

### useHandLandmark()

Track a specific landmark position.

```tsx
function useHandLandmark(
  handedness: 'Left' | 'Right',
  index: number
): Landmark | null
```

**Example:**

```tsx
import { useHandLandmark, LANDMARK_INDICES } from '@handtrack3d/react'

function App() {
  const indexTip = useHandLandmark('Right', LANDMARK_INDICES.INDEX_TIP)

  return <div>X: {indexTip?.x}</div>
}
```

## Components

### HandTrackingProvider

Context provider for hand tracking.

```tsx
interface HandTrackingProviderProps {
  children: ReactNode
  maxHands?: number
  minDetectionConfidence?: number
  minTrackingConfidence?: number
  modelComplexity?: 0 | 1
  onError?: (error: Error) => void
}
```

**Example:**

```tsx
import { HandTrackingProvider } from '@handtrack3d/react'

function App() {
  return (
    <HandTrackingProvider
      maxHands={2}
      minDetectionConfidence={0.7}
      onError={(e) => console.error(e)}
    >
      <YourApp />
    </HandTrackingProvider>
  )
}
```

### HandCanvas3D

Render hands in 3D canvas.

```tsx
interface HandCanvas3DProps {
  width: number
  height: number
  showLandmarks?: boolean
  showConnections?: boolean
  landmarkColor?: string
  connectionColor?: string
  backgroundColor?: string
}
```

**Example:**

```tsx
import { HandCanvas3D } from '@handtrack3d/react'

function App() {
  return (
    <HandCanvas3D
      width={800}
      height={600}
      showLandmarks={true}
      landmarkColor="red"
    />
  )
}
```

### HandDebugger

Debug panel showing hand tracking info.

```tsx
interface HandDebuggerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  showLandmarks?: boolean
  showGestures?: boolean
  showFPS?: boolean
}
```

**Example:**

```tsx
import { HandDebugger } from '@handtrack3d/react'

function App() {
  return (
    <div>
      <YourApp />
      {import.meta.env.DEV && (
        <HandDebugger
          position="top-right"
          showFPS={true}
        />
      )}
    </div>
  )
}
```

## Types

### Hand

Re-exported from `@handtrack3d/core`.

```ts
interface Hand {
  handedness: 'Left' | 'Right'
  landmarks: Landmark[]
  gesture: Gesture
  confidence: number
}
```

### Landmark

```ts
interface Landmark {
  x: number
  y: number
  z: number
}
```

### Gesture

```ts
type Gesture = 'open' | 'closed' | 'pinch' | 'point' | 'unknown'
```

## Constants

### LANDMARK_INDICES

```ts
export const LANDMARK_INDICES = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_TIP: 8,
  MIDDLE_TIP: 12,
  RING_TIP: 16,
  PINKY_TIP: 20
  // ... and more
}
```

## Utilities

### handToScreen()

Convert hand landmark to screen coordinates.

```tsx
function handToScreen(
  landmark: Landmark,
  width: number,
  height: number
): { x: number; y: number }
```

**Example:**

```tsx
import { handToScreen } from '@handtrack3d/react'

const screenPos = handToScreen(
  hand.landmarks[8],
  window.innerWidth,
  window.innerHeight
)
```

## Context

### HandTrackingContext

Access context directly (advanced usage).

```tsx
import { useContext } from 'react'
import { HandTrackingContext } from '@handtrack3d/react'

function App() {
  const context = useContext(HandTrackingContext)
  // Access tracker instance, etc.
}
```

## See Also

- [Getting Started](/guide/getting-started)
- [Installation Guide](/guide/install-react)
- [React Examples](/examples/react)
