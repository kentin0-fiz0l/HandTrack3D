# Install @handtrack3d/react

Add hand tracking to your React application with first-class hooks and components.

## Installation

::: code-group
```bash [npm]
npm install @handtrack3d/react
```

```bash [pnpm]
pnpm add @handtrack3d/react
```

```bash [yarn]
yarn add @handtrack3d/react
```
:::

## Peer Dependencies

`@handtrack3d/react` requires React 18+:

```json
{
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

## TypeScript Support

TypeScript definitions are included. No additional `@types` packages needed.

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}
```

## Quick Start

### 1. Wrap Your App

```tsx
import { HandTrackingProvider } from '@handtrack3d/react'

function App() {
  return (
    <HandTrackingProvider>
      <YourApp />
    </HandTrackingProvider>
  )
}
```

### 2. Use the Hook

```tsx
import { useHandTracking } from '@handtrack3d/react'

function YourApp() {
  const { hands, enabled, toggle } = useHandTracking()

  return (
    <div>
      <button onClick={toggle}>
        {enabled ? 'Stop' : 'Start'}
      </button>

      {hands.map((hand) => (
        <div key={hand.id}>
          {hand.handedness}: {hand.gesture}
        </div>
      ))}
    </div>
  )
}
```

## Available Hooks

### useHandTracking()

Main hook for accessing hand tracking state:

```tsx
const {
  hands,        // Current hands array
  enabled,      // Is tracking active?
  toggle,       // Toggle tracking on/off
  start,        // Start tracking
  stop,         // Stop tracking
  error         // Current error (if any)
} = useHandTracking()
```

### useHandGestures()

Listen for gesture events:

```tsx
import { useHandGestures } from '@handtrack3d/react'

function App() {
  useHandGestures({
    onPinch: (hand) => console.log('Pinch detected'),
    onRelease: (hand) => console.log('Released'),
    onPoint: (hand) => console.log('Pointing')
  })
}
```

### useHand()

Track a specific hand:

```tsx
import { useHand } from '@handtrack3d/react'

function App() {
  const leftHand = useHand('Left')
  const rightHand = useHand('Right')

  return (
    <div>
      Left: {leftHand?.gesture}
      Right: {rightHand?.gesture}
    </div>
  )
}
```

## Components

### HandCanvas3D

Render hands in 3D:

```tsx
import { HandCanvas3D } from '@handtrack3d/react'

function App() {
  return (
    <HandCanvas3D
      width={800}
      height={600}
      showLandmarks={true}
      showConnections={true}
    />
  )
}
```

### HandDebugger

Debug panel for development:

```tsx
import { HandDebugger } from '@handtrack3d/react'

function App() {
  return (
    <div>
      <YourApp />
      {import.meta.env.DEV && <HandDebugger />}
    </div>
  )
}
```

## Configuration

Configure via provider props:

```tsx
<HandTrackingProvider
  maxHands={2}
  minDetectionConfidence={0.7}
  minTrackingConfidence={0.5}
  modelComplexity={1}
  onError={(error) => console.error(error)}
>
  <App />
</HandTrackingProvider>
```

## Error Handling

```tsx
import { useHandTracking } from '@handtrack3d/react'

function App() {
  const { error } = useHandTracking()

  if (error) {
    return <div>Error: {error.message}</div>
  }

  // ... rest of app
}
```

## TypeScript Types

```tsx
import type {
  Hand,
  Landmark,
  Gesture,
  HandTrackingConfig
} from '@handtrack3d/react'

const hand: Hand = {
  id: 'left-0',
  handedness: 'Left',
  landmarks: [...],
  gesture: 'pinch',
  confidence: 0.95
}
```

## Next Steps

- [Getting Started Guide](/guide/getting-started)
- [React API Reference](/api/react)
- [React Examples](/examples/react)
