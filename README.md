# HandTrack3D

<div align="center">

[![npm version](https://img.shields.io/npm/v/@handtrack3d/core?label=core)](https://www.npmjs.com/package/@handtrack3d/core)
[![npm version](https://img.shields.io/npm/v/@handtrack3d/react?label=react)](https://www.npmjs.com/package/@handtrack3d/react)
[![npm version](https://img.shields.io/npm/v/@handtrack3d/three?label=three)](https://www.npmjs.com/package/@handtrack3d/three)
[![npm version](https://img.shields.io/npm/v/@handtrack3d/rapier?label=rapier)](https://www.npmjs.com/package/@handtrack3d/rapier)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-0.180-000000?logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-6+-3178C6?logo=typescript)

**Extensible Plugin Platform for 3D Hand Interaction**

A modular SDK and showcase app that enables custom gesture detection, 3D interactions, and physics engine integration through a powerful plugin system.

[Quick Start](#quick-start) • [SDK Packages](#sdk-packages) • [Plugin System](#plugin-system) • [Features](#features) • [Usage](#usage)

</div>

---

## Overview

HandTrack3D is both a **modular SDK** and **showcase application** for building natural user interfaces in 3D environments. The SDK provides an extensible plugin platform for custom gesture detection, 3D interactions, and physics engine integration, while the showcase app demonstrates these capabilities in action.

### Key Features

#### SDK Features
- 🔌 **Plugin System** - Custom gestures, interactions, and physics adapters
- 📦 **Modular Packages** - Core, React, Three.js, and Rapier integrations
- 🎯 **Priority-Based Detection** - Configure gesture matching order (0-100 scale)
- ⚙️ **Physics Abstraction** - Engine-agnostic physics with adapters (Rapier, Cannon.js)
- 🔧 **Framework Agnostic** - Use with any JavaScript framework or vanilla JS
- 📘 **TypeScript First** - Full type safety with comprehensive definitions
- 🧪 **Well Tested** - 40+ unit tests, integration tests, 90%+ coverage

#### Showcase App Features
- ✋ **Real-time hand tracking** (30fps) with MediaPipe Hands
- 🎯 **3D cursor mapping** from 2D hand landmarks to 3D space
- 👌 **Gesture recognition** (pinch, open hand, fist, point)
- 🎮 **Object interaction** (grab, drag, release, throw)
- 🖐️ **Multi-hand support** (up to 2 hands simultaneously)
- ⚙️ **Physics simulation** (gravity, collisions, realistic motion)
- 🎨 **Visual feedback** with color-coded cursors and trails
- 📊 **Real-time stats** (FPS, hand count, gestures)

---

## SDK Packages

HandTrack3D is available as a set of npm packages for building your own hand tracking applications:

### Installation

```bash
# Install all packages
npm install @handtrack3d/core@alpha
npm install @handtrack3d/react@alpha
npm install @handtrack3d/three@alpha
npm install @handtrack3d/rapier@alpha
```

### Available Packages

| Package | Description | Version |
|---------|-------------|---------|
| **@handtrack3d/core** | Framework-agnostic hand tracking and gesture detection | ![npm](https://img.shields.io/npm/v/@handtrack3d/core) |
| **@handtrack3d/react** | React hooks and components | ![npm](https://img.shields.io/npm/v/@handtrack3d/react) |
| **@handtrack3d/three** | Three.js integration and 3D interactions | ![npm](https://img.shields.io/npm/v/@handtrack3d/three) |
| **@handtrack3d/rapier** | Rapier physics adapter and grab plugin | ![npm](https://img.shields.io/npm/v/@handtrack3d/rapier) |

---

## Plugin System

HandTrack3D's plugin architecture allows you to extend functionality without modifying core code.

### Creating a Custom Gesture

```typescript
import { GestureDetector, GesturePlugin } from '@handtrack3d/core';

class ThumbsUpPlugin implements GesturePlugin {
  readonly name = 'custom:thumbs-up';
  readonly priority = 70;
  readonly gestureType = 'thumbs-up';

  detect(landmarks, settings) {
    const thumbUp = landmarks[4].y < landmarks[2].y;
    const fingersCurled = /* check other fingers */;
    return thumbUp && fingersCurled;
  }
}

const detector = new GestureDetector();
detector.registerGesture(new ThumbsUpPlugin());
const gesture = detector.detectGesture(landmarks); // Can detect 'thumbs-up'
```

### Using Physics Abstraction

```typescript
import { GrabPlugin, RapierAdapter } from '@handtrack3d/rapier';

const adapter = new RapierAdapter();
const grabPlugin = new GrabPlugin(adapter, {
  grabRadius: 0.5,
  throwVelocityScale: 60,
});

// In render loop
grabPlugin.update(hand, rigidBodies);
```

### Plugin Types

1. **GesturePlugin** - Custom gesture detection with priority-based matching
2. **InteractionPlugin** - 3D interaction behaviors (point-select, custom controls)
3. **PhysicsAdapter** - Physics engine abstraction (Rapier, Cannon.js, Ammo.js)

See [examples/](examples/) for complete tutorials on building custom plugins.

---

## Quick Start

### Running the Showcase App

### Prerequisites

- Node.js 18+ or pnpm
- Modern browser (Chrome/Edge recommended)
- Webcam

### Installation

```bash
cd ~/Projects/Active/HandTrack3D
pnpm install
pnpm dev
```

Navigate to **http://localhost:5173** and allow webcam access.

---

## Usage

### Basic Interaction

1. **Show your hand** to the webcam
2. **Pinch** (touch thumb and index finger) near an object to grab it
3. **Move your hand** to drag the object in 3D space
4. **Open your hand** (spread all fingers) to release
5. **Drop or throw** - released objects fall with gravity and can be thrown with velocity

### Physics Features

- **Gravity** (9.81 m/s²) - Objects fall naturally when released
- **Collisions** - Objects bounce off each other and the ground (0.5 restitution)
- **Throwing** - Release objects while moving to launch them with velocity
- **Ground plane** - Invisible floor prevents objects from falling forever
- **Realistic motion** - Damping and friction create natural movement

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `H` | Toggle status panel |
| `Space` | Reset camera (planned) |

### Camera Controls

| Input | Action |
|-------|--------|
| Left click + drag | Rotate camera |
| Right click + drag | Pan camera |
| Scroll wheel | Zoom in/out |

### Gestures

| Gesture | Detection | Visual Feedback |
|---------|-----------|-----------------|
| **Pinch** | Thumb-index distance < 0.05 | Orange, smaller cursor |
| **Open Hand** | All fingers extended (>160°) | Larger cursor, dimmer glow |
| **Fist** | All fingers curled near wrist | Red, medium cursor |
| **None** | Default state | Base color (green/blue) |

---

## Tech Stack

### Core Technologies

- **React 19** - UI framework
- **TypeScript 6** - Type safety
- **Vite 8** - Build tool and dev server
- **Three.js 0.180** - 3D rendering engine
- **React Three Fiber 9.7** - React renderer for Three.js
- **@react-three/drei** - Three.js helpers and components
- **@react-three/rapier** - Physics engine integration

### Computer Vision

- **MediaPipe Hands** - Hand tracking (21 3D landmarks per hand)
- **@mediapipe/camera_utils** - Webcam integration
- Loaded via CDN for compatibility

### State Management

- **Zustand** - Lightweight state management
  - `handTrackingStore` - Hand positions and tracking data
  - `sceneStore` - 3D objects and grab state
  - `useGestureStore` - Gesture detection state
  - `useHandCursorStore` - 3D cursor positions

### Styling

- **Tailwind CSS 3** - Utility-first CSS
- **PostCSS + Autoprefixer** - CSS processing

---

## Architecture

### Data Flow

```
Webcam (30fps)
    ↓
MediaPipe Hands (CDN)
    ↓
handTrackingStore (21 landmarks × 2 hands)
    ↓
┌─────────────────┬──────────────────┐
↓                 ↓                  ↓
Gesture Detection  Hand-to-3D Mapping  HandOverlay (2D)
(pinch/open/fist)  (screen→world)      (skeleton viz)
    ↓                 ↓
useGestureStore    useHandCursorStore
    ↓                 ↓
    └────────┬────────┘
             ↓
    InteractiveObject
    (collision, grab, drag)
             ↓
    sceneStore (object positions)
             ↓
    Scene3D (R3F Canvas, 60fps)
```

### Project Structure

```
HandTrack3D/
├── packages/                      # SDK packages
│   ├── core/                      # @handtrack3d/core
│   │   ├── src/
│   │   │   ├── plugins/           # Plugin system
│   │   │   │   ├── types.ts       # Plugin interfaces
│   │   │   │   └── registry.ts    # Plugin registry
│   │   │   ├── gestures/          # Gesture detection
│   │   │   │   ├── detector.ts    # GestureDetector class
│   │   │   │   └── plugins/       # Built-in gesture plugins
│   │   │   ├── tracking/          # MediaPipe integration
│   │   │   ├── utils/             # Coordinate mapping
│   │   │   └── types/             # TypeScript definitions
│   │   └── package.json
│   ├── react/                     # @handtrack3d/react
│   │   ├── src/
│   │   │   ├── hooks/             # React hooks
│   │   │   └── components/        # React components
│   │   └── package.json
│   ├── three/                     # @handtrack3d/three
│   │   ├── src/
│   │   │   ├── interactions/      # 3D interaction plugins
│   │   │   └── utils/             # Three.js utilities
│   │   └── package.json
│   └── rapier/                    # @handtrack3d/rapier
│       ├── src/
│       │   ├── adapters/          # Physics adapters
│       │   ├── interactions/      # Grab plugin
│       │   ├── hooks/             # React physics hooks
│       │   └── utils/             # Physics utilities
│       └── package.json
├── src/                           # Showcase app
│   ├── components/
│   │   ├── HandTrackingCanvas/    # 3D scene and rendering
│   │   │   ├── HandTrackingCanvas.tsx
│   │   │   ├── Scene3D.tsx
│   │   │   ├── HandMesh.tsx       # 3D cursor with trails
│   │   │   └── InteractiveObject.tsx
│   │   ├── WebcamFeed/            # Webcam and overlay
│   │   │   ├── WebcamFeed.tsx
│   │   │   └── HandOverlay.tsx    # 2D skeleton visualization
│   │   └── ControlPanel/          # Status UI
│   ├── hooks/
│   │   ├── useWebcam.ts           # Camera access
│   │   ├── useHandTracking.ts     # MediaPipe integration
│   │   ├── useHandTo3DMapping.ts  # 2D→3D coordinate mapping
│   │   ├── useGestureRecognition.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── stores/
│   │   ├── handTrackingStore.ts
│   │   └── sceneStore.ts
│   └── utils/
│       └── collisionDetection.ts  # Proximity detection
├── examples/                      # Plugin tutorials
│   ├── custom-gesture-plugin.md
│   ├── custom-interaction-plugin.md
│   └── custom-physics-adapter.md
└── public/                        # Static assets
```

### Key Algorithms

#### Hand-to-3D Mapping

Converts MediaPipe's normalized 2D coordinates (0-1) to 3D world space:

1. Convert to NDC (-1 to 1)
2. Unproject through camera to get direction vector
3. Use MediaPipe z-coordinate for depth (5-10 units from camera)
4. Project along direction to final 3D position

#### Gesture Detection

- **Pinch**: Distance between thumb tip (4) and index tip (8) < 0.05
- **Open Hand**: All finger joint angles > 160° (extended)
- **Fist**: All fingertips within 0.15 units of wrist (curled)
- **Debouncing**: 100ms to prevent flicker

#### Collision Detection

- Proximity: 3D distance between hand cursor and object < 1.5 units
- Grab offset: Store vector from hand to object center
- Drag: Update object position = hand position + grab offset

---

## Browser Compatibility

### Recommended

- ✅ **Chrome 90+** (full support, best performance)
- ✅ **Edge 90+** (full support)

### Supported

- ⚠️ **Firefox 88+** (MediaPipe may have minor issues)
- ⚠️ **Safari 14+** (WebGL limitations, reduced performance)

### Requirements

- WebGL 2.0 support
- WebRTC (getUserMedia) for webcam
- ES2020+ JavaScript features

---

## Troubleshooting

### Webcam not working

- **Check permissions**: Browser must have webcam access
- **HTTPS required**: Some browsers block webcam on `http://` (use `localhost`)
- **Try different browser**: Chrome/Edge have best compatibility

### Hand tracking not detecting

- **Lighting**: Ensure good lighting on your hand
- **Distance**: Keep hand 1-3 feet from webcam
- **Background**: Plain background helps detection
- **Refresh page**: MediaPipe may need reload if it fails to initialize

### Low FPS / Performance

- **Close other tabs**: MediaPipe is CPU-intensive
- **Reduce hands**: Better performance with 1 hand vs 2
- **Lower quality**: Check webcam settings (720p vs 1080p)
- **Hardware acceleration**: Enable in browser settings

### Objects not grabbable

- **Check gesture**: Ensure pinch is detected (status panel shows gesture)
- **Distance**: Move hand closer to object (within 1.5 unit sphere)
- **Open hand to release**: Spread all fingers to drop object

### MediaPipe fails to load

- **CDN issue**: Check network tab for failed script loads
- **Use VPN**: Some regions may block CDN
- **Local hosting**: Download MediaPipe files for offline use

---

## Performance Optimization

- ✅ Hand tracking: 30fps target (debounced updates)
- ✅ 3D rendering: 60fps (separate from tracking)
- ✅ Gesture detection: 100ms debounce
- ✅ Smooth cursor interpolation (lerp 0.3)
- ✅ Trail effects optimized (10 segments)

---

## Development

### Scripts

```bash
pnpm dev          # Start dev server (port 5173)
pnpm build        # Build for production
pnpm preview      # Preview production build
```

### Adding New Gestures

**Using the Plugin System (Recommended)**:

```typescript
import { GesturePlugin } from '@handtrack3d/core';

class MyCustomGesture implements GesturePlugin {
  readonly name = 'custom:my-gesture';
  readonly priority = 50;
  readonly gestureType = 'my-gesture';

  detect(landmarks, settings) {
    // Your detection logic
    return /* boolean */;
  }
}

// Register with detector
detector.registerGesture(new MyCustomGesture());
```

**Direct Modification (Legacy)**:
1. Add gesture type to `src/types/gesture.types.ts`
2. Implement detection in `src/services/gestureDetector.ts`
3. Add visual feedback in `src/components/HandTrackingCanvas/HandMesh.tsx`

### Adding New Objects

1. Define object in `src/types/scene.types.ts`
2. Add to initial state in `src/stores/sceneStore.ts`
3. Update `InteractiveObject.tsx` geometry rendering

---

## Roadmap

### Completed (v0.2.0-alpha.0)
- ✅ Plugin system architecture
- ✅ Physics simulation (gravity, collisions, throwing)
- ✅ Rapier physics adapter
- ✅ Custom gesture plugins (GesturePlugin interface)
- ✅ Custom interaction plugins (InteractionPlugin interface)
- ✅ Physics abstraction (PhysicsAdapter interface)
- ✅ Multi-hand support (up to 2 hands)
- ✅ npm packages published

### Planned (v0.3.0+)
- [ ] Plugin marketplace / discovery
- [ ] Additional physics adapters (Cannon.js, Ammo.js official support)
- [ ] More gesture plugins (swipe, rotate, pinch-to-zoom, two-hand gestures)
- [ ] Performance profiling tools
- [ ] Plugin debugging utilities
- [ ] Settings panel UI (sensitivity, detection thresholds)
- [ ] Custom object creation UI
- [ ] Multi-user collaboration
- [ ] VR/AR integration
- [ ] Gesture recording and playback
- [ ] Example scenes (playground, tutorials)

---

## Links

### Repository
- **GitHub**: [kentin0-fiz0l/HandTrack3D](https://github.com/kentin0-fiz0l/HandTrack3D)
- **Issues**: [Report a bug or request a feature](https://github.com/kentin0-fiz0l/HandTrack3D/issues)
- **Releases**: [View releases](https://github.com/kentin0-fiz0l/HandTrack3D/releases)

### npm Packages
- [@handtrack3d/core](https://www.npmjs.com/package/@handtrack3d/core) - Core hand tracking and gesture detection
- [@handtrack3d/react](https://www.npmjs.com/package/@handtrack3d/react) - React hooks and components
- [@handtrack3d/three](https://www.npmjs.com/package/@handtrack3d/three) - Three.js integration
- [@handtrack3d/rapier](https://www.npmjs.com/package/@handtrack3d/rapier) - Rapier physics adapter

### Documentation
- [Plugin System Guide](examples/custom-gesture-plugin.md)
- [CHANGELOG](CHANGELOG.md)
- [Release Notes v0.2.0-alpha.0](RELEASE_NOTES_v0.2.0-alpha.0.md)

---

## License

MIT License - See LICENSE file for details.

---

## Acknowledgments

- **MediaPipe** by Google for hand tracking ML models
- **Three.js** community for 3D rendering
- **React Three Fiber** for declarative Three.js
- **Rapier** for high-performance physics simulation
- Built with **Claude Opus 4.6** assistance

---

<div align="center">

**v0.2.0-alpha.0** • Plugin System Complete • **Built with ❤️ using TypeScript, React, Three.js, and MediaPipe**

</div>
