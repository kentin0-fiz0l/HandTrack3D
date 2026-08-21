# What is HandTrack3D?

HandTrack3D is a modern, TypeScript-first SDK for adding webcam-based 3D hand tracking to web applications. It provides real-time hand detection, gesture recognition, and 3D interaction capabilities with a simple, developer-friendly API.

## The Problem

Building hand tracking experiences on the web has traditionally been challenging:

- **Complex ML Setup**: Downloading and managing ML models is difficult
- **Performance Issues**: Hand tracking can be CPU-intensive
- **Cross-Browser Compatibility**: Different browsers require different approaches
- **Poor Developer Experience**: Low-level APIs are hard to work with

## The Solution

HandTrack3D solves these problems by providing:

- **Zero-Config Setup**: Works out of the box, no ML models to download
- **Optimized Performance**: Efficient tracking at 60fps
- **Universal Compatibility**: Works across modern browsers
- **Excellent DX**: React hooks, TypeScript support, comprehensive docs

## How It Works

HandTrack3D is built on [MediaPipe](https://mediapipe.dev/), Google's battle-tested ML framework. We've wrapped MediaPipe's hand tracking in a modern, ergonomic API:

```
Webcam → MediaPipe → HandTrack3D → Your App
         (ML Model)   (SDK Layer)   (React/JS)
```

## Architecture

HandTrack3D is organized as a monorepo with three packages:

### @handtrack3d/core

The core hand tracking engine. Use this for vanilla JavaScript projects or to build your own framework integrations.

```ts
import { HandTracker } from '@handtrack3d/core'

const tracker = new HandTracker({
  maxHands: 2,
  minDetectionConfidence: 0.7
})

tracker.start()
tracker.on('hands', (hands) => {
  console.log('Detected hands:', hands)
})
```

### @handtrack3d/react

React hooks and components for seamless integration with React applications.

```tsx
import { useHandTracking } from '@handtrack3d/react'

function App() {
  const { hands, enabled, toggle } = useHandTracking()
  // ... use hands data
}
```

### @handtrack3d/three

Utilities for 3D object manipulation with React Three Fiber.

```tsx
import { useHandInteraction } from '@handtrack3d/three'

function Scene() {
  const { grabbedObject, grabPosition } = useHandInteraction()
  // ... manipulate 3D objects
}
```

## Key Features

### Real-Time Hand Tracking

Track up to 2 hands simultaneously at 60fps with 21 3D landmarks per hand:

- Wrist position
- Thumb (4 joints)
- Index finger (4 joints)
- Middle finger (4 joints)
- Ring finger (4 joints)
- Pinky (4 joints)

### Gesture Recognition

Built-in gesture detection:

- **Open Hand**: All fingers extended
- **Closed Hand**: Fist gesture
- **Pinch**: Thumb and index finger touching
- **Point**: Index finger extended, others closed

Plus support for custom gesture definitions.

### 3D Interaction

Pre-built utilities for common 3D interactions:

- Object grabbing and manipulation
- Pointing and selection
- Two-handed scaling and rotation
- Distance-based interactions

### TypeScript-First

Full TypeScript support with comprehensive type definitions:

```ts
interface Hand {
  handedness: 'Left' | 'Right'
  landmarks: Landmark[]
  position: Vector3
  gesture: Gesture
  confidence: number
}
```

## Use Cases

HandTrack3D is perfect for:

- **VR/AR Experiences**: Natural hand interaction without controllers
- **Creative Tools**: Drawing, sculpting, music creation
- **Gaming**: Gesture-based controls
- **Accessibility**: Alternative input methods
- **Presentations**: Hands-free slide navigation
- **Education**: Interactive 3D learning experiences

## Browser Support

HandTrack3D works on all modern browsers with WebRTC support:

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14.1+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Performance

HandTrack3D is optimized for production use:

- **60fps tracking** on modern hardware
- **~50MB memory footprint** including ML models
- **Automatic quality scaling** based on device performance
- **Worker-based processing** to keep UI responsive

## Open Source

HandTrack3D is MIT licensed and open source. We welcome contributions!

- [GitHub Repository](https://github.com/yourusername/handtrack3d)
- [Contributing Guide](/guide/contributing)
- [Roadmap](https://github.com/yourusername/handtrack3d/projects)

## Next Steps

- [Get Started](/guide/getting-started) - Installation and basic usage
- [5-Minute Quickstart](/guide/quickstart) - Build your first app
- [Examples](/examples/) - See HandTrack3D in action
