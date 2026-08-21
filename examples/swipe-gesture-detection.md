# Swipe Gesture Detection Guide

Learn how to use and customize the built-in swipe gesture plugins for directional hand movement detection.

## Overview

Swipe gestures detect directional hand movement based on velocity and direction. HandTrack3D includes four built-in swipe plugins:

- **SwipeLeftGesturePlugin** - Detects horizontal left movement
- **SwipeRightGesturePlugin** - Detects horizontal right movement
- **SwipeUpGesturePlugin** - Detects vertical upward movement
- **SwipeDownGesturePlugin** - Detects vertical downward movement

## Quick Start

### Basic Usage

```typescript
import { GestureDetector, SwipeLeftGesturePlugin } from '@handtrack3d/core';

const detector = new GestureDetector({}, { registerBuiltins: false });

// Register swipe gesture
detector.registerGesture(new SwipeLeftGesturePlugin());

// Detect gestures
const gesture = detector.detectGesture(landmarks);

if (gesture === 'swipeLeft') {
  console.log('User swiped left!');
}
```

### Register All Swipe Directions

```typescript
import {
  GestureDetector,
  SwipeLeftGesturePlugin,
  SwipeRightGesturePlugin,
  SwipeUpGesturePlugin,
  SwipeDownGesturePlugin,
} from '@handtrack3d/core';

const detector = new GestureDetector();

// Add swipe gestures (built-in gestures like pinch/fist are auto-registered)
detector.registerGesture(new SwipeLeftGesturePlugin());
detector.registerGesture(new SwipeRightGesturePlugin());
detector.registerGesture(new SwipeUpGesturePlugin());
detector.registerGesture(new SwipeDownGesturePlugin());

// Now can detect 8 gestures total:
// - pinch, open, fist, point (built-in)
// - swipeLeft, swipeRight, swipeUp, swipeDown (added)
```

## How It Works

### Velocity-Based Detection

Swipe gestures track hand position over time to calculate velocity:

1. **Position Tracking**: Records wrist (landmark 0) position with timestamps
2. **Velocity Calculation**: Computes velocity from position history
3. **Direction Matching**: Checks if velocity matches expected direction
4. **Threshold Check**: Ensures velocity exceeds minimum threshold

### Example Detection Flow

```
User swipes left →
  Position samples: [(0.7, 0.5, t0), (0.6, 0.5, t1), (0.5, 0.5, t2)]
  Velocity: (-2.5, 0.0) units/second
  Direction: Horizontal (left is negative X)
  Threshold: Exceeds 2.0 units/second ✓
  Result: swipeLeft detected!
```

## Configuration Options

All swipe plugins accept `SwipeGestureOptions`:

```typescript
interface SwipeGestureOptions {
  /**
   * Minimum velocity required to trigger swipe (units per second)
   * @default 2.0
   */
  minVelocity?: number;

  /**
   * Maximum time window for swipe detection (milliseconds)
   * @default 500
   */
  maxDuration?: number;

  /**
   * Number of position samples to track for velocity calculation
   * @default 5
   */
  historySamples?: number;

  /**
   * Minimum ratio of dominant direction vs. perpendicular direction
   * Higher values require more directional swipes
   * @default 1.5
   */
  directionalityThreshold?: number;
}
```

### Custom Configuration Examples

#### Faster Swipe Required

```typescript
const fastSwipe = new SwipeLeftGesturePlugin({
  minVelocity: 4.0, // Double the default speed
});
```

#### Longer Swipe Duration

```typescript
const slowSwipe = new SwipeLeftGesturePlugin({
  maxDuration: 1000, // Allow 1 second swipes
  minVelocity: 1.0,  // Lower threshold for slower movement
});
```

#### More Directional Swipes

```typescript
const strictSwipe = new SwipeLeftGesturePlugin({
  directionalityThreshold: 2.5, // Must be 2.5x more horizontal than vertical
});
```

#### Smoother Detection

```typescript
const smoothSwipe = new SwipeLeftGesturePlugin({
  historySamples: 10, // Track more samples for smoother velocity
});
```

## Real-World Examples

### Image Gallery Navigation

```typescript
import { GestureDetector, SwipeLeftGesturePlugin, SwipeRightGesturePlugin } from '@handtrack3d/core';

class ImageGallery {
  private detector: GestureDetector;
  private currentIndex = 0;
  private images: string[];

  constructor(images: string[]) {
    this.images = images;
    this.detector = new GestureDetector({}, { registerBuiltins: false });

    // Configure for gallery navigation
    const swipeOptions = {
      minVelocity: 2.5,
      directionalityThreshold: 2.0, // Prevent accidental diagonal swipes
    };

    this.detector.registerGesture(new SwipeLeftGesturePlugin(swipeOptions));
    this.detector.registerGesture(new SwipeRightGesturePlugin(swipeOptions));
  }

  update(landmarks: HandLandmark[]) {
    const gesture = this.detector.detectGesture(landmarks);

    if (gesture === 'swipeLeft') {
      this.nextImage();
    } else if (gesture === 'swipeRight') {
      this.previousImage();
    }
  }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.render();
  }

  previousImage() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.render();
  }

  render() {
    console.log(`Showing image ${this.currentIndex + 1}/${this.images.length}`);
    // Update DOM with this.images[this.currentIndex]
  }
}

// Usage
const gallery = new ImageGallery(['img1.jpg', 'img2.jpg', 'img3.jpg']);

// In animation loop
handTracker.onResults((hands) => {
  if (hands.length > 0) {
    gallery.update(hands[0].landmarks);
  }
});
```

### Scroll Control

```typescript
import { GestureDetector, SwipeUpGesturePlugin, SwipeDownGesturePlugin } from '@handtrack3d/core';

class ScrollController {
  private detector: GestureDetector;
  private scrollSpeed = 100; // pixels per swipe

  constructor() {
    this.detector = new GestureDetector({}, { registerBuiltins: false });

    // Configure for scrolling
    const scrollOptions = {
      minVelocity: 2.0,
      maxDuration: 400,
    };

    this.detector.registerGesture(new SwipeUpGesturePlugin(scrollOptions));
    this.detector.registerGesture(new SwipeDownGesturePlugin(scrollOptions));
  }

  update(landmarks: HandLandmark[]) {
    const gesture = this.detector.detectGesture(landmarks);

    if (gesture === 'swipeUp') {
      this.scrollUp();
    } else if (gesture === 'swipeDown') {
      this.scrollDown();
    }
  }

  scrollUp() {
    window.scrollBy({ top: -this.scrollSpeed, behavior: 'smooth' });
  }

  scrollDown() {
    window.scrollBy({ top: this.scrollSpeed, behavior: 'smooth' });
  }
}

// Usage
const scrollController = new ScrollController();

handTracker.onResults((hands) => {
  if (hands.length > 0) {
    scrollController.update(hands[0].landmarks);
  }
});
```

### Menu Navigation (All Directions)

```typescript
import {
  GestureDetector,
  SwipeLeftGesturePlugin,
  SwipeRightGesturePlugin,
  SwipeUpGesturePlugin,
  SwipeDownGesturePlugin,
} from '@handtrack3d/core';

class MenuNavigator {
  private detector: GestureDetector;
  private selectedItem = { x: 0, y: 0 };
  private menu = [
    ['Home', 'Settings', 'Profile'],
    ['Files', 'Photos', 'Videos'],
    ['Help', 'About', 'Exit'],
  ];

  constructor() {
    this.detector = new GestureDetector({}, { registerBuiltins: false });

    // Fast, directional swipes for menu navigation
    const menuOptions = {
      minVelocity: 3.0,
      directionalityThreshold: 2.0,
    };

    this.detector.registerGesture(new SwipeLeftGesturePlugin(menuOptions));
    this.detector.registerGesture(new SwipeRightGesturePlugin(menuOptions));
    this.detector.registerGesture(new SwipeUpGesturePlugin(menuOptions));
    this.detector.registerGesture(new SwipeDownGesturePlugin(menuOptions));
  }

  update(landmarks: HandLandmark[]) {
    const gesture = this.detector.detectGesture(landmarks);

    switch (gesture) {
      case 'swipeLeft':
        this.moveLeft();
        break;
      case 'swipeRight':
        this.moveRight();
        break;
      case 'swipeUp':
        this.moveUp();
        break;
      case 'swipeDown':
        this.moveDown();
        break;
    }
  }

  moveLeft() {
    this.selectedItem.x = Math.max(0, this.selectedItem.x - 1);
    this.render();
  }

  moveRight() {
    this.selectedItem.x = Math.min(2, this.selectedItem.x + 1);
    this.render();
  }

  moveUp() {
    this.selectedItem.y = Math.max(0, this.selectedItem.y - 1);
    this.render();
  }

  moveDown() {
    this.selectedItem.y = Math.min(2, this.selectedItem.y + 1);
    this.render();
  }

  render() {
    const { x, y } = this.selectedItem;
    const item = this.menu[y][x];
    console.log(`Selected: ${item} at (${x}, ${y})`);
    // Highlight menu item in UI
  }
}

// Usage
const menuNav = new MenuNavigator();

handTracker.onResults((hands) => {
  if (hands.length > 0) {
    menuNav.update(hands[0].landmarks);
  }
});
```

## Advanced Usage

### Debouncing Swipes

Prevent rapid-fire swipe detection:

```typescript
class DebouncedSwipeDetector {
  private detector: GestureDetector;
  private lastSwipeTime = 0;
  private debounceMs = 500; // 500ms between swipes

  constructor() {
    this.detector = new GestureDetector();
    this.detector.registerGesture(new SwipeLeftGesturePlugin());
  }

  update(landmarks: HandLandmark[]): string | null {
    const gesture = this.detector.detectGesture(landmarks);
    const now = Date.now();

    if (gesture.startsWith('swipe') && now - this.lastSwipeTime > this.debounceMs) {
      this.lastSwipeTime = now;
      return gesture;
    }

    return null;
  }
}
```

### Combining with Other Gestures

```typescript
const detector = new GestureDetector();

// Mix swipes with other gestures
detector.registerGesture(new SwipeLeftGesturePlugin());
detector.registerGesture(new SwipeRightGesturePlugin());

// Built-in gestures (pinch, fist, etc.) are auto-registered

const gesture = detector.detectGesture(landmarks);

switch (gesture) {
  case 'pinch':
    console.log('Grab object');
    break;
  case 'swipeLeft':
    console.log('Navigate left');
    break;
  case 'swipeRight':
    console.log('Navigate right');
    break;
  case 'open':
    console.log('Release object');
    break;
}
```

## Performance Tips

1. **Adjust History Samples**: Fewer samples = faster but less smooth
   ```typescript
   new SwipeLeftGesturePlugin({ historySamples: 3 }); // Fast detection
   ```

2. **Increase Velocity Threshold**: Higher threshold = fewer false positives
   ```typescript
   new SwipeLeftGesturePlugin({ minVelocity: 3.5 }); // Deliberate swipes only
   ```

3. **Shorter Duration**: Limits memory usage
   ```typescript
   new SwipeLeftGesturePlugin({ maxDuration: 300 }); // Quick swipes only
   ```

4. **Clear History on Scene Change**: Call `dispose()` when changing contexts
   ```typescript
   swipePlugin.dispose(); // Clears position history
   ```

## Troubleshooting

### Swipes Not Detecting

**Problem**: Swipes aren't being recognized

**Solutions**:
- Lower `minVelocity` (try 1.5 or 1.0)
- Increase `maxDuration` (try 700-1000ms)
- Lower `directionalityThreshold` (try 1.2)
- Check camera framerate (need consistent updates)

### Too Many False Positives

**Problem**: Accidental swipes detected during other movements

**Solutions**:
- Increase `minVelocity` (try 3.0 or higher)
- Increase `directionalityThreshold` (try 2.0 or higher)
- Decrease `maxDuration` (try 300ms)
- Add debouncing (see Advanced Usage)

### Diagonal Swipes Detected

**Problem**: Diagonal movement triggers horizontal/vertical swipes

**Solutions**:
- Increase `directionalityThreshold` to 2.5 or higher
- This requires movement to be 2.5x stronger in primary direction

### Swipes Too Sensitive

**Problem**: Small movements trigger swipes

**Solutions**:
- Increase `minVelocity`
- Reduce `historySamples` (requires faster movement over shorter time)

## API Reference

### Plugin Properties

```typescript
class SwipeLeftGesturePlugin {
  readonly name = 'builtin:swipe-left';
  readonly gestureType = 'swipeLeft';
  readonly priority = 60;
  readonly direction = 'left';

  constructor(options?: SwipeGestureOptions);
  detect(landmarks: HandLandmark[], settings: GestureSettings): boolean;
  dispose(): void;
}
```

### Gesture Types

| Plugin | Gesture Type | Direction |
|--------|-------------|-----------|
| SwipeLeftGesturePlugin | `'swipeLeft'` | Horizontal left (negative X) |
| SwipeRightGesturePlugin | `'swipeRight'` | Horizontal right (positive X) |
| SwipeUpGesturePlugin | `'swipeUp'` | Vertical up (negative Y) |
| SwipeDownGesturePlugin | `'swipeDown'` | Vertical down (positive Y) |

### Priority

Swipe gestures have priority `60`, placing them between:
- **Higher priority (80)**: Pinch, Point - detected first
- **Lower priority (40-75)**: Fist, Open hand - detected after swipes

## Next Steps

- See [custom-gesture-plugin.md](./custom-gesture-plugin.md) for creating your own gestures
- See [custom-interaction-plugin.md](./custom-interaction-plugin.md) for 3D interactions
- Check out the showcase app for live swipe gesture demos

## Links

- [Core Package Documentation](../packages/core/README.md)
- [Plugin System Guide](./custom-gesture-plugin.md)
- [GitHub Repository](https://github.com/kentin0-fiz0l/HandTrack3D)
