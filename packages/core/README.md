# @handtrack3d/core

Framework-agnostic 3D hand tracking library powered by MediaPipe Hands. Track hand landmarks, detect gestures, and map to 3D coordinates in real-time.

## Features

- **Framework-agnostic** - Works with vanilla JS, React, Vue, Svelte, or any framework
- **Real-time hand tracking** - Powered by MediaPipe Hands with 21 landmarks per hand
- **Gesture recognition** - Built-in detection for pinch, open hand, fist, and point gestures
- **3D coordinate mapping** - Map hand landmarks to 3D world space for WebGL/Three.js
- **Zero React dependencies** - Pure JavaScript with TypeScript support
- **Multi-hand support** - Track up to 2 hands simultaneously

## Installation

```bash
npm install @handtrack3d/core
# or
pnpm add @handtrack3d/core
# or
yarn add @handtrack3d/core
```

**Prerequisites:**

You must include MediaPipe Hands scripts in your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
```

## Quick Start

```typescript
import { HandTracker } from '@handtrack3d/core';

// Get your video element
const videoElement = document.getElementById('webcam');

// Create hand tracker
const tracker = new HandTracker({
  maxNumHands: 2,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

// Initialize with callback
await tracker.initialize((hands) => {
  console.log(`Detected ${hands.length} hands`);
  hands.forEach((hand) => {
    console.log(`${hand.handedness} hand with ${hand.landmarks.length} landmarks`);
  });
});

// Start camera
await tracker.startCamera(videoElement);

// Cleanup when done
window.addEventListener('beforeunload', () => {
  tracker.close();
});
```

## API Reference

### HandTracker

Main class for hand tracking.

```typescript
const tracker = new HandTracker(config?: MediaPipeConfig);
```

**Configuration options:**

```typescript
interface MediaPipeConfig {
  maxNumHands?: number;              // 1-2 (default: 2)
  modelComplexity?: number;          // 0-1 (default: 1)
  minDetectionConfidence?: number;   // 0-1 (default: 0.5)
  minTrackingConfidence?: number;    // 0-1 (default: 0.5)
  cdnBaseUrl?: string;               // MediaPipe CDN URL
}
```

**Methods:**

- `initialize(onResults, onError?)` - Initialize MediaPipe and set result callback
- `startCamera(videoElement, options?)` - Start tracking from webcam
- `processFrame(imageOrVideo)` - Process a single frame
- `updateConfig(config)` - Update tracking configuration
- `stopCamera()` - Stop the camera
- `close()` - Clean up and release resources

### GestureDetector

Detect hand gestures from landmarks.

```typescript
import { GestureDetector, detectGesture } from '@handtrack3d/core';

// Class-based (stateful)
const detector = new GestureDetector({
  pinchThreshold: 0.05,
  fingerExtensionAngle: 160,
  fistCurlThreshold: 0.15,
  pointExtensionAngle: 160,
});

const gesture = detector.detectGesture(hand.landmarks);
// Returns: 'pinch' | 'open' | 'fist' | 'point' | 'none'

// Or use standalone function
const gesture = detectGesture(hand.landmarks, settings);
```

**Gesture Settings:**

```typescript
interface GestureSettings {
  pinchThreshold: number;          // 0.03-0.08 (default: 0.05)
  fingerExtensionAngle: number;    // 140-175° (default: 160)
  fistCurlThreshold: number;       // 0.10-0.20 (default: 0.15)
  pointExtensionAngle: number;     // 140-175° (default: 160)
}
```

### Coordinate Mapping

Map 2D hand landmarks to 3D world space.

```typescript
import { mapHandTo3D, getIndexFingerTip, getThumbTip } from '@handtrack3d/core';

// Get specific landmarks
const indexTip = getIndexFingerTip(hand.landmarks);
const thumbTip = getThumbTip(hand.landmarks);

// Map to 3D coordinates
const position3D = mapHandTo3D(indexTip);
// Returns: { x, y, z } in world space
```

**Available landmark helpers:**

- `getIndexFingerTip(landmarks)` - Landmark 8
- `getThumbTip(landmarks)` - Landmark 4
- `getWrist(landmarks)` - Landmark 0
- `getMiddleFingerTip(landmarks)` - Landmark 12
- `getRingFingerTip(landmarks)` - Landmark 16
- `getPinkyTip(landmarks)` - Landmark 20
- `getHandCentroid(landmarks)` - Average of all landmarks

### Collision Detection

Utilities for 3D interaction.

```typescript
import { isInGrabRange, calculateGrabOffset } from '@handtrack3d/core';

// Check if hand can grab object
const canGrab = isInGrabRange(
  handPosition,
  objectPosition,
  1.5  // grab range
);

// Calculate grab offset for maintaining relative position
const offset = calculateGrabOffset(handPosition, objectPosition);
```

**Available utilities:**

- `distance3D(a, b)` - Calculate distance between two points
- `isInGrabRange(hand, object, range)` - Check if within grab range
- `calculateGrabOffset(hand, object)` - Get offset vector
- `sphereIntersectsSphere(pos1, r1, pos2, r2)` - Sphere collision
- `pointInSphere(point, center, radius)` - Point-sphere test
- `pointInBox(point, boxMin, boxMax)` - AABB test

## Types

All types are exported from the package:

```typescript
import type {
  Hand,
  HandLandmark,
  HandLandmarks,
  GestureType,
  GestureSettings,
  Vector3D,
  MediaPipeConfig,
} from '@handtrack3d/core';
```

**Hand structure:**

```typescript
interface Hand {
  id: string;                    // Unique hand ID
  handedness: 'Left' | 'Right';  // Which hand
  landmarks: HandLandmark[];     // Screen-space (0-1)
  worldLandmarks: HandLandmark[]; // Real-world (meters)
}

interface HandLandmark {
  x: number;  // 0-1 (or meters for worldLandmarks)
  y: number;  // 0-1 (or meters for worldLandmarks)
  z: number;  // Depth (negative = closer)
}
```

## Examples

See the [examples](./examples) directory for complete working examples:

- `basic.js` - Simple hand detection with console logging
- `gestures.js` - Gesture recognition
- `3d-mapping.js` - Coordinate mapping for 3D scenes

## Related Packages

- **@handtrack3d/react** - React hooks and components
- **@handtrack3d/three** - Three.js integration helpers

## License

MIT

## Links

- [Documentation](https://handtrack3d.dev)
- [GitHub](https://github.com/yourusername/handtrack3d)
- [Issues](https://github.com/yourusername/handtrack3d/issues)
