# @handtrack3d/react

React hooks and components for hand tracking with MediaPipe. Build interactive hand-controlled UIs with ease.

## Features

- **React hooks** - `useHandTracking`, `useGestureRecognition`, `useWebcam`, `useHandTo3DMapping`
- **Context Provider** - `HandTrackingProvider` for app-wide hand tracking state
- **Ready-to-use components** - `WebcamView` and `HandCanvas` for quick setup
- **Gesture detection** - Pinch, open hand, fist, point gestures out of the box
- **3D coordinate mapping** - Map hand positions to 3D space for WebGL/Three.js
- **TypeScript support** - Fully typed with comprehensive type exports
- **Zero dependencies** - Only peer dependencies on React 18/19 and @handtrack3d/core

## Installation

```bash
npm install @handtrack3d/react @handtrack3d/core
# or
pnpm add @handtrack3d/react @handtrack3d/core
# or
yarn add @handtrack3d/react @handtrack3d/core
```

**Prerequisites:**

You must include MediaPipe Hands scripts in your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
```

## Quick Start

### Simple Hand Tracking

```tsx
import { useWebcam, useHandTracking } from '@handtrack3d/react';

function App() {
  const { videoRef, isReady } = useWebcam();
  const { hands, isTracking, startTracking } = useHandTracking({
    maxNumHands: 2,
    minDetectionConfidence: 0.7
  });

  useEffect(() => {
    if (isReady && videoRef.current) {
      startTracking(videoRef.current);
    }
  }, [isReady, startTracking]);

  return (
    <div>
      <video ref={videoRef} width={640} height={480} />
      <p>Tracking: {isTracking ? 'Yes' : 'No'}</p>
      <p>Hands detected: {hands.length}</p>
    </div>
  );
}
```

### With Gesture Recognition

```tsx
import { useWebcam, useHandTracking, useGestureRecognition } from '@handtrack3d/react';

function App() {
  const { videoRef, isReady } = useWebcam();
  const { hands, startTracking } = useHandTracking();
  const { gesture } = useGestureRecognition(hands[0]);

  useEffect(() => {
    if (isReady && videoRef.current) {
      startTracking(videoRef.current);
    }
  }, [isReady, startTracking]);

  return (
    <div>
      <video ref={videoRef} width={640} height={480} />
      <p>Gesture: {gesture}</p>
      {gesture === 'pinch' && <button>Pinching!</button>}
    </div>
  );
}
```

### Using WebcamView Component

The simplest way to get started:

```tsx
import { WebcamView } from '@handtrack3d/react';

function App() {
  return (
    <WebcamView
      onHands={(hands) => console.log(`${hands.length} hands detected`)}
      mirrored={true}
      maxHands={2}
      width={640}
      height={480}
    />
  );
}
```

## API Reference

### Hooks

#### useHandTracking

Track hands from a video source using MediaPipe.

```tsx
const {
  hands,           // Hand[] - detected hands with landmarks
  isTracking,      // boolean - tracking status
  error,           // Error | null - any error that occurred
  startTracking,   // (video: HTMLVideoElement) => Promise<void>
  stopTracking,    // () => void
  updateConfig,    // (config: Partial<MediaPipeConfig>) => void
} = useHandTracking(options);
```

**Options:**

```tsx
interface UseHandTrackingOptions {
  maxNumHands?: number;              // 1-2 (default: 2)
  modelComplexity?: number;          // 0-1 (default: 1)
  minDetectionConfidence?: number;   // 0-1 (default: 0.5)
  minTrackingConfidence?: number;    // 0-1 (default: 0.5)
  autoStart?: boolean;               // Auto-start tracking (default: false)
}
```

#### useGestureRecognition

Recognize gestures from a single hand.

```tsx
const {
  gesture,         // GestureType - 'pinch' | 'open' | 'fist' | 'point' | 'none'
  confidence,      // number - 0-1 confidence score
  updateSettings,  // (settings: Partial<GestureSettings>) => void
} = useGestureRecognition(hand, options);
```

**Options:**

```tsx
interface UseGestureRecognitionOptions {
  pinchThreshold?: number;          // 0.03-0.08 (default: 0.05)
  fingerExtensionAngle?: number;    // 140-175° (default: 160)
  fistCurlThreshold?: number;       // 0.10-0.20 (default: 0.15)
  pointExtensionAngle?: number;     // 140-175° (default: 160)
  debounceMs?: number;              // Debounce time (default: 100)
}
```

#### useMultiHandGestures

Detect gestures for multiple hands at once.

```tsx
const gestures = useMultiHandGestures(hands, options);
// Returns: HandGesture[] = { handId: string, gesture: GestureType, confidence: number }[]
```

#### useWebcam

Access and manage webcam stream.

```tsx
const {
  videoRef,        // RefObject<HTMLVideoElement>
  isReady,         // boolean - webcam is ready
  error,           // string | null - any error
  stream,          // MediaStream | null - raw media stream
} = useWebcam(options);
```

**Options:**

```tsx
interface UseWebcamOptions {
  width?: number;                    // Ideal width (default: 1280)
  height?: number;                   // Ideal height (default: 720)
  facingMode?: 'user' | 'environment'; // Camera facing (default: 'user')
}
```

#### useHandTo3DMapping

Map hand coordinates to 3D space.

```tsx
const {
  position,        // Vector3D - { x, y, z } in world space
  landmark2D,      // { x, y, z } - original 2D landmark (0-1)
} = useHandTo3DMapping(hand, options);
```

**Options:**

```tsx
interface UseHandTo3DMappingOptions {
  landmark?: 'indexTip' | 'thumbTip' | 'wrist' | 'centroid'; // default: 'indexTip'
}
```

#### useMultiHandMapping

Map multiple hands to 3D space.

```tsx
const positions = useMultiHandMapping(hands, options);
// Returns: Array<{ handId: string, position: Vector3D, landmark2D: {...} }>
```

### Components

#### WebcamView

Simple webcam component with automatic hand tracking.

```tsx
<WebcamView
  onHands={(hands) => {...}}         // Callback when hands detected
  onError={(error) => {...}}         // Callback for errors
  mirrored={true}                    // Mirror video (default: true)
  width={640}                        // Display width
  height={480}                       // Display height
  maxHands={2}                       // Max hands to detect
  className="webcam"                 // Custom className
  style={{...}}                      // Custom styles
/>
```

#### HandCanvas

2D canvas overlay for visualizing hand landmarks.

```tsx
<div style={{ position: 'relative' }}>
  <video ref={videoRef} width={640} height={480} />
  <HandCanvas
    hands={hands}
    width={640}
    height={480}
    showLandmarks={true}              // Show landmark dots
    showConnections={true}            // Show finger bones
    landmarkColor="#00ff00"           // Landmark color
    connectionColor="#ffffff"         // Connection color
    landmarkRadius={5}                // Dot size
    connectionWidth={2}               // Line width
  />
</div>
```

### Context Provider

#### HandTrackingProvider

Provide hand tracking state to entire app.

```tsx
import { HandTrackingProvider, useHandTrackingContext } from '@handtrack3d/react';

function App() {
  return (
    <HandTrackingProvider config={{ maxNumHands: 2 }}>
      <YourComponents />
    </HandTrackingProvider>
  );
}

function YourComponents() {
  const { hands, isTracking, startTracking } = useHandTrackingContext();
  // Use hand tracking state...
}
```

## Type Exports

All core types are re-exported for convenience:

```tsx
import type {
  Hand,
  HandLandmark,
  HandLandmarks,
  HandState,
  GestureType,
  HandGesture,
  GestureSettings,
  MediaPipeConfig,
  Vector3D,
} from '@handtrack3d/react';
```

## Examples

### Interactive Button with Pinch Gesture

```tsx
import { useWebcam, useHandTracking, useGestureRecognition } from '@handtrack3d/react';

function PinchButton({ onPinch }) {
  const { videoRef, isReady } = useWebcam();
  const { hands, startTracking } = useHandTracking();
  const { gesture } = useGestureRecognition(hands[0]);

  useEffect(() => {
    if (isReady && videoRef.current) {
      startTracking(videoRef.current);
    }
  }, [isReady, startTracking]);

  useEffect(() => {
    if (gesture === 'pinch') {
      onPinch();
    }
  }, [gesture, onPinch]);

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <button
        style={{
          background: gesture === 'pinch' ? 'green' : 'gray',
          padding: '20px',
        }}
      >
        {gesture === 'pinch' ? 'Pinching!' : 'Pinch to activate'}
      </button>
    </div>
  );
}
```

### Hand Tracking with 3D Position

```tsx
import { useWebcam, useHandTracking, useHandTo3DMapping } from '@handtrack3d/react';

function Hand3DTracker() {
  const { videoRef, isReady } = useWebcam();
  const { hands, startTracking } = useHandTracking();
  const { position } = useHandTo3DMapping(hands[0], { landmark: 'indexTip' });

  useEffect(() => {
    if (isReady && videoRef.current) {
      startTracking(videoRef.current);
    }
  }, [isReady, startTracking]);

  return (
    <div>
      <video ref={videoRef} width={640} height={480} />
      <p>3D Position: ({position.x.toFixed(2)}, {position.y.toFixed(2)}, {position.z.toFixed(2)})</p>
    </div>
  );
}
```

## Related Packages

- **[@handtrack3d/core](../core)** - Core hand tracking library (framework-agnostic)
- **[@handtrack3d/three](../three)** - Three.js integration helpers
- **[@handtrack3d/rapier](../rapier)** - Physics integration with Rapier

## License

MIT

## Links

- [GitHub Repository](https://github.com/kentino/handtrack3d)
- [Documentation](https://github.com/kentino/handtrack3d#readme)
- [Issues](https://github.com/kentino/handtrack3d/issues)
