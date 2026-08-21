# @handtrack3d/core API Reference

Complete API reference for the core hand tracking package.

::: info Auto-Generated Documentation
Detailed API docs will be auto-generated from TypeScript definitions using TypeDoc.
:::

## Classes

### HandTracker

Main class for hand tracking.

```ts
class HandTracker {
  constructor(config?: HandTrackingConfig)
  start(): Promise<void>
  stop(): void
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  getHands(): Hand[]
  isRunning(): boolean
}
```

#### Constructor

```ts
const tracker = new HandTracker({
  maxHands: 2,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5,
  modelComplexity: 1
})
```

#### Methods

**start()**

Start hand tracking.

```ts
await tracker.start()
```

Returns: `Promise<void>`

Throws: `Error` if camera access denied or model loading fails

**stop()**

Stop hand tracking and release camera.

```ts
tracker.stop()
```

**on(event, callback)**

Register event listener.

```ts
tracker.on('hands', (hands: Hand[]) => {
  console.log(hands)
})

tracker.on('error', (error: Error) => {
  console.error(error)
})
```

**off(event, callback)**

Remove event listener.

```ts
const callback = (hands) => { /* ... */ }
tracker.on('hands', callback)
tracker.off('hands', callback)
```

**getHands()**

Get current hands array.

```ts
const hands = tracker.getHands()
```

Returns: `Hand[]`

**isRunning()**

Check if tracking is active.

```ts
if (tracker.isRunning()) {
  console.log('Tracking active')
}
```

Returns: `boolean`

## Interfaces

### HandTrackingConfig

```ts
interface HandTrackingConfig {
  maxHands?: number
  minDetectionConfidence?: number
  minTrackingConfidence?: number
  modelComplexity?: 0 | 1
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxHands` | `number` | `2` | Maximum hands to detect (1-2) |
| `minDetectionConfidence` | `number` | `0.5` | Detection confidence threshold (0-1) |
| `minTrackingConfidence` | `number` | `0.5` | Tracking confidence threshold (0-1) |
| `modelComplexity` | `0 \| 1` | `1` | Model complexity: 0 = lite, 1 = full |

### Hand

```ts
interface Hand {
  handedness: 'Left' | 'Right'
  landmarks: Landmark[]
  gesture: Gesture
  confidence: number
}
```

| Property | Type | Description |
|----------|------|-------------|
| `handedness` | `'Left' \| 'Right'` | Which hand (left or right) |
| `landmarks` | `Landmark[]` | 21 3D landmark points |
| `gesture` | `Gesture` | Detected gesture |
| `confidence` | `number` | Detection confidence (0-1) |

### Landmark

```ts
interface Landmark {
  x: number
  y: number
  z: number
}
```

| Property | Type | Description |
|----------|------|-------------|
| `x` | `number` | X coordinate (0-1 normalized) |
| `y` | `number` | Y coordinate (0-1 normalized) |
| `z` | `number` | Z depth (relative to wrist) |

### Gesture

```ts
type Gesture = 'open' | 'closed' | 'pinch' | 'point' | 'unknown'
```

## Functions

### detectGesture()

Detect gesture from hand landmarks.

```ts
function detectGesture(landmarks: Landmark[]): Gesture
```

**Example:**

```ts
import { detectGesture } from '@handtrack3d/core'

const gesture = detectGesture(hand.landmarks)
```

### defineGesture()

Define custom gesture detector.

```ts
function defineGesture(
  detector: (landmarks: Landmark[]) => boolean
): (landmarks: Landmark[]) => boolean
```

**Example:**

```ts
import { defineGesture } from '@handtrack3d/core'

const isThumbsUp = defineGesture((landmarks) => {
  const thumb = landmarks[4]
  const wrist = landmarks[0]
  return thumb.y < wrist.y
})
```

### distance()

Calculate distance between two landmarks.

```ts
function distance(a: Landmark, b: Landmark): number
```

**Example:**

```ts
import { distance } from '@handtrack3d/core'

const d = distance(landmarks[4], landmarks[8])
```

## Events

### 'hands'

Emitted when hands are detected or updated.

```ts
tracker.on('hands', (hands: Hand[]) => {
  console.log('Detected hands:', hands)
})
```

Frequency: ~30fps (depends on device)

### 'error'

Emitted when an error occurs.

```ts
tracker.on('error', (error: Error) => {
  console.error('Error:', error)
})
```

Common error codes:
- `PERMISSION_DENIED`: Camera access denied
- `MODEL_LOAD_FAILED`: Failed to load ML model
- `CAMERA_ERROR`: Camera initialization failed

## Constants

### LANDMARK_INDICES

Landmark index constants.

```ts
export const LANDMARK_INDICES = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  // ... and more
}
```

**Example:**

```ts
import { LANDMARK_INDICES } from '@handtrack3d/core'

const thumbTip = landmarks[LANDMARK_INDICES.THUMB_TIP]
const indexTip = landmarks[LANDMARK_INDICES.INDEX_TIP]
```

## Type Guards

### isLeftHand()

```ts
function isLeftHand(hand: Hand): boolean
```

### isRightHand()

```ts
function isRightHand(hand: Hand): boolean
```

### isPinching()

```ts
function isPinching(hand: Hand): boolean
```

## See Also

- [Getting Started](/guide/getting-started)
- [Installation Guide](/guide/install-core)
- [Examples](/examples/)
