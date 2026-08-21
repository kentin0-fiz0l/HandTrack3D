# Getting Started

Learn how to add HandTrack3D to your project and start tracking hands in minutes.

## Choose Your Package

HandTrack3D provides three packages to fit your needs:

| Package | When to Use | Install |
|---------|-------------|---------|
| `@handtrack3d/react` | React applications | `npm install @handtrack3d/react` |
| `@handtrack3d/core` | Vanilla JS, or other frameworks | `npm install @handtrack3d/core` |
| `@handtrack3d/three` | 3D experiences with Three.js | `npm install @handtrack3d/three` |

::: tip
**New to HandTrack3D?** Start with the [5-Minute Quickstart](/guide/quickstart) to build your first app.
:::

## Installation Guides

Select your package for detailed installation instructions:

- [Install @handtrack3d/core](/guide/install-core) - For vanilla JavaScript projects
- [Install @handtrack3d/react](/guide/install-react) - For React applications
- [Install @handtrack3d/three](/guide/install-three) - For Three.js integration

## Basic Usage

### React

```tsx
import { useHandTracking } from '@handtrack3d/react'

function App() {
  const { hands, enabled, toggle } = useHandTracking()

  return (
    <div>
      <button onClick={toggle}>
        {enabled ? 'Stop' : 'Start'} Tracking
      </button>

      {hands.map((hand, i) => (
        <div key={i}>
          {hand.handedness} hand: {hand.gesture}
        </div>
      ))}
    </div>
  )
}
```

### Vanilla JavaScript

```js
import { HandTracker } from '@handtrack3d/core'

const tracker = new HandTracker()

tracker.on('hands', (hands) => {
  console.log('Detected hands:', hands)
})

tracker.start()
```

### Three.js Integration

```tsx
import { Canvas } from '@react-three/fiber'
import { useHandInteraction } from '@handtrack3d/three'

function Scene() {
  const { grabbedObject } = useHandInteraction()

  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial color={grabbedObject ? 'red' : 'blue'} />
    </mesh>
  )
}

function App() {
  return (
    <Canvas>
      <Scene />
    </Canvas>
  )
}
```

## System Requirements

### Browser Support

HandTrack3D requires a modern browser with WebRTC support:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- iOS Safari 14.5+
- Chrome Android 90+

### Hardware Requirements

**Minimum:**
- Webcam (720p)
- Dual-core CPU
- 4GB RAM

**Recommended:**
- Webcam (1080p)
- Quad-core CPU
- 8GB RAM
- Hardware acceleration enabled

### Network Requirements

HandTrack3D downloads ML models on first use:
- ~10MB download (one-time)
- Models are cached locally
- No internet required after initial load

## Configuration

### Basic Configuration

```ts
import { HandTracker } from '@handtrack3d/core'

const tracker = new HandTracker({
  maxHands: 2,                      // Track up to 2 hands
  minDetectionConfidence: 0.7,      // Detection threshold
  minTrackingConfidence: 0.5,       // Tracking threshold
  modelComplexity: 1                // 0 (lite), 1 (full)
})
```

### React Configuration

```tsx
import { HandTrackingProvider } from '@handtrack3d/react'

function App() {
  return (
    <HandTrackingProvider
      maxHands={2}
      minDetectionConfidence={0.7}
    >
      <YourApp />
    </HandTrackingProvider>
  )
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxHands` | number | 2 | Maximum number of hands to detect (1-2) |
| `minDetectionConfidence` | number | 0.5 | Minimum confidence for initial detection (0-1) |
| `minTrackingConfidence` | number | 0.5 | Minimum confidence for tracking (0-1) |
| `modelComplexity` | 0 \| 1 | 1 | Model complexity: 0 = lite, 1 = full |

::: tip Performance Tuning
- Use `modelComplexity: 0` for better performance on low-end devices
- Lower `minTrackingConfidence` for smoother tracking but less accuracy
- Set `maxHands: 1` if you only need single-hand tracking
:::

## Next Steps

Now that you have HandTrack3D installed, explore these guides:

- [Hand Detection](/guide/hand-detection) - How hand tracking works
- [Gesture Recognition](/guide/gestures) - Detect and create gestures
- [3D Interaction](/guide/3d-interaction) - Manipulate 3D objects
- [Examples](/examples/) - See complete example apps

## Troubleshooting

### Camera Permission Denied

```ts
tracker.on('error', (error) => {
  if (error.code === 'PERMISSION_DENIED') {
    console.log('Please allow camera access')
  }
})
```

### Model Loading Failed

```ts
tracker.on('error', (error) => {
  if (error.code === 'MODEL_LOAD_FAILED') {
    console.log('Check your internet connection')
  }
})
```

### Poor Performance

1. Reduce model complexity: `modelComplexity: 0`
2. Track fewer hands: `maxHands: 1`
3. Lower camera resolution
4. Close other browser tabs

## Get Help

- [GitHub Discussions](https://github.com/yourusername/handtrack3d/discussions)
- [Issue Tracker](https://github.com/yourusername/handtrack3d/issues)
- [Discord Community](https://discord.gg/handtrack3d)
