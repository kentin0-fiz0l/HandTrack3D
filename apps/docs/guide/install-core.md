# Install @handtrack3d/core

Use HandTrack3D with vanilla JavaScript or build custom framework integrations.

## Installation

::: code-group
```bash [npm]
npm install @handtrack3d/core
```

```bash [pnpm]
pnpm add @handtrack3d/core
```

```bash [yarn]
yarn add @handtrack3d/core
```
:::

## No Dependencies

`@handtrack3d/core` has zero runtime dependencies. MediaPipe is loaded from CDN on demand.

## Quick Start

```js
import { HandTracker } from '@handtrack3d/core'

// Create tracker
const tracker = new HandTracker({
  maxHands: 2,
  minDetectionConfidence: 0.7
})

// Listen for hands
tracker.on('hands', (hands) => {
  console.log('Detected hands:', hands)
})

// Start tracking
await tracker.start()
```

## API Overview

### HandTracker Class

```ts
class HandTracker {
  constructor(config?: HandTrackingConfig)

  start(): Promise<void>
  stop(): void

  on(event: 'hands', callback: (hands: Hand[]) => void): void
  on(event: 'error', callback: (error: Error) => void): void

  off(event: string, callback: Function): void

  getHands(): Hand[]
  isRunning(): boolean
}
```

### Configuration

```ts
interface HandTrackingConfig {
  maxHands?: number                 // 1-2, default: 2
  minDetectionConfidence?: number   // 0-1, default: 0.5
  minTrackingConfidence?: number    // 0-1, default: 0.5
  modelComplexity?: 0 | 1           // default: 1
}
```

### Hand Data

```ts
interface Hand {
  handedness: 'Left' | 'Right'
  landmarks: Landmark[]      // 21 3D points
  gesture: Gesture
  confidence: number
}

interface Landmark {
  x: number  // 0-1 normalized
  y: number  // 0-1 normalized
  z: number  // depth
}

type Gesture = 'open' | 'closed' | 'pinch' | 'point' | 'unknown'
```

## Event Handling

```js
// Hand updates
tracker.on('hands', (hands) => {
  hands.forEach(hand => {
    console.log(`${hand.handedness}: ${hand.gesture}`)
  })
})

// Errors
tracker.on('error', (error) => {
  console.error('Tracking error:', error)
})

// Remove listener
const callback = (hands) => { /* ... */ }
tracker.on('hands', callback)
tracker.off('hands', callback)
```

## Gesture Detection

```js
import { detectGesture } from '@handtrack3d/core'

tracker.on('hands', (hands) => {
  hands.forEach(hand => {
    const gesture = detectGesture(hand.landmarks)
    console.log('Gesture:', gesture)
  })
})
```

## Custom Gestures

```js
import { defineGesture } from '@handtrack3d/core'

const thumbsUp = defineGesture((landmarks) => {
  const thumb = landmarks[4]
  const wrist = landmarks[0]
  return thumb.y < wrist.y
})

tracker.on('hands', (hands) => {
  hands.forEach(hand => {
    if (thumbsUp(hand.landmarks)) {
      console.log('Thumbs up!')
    }
  })
})
```

## Landmark Indices

Each hand has 21 landmarks:

```
0:  Wrist
1-4:  Thumb (CMC, MCP, IP, TIP)
5-8:  Index (MCP, PIP, DIP, TIP)
9-12:  Middle (MCP, PIP, DIP, TIP)
13-16: Ring (MCP, PIP, DIP, TIP)
17-20: Pinky (MCP, PIP, DIP, TIP)
```

## Performance Tips

```js
// Lite model for better performance
const tracker = new HandTracker({
  modelComplexity: 0
})

// Single hand tracking
const tracker = new HandTracker({
  maxHands: 1
})

// Throttle updates
let lastUpdate = 0
tracker.on('hands', (hands) => {
  const now = Date.now()
  if (now - lastUpdate < 50) return  // Max 20fps
  lastUpdate = now
  // ... process hands
})
```

## TypeScript Support

Full TypeScript definitions included:

```ts
import type {
  HandTracker,
  Hand,
  Landmark,
  Gesture,
  HandTrackingConfig
} from '@handtrack3d/core'
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+

## Next Steps

- [Core API Reference](/api/core)
- [Gesture Recognition](/guide/gestures)
- [Examples](/examples/)
