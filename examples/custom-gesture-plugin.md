# Building a Custom Gesture Plugin

This tutorial shows you how to create a custom gesture detection plugin for HandTrack3D. We'll build an ASL "thumbs-up" gesture detector from scratch.

## Prerequisites

- Basic understanding of MediaPipe hand landmarks
- Familiarity with 3D coordinates (x, y, z)
- TypeScript knowledge (optional but recommended)

## Understanding Hand Landmarks

MediaPipe Hands provides 21 landmarks per hand:

```
Thumb:  0 (wrist), 1, 2, 3, 4 (tip)
Index:  5, 6, 7, 8 (tip)
Middle: 9, 10, 11, 12 (tip)
Ring:   13, 14, 15, 16 (tip)
Pinky:  17, 18, 19, 20 (tip)
```

Each landmark has:
- `x`: Horizontal position (0-1, left to right)
- `y`: Vertical position (0-1, top to bottom)
- `z`: Depth (0 is wrist, negative is toward camera)

## Step 1: Define the Gesture

**Thumbs-up characteristics:**
1. Thumb extended upward (tip above base)
2. Other four fingers curled (tips close to palm)
3. Hand roughly vertical
4. Thumb away from palm (not tucked)

## Step 2: Implement the Plugin

```typescript
import type { HandLandmark } from '@handtrack3d/core';
import type { GestureSettings } from '@handtrack3d/core';
import type { GesturePlugin } from '@handtrack3d/core';

/**
 * Helper: Calculate distance between two landmarks
 */
function distance(a: HandLandmark, b: HandLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export class ThumbsUpPlugin implements GesturePlugin {
  // Required properties
  readonly name = 'asl:thumbs-up';
  readonly version = '1.0.0';
  readonly priority = 70;  // Higher than fist/open (40), lower than pinch (80)
  readonly gestureType = 'thumbs-up';

  detect(landmarks: HandLandmark[], settings: GestureSettings): boolean {
    // Get relevant landmarks
    const wrist = landmarks[0];
    const thumbBase = landmarks[2];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // Criterion 1: Thumb extended upward
    const thumbExtended = thumbTip.y < thumbBase.y - 0.05;
    if (!thumbExtended) return false;

    // Criterion 2: Other fingers curled
    const fingerTips = [indexTip, middleTip, ringTip, pinkyTip];
    const allCurled = fingerTips.every((tip) => {
      const dist = distance(tip, wrist);
      return dist < settings.fistCurlThreshold * 1.2;
    });
    if (!allCurled) return false;

    // Criterion 3: Thumb is highest point
    const thumbIsHighest = fingerTips.every(
      (tip) => thumbTip.y < tip.y - 0.03
    );
    if (!thumbIsHighest) return false;

    // Criterion 4: Thumb extended from palm
    const thumbDist = distance(thumbTip, wrist);
    return thumbDist > 0.08;
  }
}
```

## Step 3: Register and Use

```typescript
import { GestureDetector } from '@handtrack3d/core';
import { ThumbsUpPlugin } from './ThumbsUpPlugin';

// Create detector
const detector = new GestureDetector();

// Register custom gesture
detector.registerGesture(new ThumbsUpPlugin());

// Use in your app
const gesture = detector.detectGesture(landmarks);

if (gesture === 'thumbs-up') {
  console.log('👍 Great job!');
}
```

## Step 4: Testing Your Plugin

### Manual Testing

```typescript
// Create test landmarks (thumbs-up pose)
const testLandmarks: HandLandmark[] = [
  { x: 0.5, y: 0.7, z: 0 },    // 0: wrist
  { x: 0.45, y: 0.65, z: 0 },  // 1: thumb base
  { x: 0.42, y: 0.55, z: 0 },  // 2: thumb joint
  { x: 0.40, y: 0.45, z: 0 },  // 3: thumb joint
  { x: 0.38, y: 0.35, z: 0 },  // 4: thumb tip (high)
  // ... index curled
  { x: 0.52, y: 0.68, z: 0 },  // 5: index base
  { x: 0.54, y: 0.72, z: 0 },  // 6: index joint
  { x: 0.55, y: 0.74, z: 0 },  // 7: index joint
  { x: 0.56, y: 0.75, z: 0 },  // 8: index tip (curled)
  // ... other fingers curled
];

const plugin = new ThumbsUpPlugin();
const isThumbsUp = plugin.detect(testLandmarks, DEFAULT_GESTURE_SETTINGS);
console.assert(isThumbsUp, 'Should detect thumbs-up');
```

### Unit Testing

```typescript
import { describe, it, expect } from 'vitest';
import { ThumbsUpPlugin } from './ThumbsUpPlugin';
import { DEFAULT_GESTURE_SETTINGS } from '@handtrack3d/core';

describe('ThumbsUpPlugin', () => {
  it('should detect thumbs-up gesture', () => {
    const plugin = new ThumbsUpPlugin();
    const landmarks = createThumbsUpLandmarks();

    expect(plugin.detect(landmarks, DEFAULT_GESTURE_SETTINGS)).toBe(true);
  });

  it('should not detect when thumb is down', () => {
    const plugin = new ThumbsUpPlugin();
    const landmarks = createThumbsDownLandmarks();

    expect(plugin.detect(landmarks, DEFAULT_GESTURE_SETTINGS)).toBe(false);
  });

  it('should not detect when fingers are extended', () => {
    const plugin = new ThumbsUpPlugin();
    const landmarks = createOpenHandLandmarks();

    expect(plugin.detect(landmarks, DEFAULT_GESTURE_SETTINGS)).toBe(false);
  });
});
```

## Step 5: Fine-Tuning

### Adjust Thresholds

Tweak detection parameters based on real-world testing:

```typescript
// Too sensitive?
const thumbExtended = thumbTip.y < thumbBase.y - 0.08; // Stricter

// Too strict?
const thumbExtended = thumbTip.y < thumbBase.y - 0.03; // Looser
```

### Add Debugging

```typescript
detect(landmarks: HandLandmark[], settings: GestureSettings): boolean {
  const debug = false; // Enable for debugging

  if (debug) {
    console.log('Thumb Y:', landmarks[4].y);
    console.log('Thumb base Y:', landmarks[2].y);
    console.log('Difference:', landmarks[2].y - landmarks[4].y);
  }

  // ... detection logic
}
```

### Handle Edge Cases

```typescript
// Prevent false positives with sideways thumb
const handOrientation = calculateHandOrientation(landmarks);
if (Math.abs(handOrientation) > 45) {
  return false; // Hand tilted too much
}
```

## Best Practices

### 1. Use Relative Measurements

✅ **Good:** Compare landmark positions relatively
```typescript
const thumbExtended = thumbTip.y < thumbBase.y - 0.05;
```

❌ **Bad:** Use absolute positions
```typescript
const thumbExtended = thumbTip.y < 0.3; // Breaks at different distances
```

### 2. Leverage Settings

Use `GestureSettings` for configurable thresholds:

```typescript
detect(landmarks: HandLandmark[], settings: GestureSettings): boolean {
  const fingersCurled = fingerTips.every((tip) => {
    const dist = distance(tip, wrist);
    return dist < settings.fistCurlThreshold * 1.2; // Reuse fist threshold
  });
}
```

### 3. Set Appropriate Priority

- **High (80+)**: Precise gestures (pinch, snap)
- **Medium (60-70)**: Directional gestures (point, thumbs-up)
- **Low (40-50)**: Broad gestures (fist, open hand)

### 4. Document Your Plugin

```typescript
/**
 * ASL Thumbs-Up Gesture
 *
 * Detects when thumb is extended upward with other fingers curled.
 * Priority: 70 (medium-high)
 *
 * @example
 * ```typescript
 * detector.registerGesture(new ThumbsUpPlugin());
 * if (detector.detectGesture(landmarks) === 'thumbs-up') {
 *   // User gave thumbs up!
 * }
 * ```
 */
```

## Common Pitfalls

### 1. Coordinate System Confusion

Remember: In MediaPipe, Y increases **downward**:
- Small Y = top of frame
- Large Y = bottom of frame

### 2. Distance Scale

Distances are normalized (0-1 range):
- 0.05 = small distance (finger joint)
- 0.15 = medium distance (hand width)
- 0.50 = large distance (full arm extension)

### 3. Handedness

Landmarks are mirrored for left vs right hand. If you need handedness:

```typescript
// MediaPipe provides handedness separately
const isRightHand = handedness === 'Right';
```

## Advanced Features

### Multi-Hand Detection

```typescript
class ThumbsUpPlugin implements GesturePlugin {
  private lastDetectionHand: 'Left' | 'Right' | null = null;

  detect(landmarks: HandLandmark[], settings: GestureSettings, handedness?: string): boolean {
    const isThumbsUp = /* ... detection logic ... */;

    if (isThumbsUp) {
      this.lastDetectionHand = handedness as 'Left' | 'Right';
    }

    return isThumbsUp;
  }

  getDetectionHand(): 'Left' | 'Right' | null {
    return this.lastDetectionHand;
  }
}
```

### Temporal Filtering

Require gesture to be held for multiple frames:

```typescript
class StableThumbsUpPlugin implements GesturePlugin {
  private consecutiveFrames = 0;
  private requiredFrames = 5; // Must hold for 5 frames

  detect(landmarks: HandLandmark[], settings: GestureSettings): boolean {
    const isThumbsUp = /* ... basic detection ... */;

    if (isThumbsUp) {
      this.consecutiveFrames++;
    } else {
      this.consecutiveFrames = 0;
    }

    return this.consecutiveFrames >= this.requiredFrames;
  }
}
```

## Resources

- [MediaPipe Hands Landmarks](https://google.github.io/mediapipe/solutions/hands.html)
- [ASL Alphabet Reference](https://www.startasl.com/american-sign-language-alphabet)
- [HandTrack3D Plugin API](../packages/core/README.md)

## Next Steps

1. **Build More Gestures**: Try "peace sign", "OK", or "rock on"
2. **Create a Plugin Pack**: Bundle related gestures (ASL alphabet, emoji gestures)
3. **Share with Community**: Publish your plugins to npm
4. **Improve Detection**: Add machine learning for complex gestures

Happy gesture coding! 👍
