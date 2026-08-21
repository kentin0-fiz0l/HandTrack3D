# Two-Hand Gesture Detection

Learn how to detect gestures that require multiple hands simultaneously (scale, rotate, clap).

## Overview

The `MultiHandGestureDetector` enables detection of gestures that require coordination between two or more hands. Unlike `GestureDetector` which analyzes a single hand, `MultiHandGestureDetector` takes an array of hands and checks for multi-hand interactions.

### Built-in Two-Hand Gestures

HandTrack3D includes three built-in two-hand gesture plugins:

| Gesture | Description | Use Cases |
|---------|-------------|-----------|
| **Scale** | Both hands pinching, moving apart/together | Zoom, resize objects |
| **Rotate** | Both hands gripping, rotating around center | Rotate 3D models, images |
| **Clap** | Hands rapidly coming together | Trigger actions, celebrate |

## Installation

```bash
npm install @handtrack3d/core@alpha
```

## Quick Start

### Basic Usage

```typescript
import {
  MultiHandGestureDetector,
  TwoHandScaleGesturePlugin,
  TwoHandRotateGesturePlugin,
  ClapGesturePlugin,
} from '@handtrack3d/core';

// Create detector
const detector = new MultiHandGestureDetector();

// Register plugins
detector.registerGesture(new TwoHandScaleGesturePlugin());
detector.registerGesture(new TwoHandRotateGesturePlugin());
detector.registerGesture(new ClapGesturePlugin());

// With hand tracking results (array of hands)
const hands = [leftHandLandmarks, rightHandLandmarks];
const gesture = detector.detectGesture(hands);

if (gesture === 'scale') {
  console.log('User is scaling!');
} else if (gesture === 'rotate') {
  console.log('User is rotating!');
} else if (gesture === 'clap') {
  console.log('User clapped!');
}
```

### React Integration

```typescript
import { useHandTracking } from '@handtrack3d/react';
import {
  MultiHandGestureDetector,
  TwoHandScaleGesturePlugin,
} from '@handtrack3d/core';
import { useMemo, useEffect } from 'react';

function App() {
  const { hands } = useHandTracking();

  // Create detector (memoized)
  const detector = useMemo(() => {
    const det = new MultiHandGestureDetector();
    det.registerGesture(new TwoHandScaleGesturePlugin());
    return det;
  }, []);

  useEffect(() => {
    if (hands.length >= 2) {
      // Extract landmarks from all hands
      const allHandLandmarks = hands.map((hand) => hand.landmarks);
      const gesture = detector.detectGesture(allHandLandmarks);

      if (gesture === 'scale') {
        console.log('Scaling detected!');
      }
    }
  }, [hands, detector]);

  return <div>Multi-hand tracking active</div>;
}
```

## Built-in Plugins

### TwoHandScaleGesturePlugin

Detects when both hands are pinching and moving apart (zoom in) or together (zoom out).

**Requirements:**
- Both hands must be pinching (thumb + index finger close)
- Distance between hands must exceed minimum threshold
- Distance change must exceed threshold

**Configuration:**

```typescript
const plugin = new TwoHandScaleGesturePlugin({
  minDistance: 0.1, // Minimum distance between hands (normalized)
  distanceThreshold: 0.05, // Distance change to trigger detection
  maxDuration: 500, // Maximum time window for tracking (ms)
  historySamples: 5, // Number of samples to track
});
```

**Get Scale Amount:**

```typescript
const detector = new MultiHandGestureDetector();
const plugin = new TwoHandScaleGesturePlugin();
detector.registerGesture(plugin);

// After detection
if (detector.detectGesture(hands) === 'scale') {
  const delta = plugin.getScaleDelta();
  // delta > 0: zooming in
  // delta < 0: zooming out

  const scaleFactor = 1 + delta * 2; // Adjust sensitivity
  object.scale.multiplyScalar(scaleFactor);
}
```

**Real-world Example (Image Zoom):**

```typescript
import { MultiHandGestureDetector, TwoHandScaleGesturePlugin } from '@handtrack3d/core';

const detector = new MultiHandGestureDetector();
const scalePlugin = new TwoHandScaleGesturePlugin({
  minDistance: 0.15, // Hands must be at least 15cm apart
  distanceThreshold: 0.03, // 3cm change triggers zoom
});
detector.registerGesture(scalePlugin);

function updateImageZoom(hands: HandLandmark[][]) {
  if (detector.detectGesture(hands) === 'scale') {
    const delta = scalePlugin.getScaleDelta();
    const scaleFactor = 1 + delta * 1.5; // Smooth scaling

    imageElement.style.transform = `scale(${currentScale * scaleFactor})`;
    currentScale *= scaleFactor;
  }
}
```

---

### TwoHandRotateGesturePlugin

Detects when both hands are gripping and rotating around a center point.

**Requirements:**
- Both hands must be gripping (pinch or fist)
- Angle between hands must be changing
- Angle change must exceed threshold

**Configuration:**

```typescript
const plugin = new TwoHandRotateGesturePlugin({
  angleThreshold: 0.1, // ~5.7 degrees minimum rotation
  maxDuration: 500, // Maximum time window (ms)
  historySamples: 5, // Number of samples to track
});
```

**Get Rotation Amount:**

```typescript
const detector = new MultiHandGestureDetector();
const plugin = new TwoHandRotateGesturePlugin();
detector.registerGesture(plugin);

// After detection
if (detector.detectGesture(hands) === 'rotate') {
  const angleDelta = plugin.getRotationAngle(); // In radians

  object.rotation.z += angleDelta; // Apply rotation
}
```

**Real-world Example (3D Model Rotation):**

```typescript
import { MultiHandGestureDetector, TwoHandRotateGesturePlugin } from '@handtrack3d/core';
import * as THREE from 'three';

const detector = new MultiHandGestureDetector();
const rotatePlugin = new TwoHandRotateGesturePlugin({
  angleThreshold: 0.05, // ~3 degrees
});
detector.registerGesture(rotatePlugin);

function rotateMeshWithHands(hands: HandLandmark[][], mesh: THREE.Mesh) {
  if (detector.detectGesture(hands) === 'rotate') {
    const angleDelta = rotatePlugin.getRotationAngle();

    // Apply rotation around Y axis (vertical rotation)
    mesh.rotation.y += angleDelta;

    // Optional: Add rotation damping for smoothness
    mesh.rotation.y *= 0.95;
  }
}
```

---

### ClapGesturePlugin

Detects when both hands rapidly come together (clapping motion).

**Requirements:**
- Hands must approach each other quickly (high velocity)
- Hands must come within close proximity
- Cooldown period prevents rapid re-triggering

**Configuration:**

```typescript
const plugin = new ClapGesturePlugin({
  clapDistance: 0.15, // Maximum distance for clap (normalized)
  clapVelocity: 2.0, // Minimum approach velocity (units/sec)
  cooldownMs: 500, // Cooldown between claps (ms)
  maxDuration: 300, // Maximum time window for velocity calculation
});
```

**Real-world Example (Trigger Action):**

```typescript
import { MultiHandGestureDetector, ClapGesturePlugin } from '@handtrack3d/core';

const detector = new MultiHandGestureDetector();
const clapPlugin = new ClapGesturePlugin({
  clapDistance: 0.1, // Hands must be very close
  clapVelocity: 3.0, // Fast clap
  cooldownMs: 1000, // 1 second between claps
});
detector.registerGesture(clapPlugin);

let score = 0;

function handleClap(hands: HandLandmark[][]) {
  if (detector.detectGesture(hands) === 'clap') {
    score++;
    playSound('clap.mp3');
    showAnimation('clap-effect');
    console.log(`Score: ${score}`);
  }
}
```

## Advanced Usage

### Priority-Based Detection

Plugins with higher priority are checked first. Clap has priority 80, while scale and rotate have priority 70.

```typescript
const detector = new MultiHandGestureDetector();

// Clap (priority 80) will be checked before scale (priority 70)
detector.registerGesture(new ClapGesturePlugin());
detector.registerGesture(new TwoHandScaleGesturePlugin());

// Custom priority
class MyGesturePlugin implements MultiHandGesturePlugin {
  readonly name = 'custom:gesture';
  readonly priority = 90; // Highest priority
  readonly gestureType = 'custom';
  readonly requiredHands = 2;

  detect(hands: HandLandmark[][], settings: GestureSettings): boolean {
    // Custom detection logic
    return false;
  }
}
```

### Combining with Single-Hand Gestures

You can use both `GestureDetector` and `MultiHandGestureDetector` together:

```typescript
import { GestureDetector, MultiHandGestureDetector } from '@handtrack3d/core';

const singleHandDetector = new GestureDetector();
const multiHandDetector = new MultiHandGestureDetector();

function detectAllGestures(hands: HandLandmark[][]) {
  // Check multi-hand gestures first
  if (hands.length >= 2) {
    const multiGesture = multiHandDetector.detectGesture(hands);
    if (multiGesture !== 'none') {
      return { type: 'multi', gesture: multiGesture };
    }
  }

  // Fall back to single-hand gestures
  if (hands.length >= 1) {
    const singleGesture = singleHandDetector.detectGesture(hands[0]);
    return { type: 'single', gesture: singleGesture };
  }

  return { type: 'none', gesture: 'none' };
}
```

### Detailed Detection Results

Get additional metadata about the detected gesture:

```typescript
const result = detector.detectGestureDetailed(hands);

console.log(result.type); // 'scale', 'rotate', 'clap', or 'none'
console.log(result.handCount); // Number of hands
console.log(result.timestamp); // Detection timestamp
```

### Custom Multi-Hand Gesture

Create your own multi-hand gesture plugin:

```typescript
import type { MultiHandGesturePlugin } from '@handtrack3d/core';
import type { HandLandmark } from '@handtrack3d/core';
import type { GestureSettings } from '@handtrack3d/core';

class HighFiveGesturePlugin implements MultiHandGesturePlugin {
  readonly name = 'custom:high-five';
  readonly priority = 75;
  readonly gestureType = 'high-five';
  readonly requiredHands = 2;

  detect(hands: HandLandmark[][], settings: GestureSettings): boolean {
    if (hands.length < 2) return false;

    const [hand1, hand2] = hands;

    // Both hands open (fingers extended)
    const hand1Open = this.isHandOpen(hand1);
    const hand2Open = this.isHandOpen(hand2);

    // Palms facing each other (close X distance, different Y)
    const palm1 = hand1[0]; // Wrist
    const palm2 = hand2[0];
    const dx = Math.abs(palm2.x - palm1.x);
    const dy = Math.abs(palm2.y - palm1.y);

    return hand1Open && hand2Open && dx < 0.1 && dy > 0.05;
  }

  private isHandOpen(landmarks: HandLandmark[]): boolean {
    // Check if all fingers are extended
    const fingerTips = [landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
    const wrist = landmarks[0];

    return fingerTips.every((tip) => {
      const distance = Math.sqrt(
        (tip.x - wrist.x) ** 2 + (tip.y - wrist.y) ** 2 + (tip.z - wrist.z) ** 2
      );
      return distance > 0.15; // Extended threshold
    });
  }
}

// Use it
const detector = new MultiHandGestureDetector();
detector.registerGesture(new HighFiveGesturePlugin());
```

## Real-World Examples

### Interactive 3D Model Viewer

```typescript
import { MultiHandGestureDetector, TwoHandScaleGesturePlugin, TwoHandRotateGesturePlugin } from '@handtrack3d/core';
import { Canvas, useFrame } from '@react-three/fiber';
import { useHandTracking } from '@handtrack3d/react';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function Model3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { hands } = useHandTracking();

  const detector = useMemo(() => {
    const det = new MultiHandGestureDetector();
    det.registerGesture(new TwoHandScaleGesturePlugin());
    det.registerGesture(new TwoHandRotateGesturePlugin());
    return det;
  }, []);

  const scalePlugin = detector.getGesturePlugins().find(
    (p) => p.gestureType === 'scale'
  ) as TwoHandScaleGesturePlugin;

  const rotatePlugin = detector.getGesturePlugins().find(
    (p) => p.gestureType === 'rotate'
  ) as TwoHandRotateGesturePlugin;

  useFrame(() => {
    if (!meshRef.current || hands.length < 2) return;

    const handLandmarks = hands.map((h) => h.landmarks);
    const gesture = detector.detectGesture(handLandmarks);

    if (gesture === 'scale') {
      const delta = scalePlugin.getScaleDelta();
      const scaleFactor = 1 + delta * 2;
      meshRef.current.scale.multiplyScalar(scaleFactor);
    } else if (gesture === 'rotate') {
      const angleDelta = rotatePlugin.getRotationAngle();
      meshRef.current.rotation.y += angleDelta;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

export default function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <Model3D />
    </Canvas>
  );
}
```

### Image Gallery with Pinch Zoom

```typescript
import { MultiHandGestureDetector, TwoHandScaleGesturePlugin } from '@handtrack3d/core';
import { useHandTracking } from '@handtrack3d/react';
import { useMemo, useState, useEffect } from 'react';

function ImageGallery({ images }: { images: string[] }) {
  const { hands } = useHandTracking();
  const [scale, setScale] = useState(1);

  const detector = useMemo(() => {
    const det = new MultiHandGestureDetector();
    det.registerGesture(
      new TwoHandScaleGesturePlugin({
        minDistance: 0.2,
        distanceThreshold: 0.04,
      })
    );
    return det;
  }, []);

  const scalePlugin = detector.getGesturePlugins()[0] as TwoHandScaleGesturePlugin;

  useEffect(() => {
    if (hands.length >= 2) {
      const handLandmarks = hands.map((h) => h.landmarks);

      if (detector.detectGesture(handLandmarks) === 'scale') {
        const delta = scalePlugin.getScaleDelta();
        setScale((prev) => Math.max(0.5, Math.min(3, prev * (1 + delta * 1.5))));
      }
    }
  }, [hands, detector, scalePlugin]);

  return (
    <div style={{ transform: `scale(${scale})`, transition: 'transform 0.1s' }}>
      {images.map((src) => (
        <img key={src} src={src} alt="Gallery" />
      ))}
    </div>
  );
}
```

### Clap-to-Celebrate Game

```typescript
import { MultiHandGestureDetector, ClapGesturePlugin } from '@handtrack3d/core';
import { useHandTracking } from '@handtrack3d/react';
import { useMemo, useState, useEffect } from 'react';

function ClapGame() {
  const { hands } = useHandTracking();
  const [clapCount, setClapCount] = useState(0);
  const [showEffect, setShowEffect] = useState(false);

  const detector = useMemo(() => {
    const det = new MultiHandGestureDetector();
    det.registerGesture(
      new ClapGesturePlugin({
        clapDistance: 0.12,
        clapVelocity: 2.5,
        cooldownMs: 800,
      })
    );
    return det;
  }, []);

  useEffect(() => {
    if (hands.length >= 2) {
      const handLandmarks = hands.map((h) => h.landmarks);

      if (detector.detectGesture(handLandmarks) === 'clap') {
        setClapCount((prev) => prev + 1);
        setShowEffect(true);

        // Play sound
        const audio = new Audio('/clap-sound.mp3');
        audio.play();

        // Hide effect after animation
        setTimeout(() => setShowEffect(false), 500);
      }
    }
  }, [hands, detector]);

  return (
    <div>
      <h1>Clap Counter: {clapCount}</h1>
      {showEffect && (
        <div className="clap-animation">
          👏
        </div>
      )}
    </div>
  );
}
```

## Performance Tips

1. **Memoize Detector**: Create detector instance once and reuse
   ```typescript
   const detector = useMemo(() => new MultiHandGestureDetector(), []);
   ```

2. **Limit Hand Count**: Only process when enough hands are present
   ```typescript
   if (hands.length >= 2) {
     detector.detectGesture(hands);
   }
   ```

3. **Adjust History Samples**: Fewer samples = faster but less accurate
   ```typescript
   new TwoHandScaleGesturePlugin({ historySamples: 3 }); // Faster
   ```

4. **Debounce Actions**: Prevent excessive updates
   ```typescript
   const debouncedScale = debounce((delta) => {
     applyScale(delta);
   }, 50);
   ```

## Troubleshooting

### Scale not detecting

**Problem**: Two-hand scale gesture not triggering

**Solutions**:
- Ensure both hands are pinching (thumb + index close)
- Check `minDistance` threshold (hands might be too close)
- Verify `distanceThreshold` (might be too high)
- Add logging to see distance values:
  ```typescript
  const plugin = new TwoHandScaleGesturePlugin();
  // In detection loop
  console.log('Delta:', plugin.getScaleDelta());
  ```

### Rotate detection inconsistent

**Problem**: Rotation gesture triggering randomly

**Solutions**:
- Increase `angleThreshold` to require more rotation
- Check that both hands are gripping (pinch or fist)
- Verify hands aren't switching positions (confusing angle calculation)

### Clap triggering too often

**Problem**: Clap gesture detecting unintended claps

**Solutions**:
- Increase `clapVelocity` to require faster approach
- Decrease `clapDistance` to require closer proximity
- Increase `cooldownMs` to prevent rapid re-triggering
- Check maxDuration (shorter = stricter timing)

## API Reference

### MultiHandGestureDetector

```typescript
class MultiHandGestureDetector {
  constructor(settings?: Partial<GestureSettings>);

  registerGesture(plugin: MultiHandGesturePlugin): void;
  unregisterGesture(name: string): boolean;
  getGesturePlugins(): MultiHandGesturePlugin[];
  hasGesture(name: string): boolean;

  detectGesture(hands: HandLandmark[][]): GestureType;
  detectGestureDetailed(hands: HandLandmark[][]): MultiHandGestureResult;

  updateSettings(settings: Partial<GestureSettings>): void;
  getSettings(): GestureSettings;

  dispose(): void;
}
```

### MultiHandGesturePlugin Interface

```typescript
interface MultiHandGesturePlugin {
  readonly name: string;
  readonly priority: number; // 0-100, higher = checked first
  readonly gestureType: string;
  readonly requiredHands: number;

  detect(hands: HandLandmark[][], settings: GestureSettings): boolean;

  initialize?(): void;
  dispose?(): void;
}
```

## TypeScript Support

All multi-hand gesture types are fully typed:

```typescript
import type {
  MultiHandGestureDetector,
  MultiHandGesturePlugin,
  MultiHandGestureResult,
  TwoHandScaleOptions,
  HandLandmark,
  GestureSettings,
} from '@handtrack3d/core';
```

## Next Steps

- Learn about [custom physics adapters](./custom-physics-adapter.md)
- Explore [single-hand gesture plugins](./swipe-gesture-detection.md)
- Check out the [React integration guide](../packages/react/README.md)

## Resources

- [API Reference](../packages/core/README.md)
- [Plugin System Guide](../packages/core/src/plugins/README.md)
- [GestureDetector (single-hand)](../packages/core/src/gestures/detector.ts)
- [Example: Interactive 3D Viewer](../src/components/HandTrackingCanvas/README.md)
