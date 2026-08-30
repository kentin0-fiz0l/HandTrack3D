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

**Core Functionality**:
- ✋ **Real-time hand tracking** (30fps) with MediaPipe Hands
- 🎯 **3D cursor mapping** from 2D hand landmarks to 3D space
- 👌 **Gesture recognition** (pinch, open hand, fist, point, swipe)
- 🎮 **Object interaction** (grab, drag, release, throw)
- 🖐️ **Multi-hand support** (up to 2 hands simultaneously)
- ⚙️ **Physics simulation** with Rapier (gravity, collisions, realistic motion)

**UX & Onboarding** *(New in v0.3.0-alpha.0)*:
- 🎓 **Interactive Tutorial** - 6-step guided onboarding for first-time users
- 💡 **Smart Hints** - Contextual hints that appear based on user behavior
- 📊 **Gesture Widget** - Real-time gesture confidence display with color-coded bars
- 🎛️ **Settings Presets** - One-click configurations (Responsive/Balanced/Precise)
- 🏗️ **Build Mode** - Drag-to-place objects with grid snapping (Press **B**)
- 🎨 **Property Editor** - Right-click objects to customize physics and visuals

**Room-Scale Positioning** *(New in v0.4.0-alpha.0)*:
- 📡 **WiFi Positioning** - Room-scale spatial awareness using WiFi trilateration (±2-5m accuracy)
- 🧭 **Sensor Fusion** - Kalman filter combines WiFi + camera for ±1-2cm accuracy in room coordinates
- 🎯 **Room Origin Marker** - 3D coordinate system visualization (XYZ axes at room origin)
- 📊 **Fusion Debug Panel** - Real-time statistics (active filters, camera pose, uncertainty)
- ⚙️ **Router Calibration** - 4-step wizard to configure WiFi router positions
- 🔄 **Persistent Coordinates** - Hand positions in room-relative coordinates (not just camera-relative)

**Visual Feedback**:
- Color-coded hand cursors (blue = right, green = left)
- Gesture status widget with emoji icons
- Grab range visualization
- Hand trails and skeleton (optional)
- Selected object highlighting

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

> 💡 **First-time users**: An interactive tutorial will guide you through these steps automatically!

### UX Features *(New in v0.3.0-alpha.0)*

#### Interactive Tutorial
On your first visit, a 6-step tutorial will guide you through:
- Webcam setup
- Hand detection
- Pinch gesture
- Grabbing objects
- Releasing objects

Skip the tutorial anytime or replay it from **Settings → Tutorial → Replay Tutorial**.

#### Gesture Status Widget
The floating widget (top-left) shows:
- Current gesture per hand (🤏 pinch, ✊ fist, 👆 point, 🖐️ open)
- Real-time confidence bars (green >70%, yellow 40-70%, red <40%)
- Hand identification (blue = right hand, green = left hand)
- Press **G** to toggle compact mode

#### Settings Presets
Quickly configure all settings with one click (Settings Panel → Presets):
- **⚡ Responsive** - Low thresholds, fast gesture detection (demos, quick interactions)
- **⚖️ Balanced** - Moderate thresholds (default, recommended for most users)
- **🎯 Precise** - High thresholds, stable detection (accuracy-focused, fewer false positives)

#### Smart Hints
Contextual hints appear based on your behavior:
- Timer-based (e.g., "Press H to toggle status panel" after 10s)
- Action-based (e.g., "Try swipe gestures" after 5 pinches)
- Session-based (e.g., "Check out Settings Presets" on 2nd session)

All hints auto-dismiss after 8 seconds and only appear once.

#### Build Mode (Press **B**)
- Click anywhere in the 3D scene to place objects
- Objects snap to a 0.5-unit grid for precise alignment
- Ghost preview shows where the object will appear
- Exit build mode by pressing **B** again

#### Per-Object Customization
Right-click any object to edit:
- **Physics**: Mass, bounciness, friction, damping, gravity scale
- **Visual**: Color, emissive, metalness, roughness
- **Interaction**: Lock (prevent grabbing), visibility toggle
- **Actions**: Reset to defaults, delete object

### WiFi Positioning & Sensor Fusion *(New in v0.4.0-alpha.0)*

#### Setup WiFi Positioning

1. **Start WiFi companion app** (required for WiFi positioning):
   ```bash
   cd tools/wifi-companion
   npm install
   npm start
   ```
   This starts a WebSocket server on `localhost:8080` that provides WiFi RSSI data.

2. **Enable positioning** in HandTrack3D:
   - Open Settings (press **S**)
   - Go to **Positioning** tab
   - Toggle **Enable Positioning** ON
   - Set **Mode** to **WiFi Only** or **Sensor Fusion** (recommended)

3. **Calibrate routers**:
   - Click **Calibrate Routers** button
   - Follow 4-step wizard:
     1. Select WiFi network from scan
     2. Add router name and room position (X, Y, Z in meters)
     3. Add 2+ more routers (minimum 3 required)
     4. Finish calibration
   - Router positions are saved and persist across sessions

#### Using Sensor Fusion

**WiFi Only Mode** (±2-5m accuracy):
- Uses trilateration from 3+ WiFi routers
- Good for room-scale awareness (which room, approximate position)
- Updates every ~500ms (2Hz)

**Sensor Fusion Mode** (±1-2cm accuracy):
- Combines WiFi positioning with MediaPipe camera tracking
- Uses Kalman filter to fuse low-frequency WiFi with high-frequency camera
- Hand positions in **room-relative coordinates** (persistent across camera movement)
- Benefits:
  - ✅ Smooth motion (velocity estimation filters jitter)
  - ✅ Outlier rejection (WiFi signal spikes filtered out)
  - ✅ Sub-centimeter accuracy in room coordinates
  - ✅ Persistent positioning (not just camera-relative)

#### Visual Indicators

- **Positioning Status Widget** (top-right):
  - Connection status (Connected / Disconnected)
  - Current mode (WiFi Only / Sensor Fusion / Disabled)
  - Router count (e.g., "3 routers")
  - Current room position (X, Y, Z in meters)
  - Press **W** to toggle visibility

- **Room Origin Marker** (3D scene):
  - Red arrow: +X axis (right, 50cm)
  - Green arrow: +Y axis (up, 50cm)
  - Blue arrow: +Z axis (forward, 50cm)
  - White sphere: Origin point (0, 0, 0)
  - XZ grid: Ground plane (5m × 5m)

- **Fusion Debug Panel** (bottom-left):
  - Active Kalman filters (1-2, one per hand)
  - Camera pose status (Available / Unavailable)
  - Average position uncertainty (±meters)
  - Per-hand room positions and uncertainty

### Physics Features

- **Gravity** (9.81 m/s²) - Objects fall naturally when released
- **Collisions** - Objects bounce off each other and the ground (0.5 restitution)
- **Throwing** - Release objects while moving to launch them with velocity
- **Ground plane** - Invisible floor prevents objects from falling forever
- **Realistic motion** - Damping and friction create natural movement

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `H` | Toggle status panel (hand tracking stats) |
| `S` | Open settings panel |
| `G` | Toggle gesture widget compact mode |
| `B` | Toggle build mode (drag-to-place objects) |
| `P` | Toggle pose skeleton visualization (debug) |
| `D` | Toggle depth breakdown panel (debug) |
| `W` | Toggle WiFi positioning status widget *(v0.4.0)* |
| `C` | Open router calibration wizard *(v0.4.0)* |

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

### Positioning & Sensor Fusion *(v0.4.0+)*

- **WiFi Companion App** - WebSocket server for WiFi RSSI data collection
- **Kalman Filter** - 6DOF state estimation [x, y, z, vx, vy, vz]
- **Trilateration** - 3D position from WiFi signal strength (3+ routers)
- **Sensor Fusion Service** - Combines WiFi (±2-5m) + camera (±1cm) for ±1-2cm accuracy

### State Management

- **Zustand** - Lightweight state management with persistence middleware
  - `handTrackingStore` - Hand positions and tracking data
  - `sceneStore` - 3D objects and grab state
  - `useGestureStore` - Gesture detection state
  - `useHandCursorStore` - 3D cursor positions
  - `positioningStore` - WiFi routers, room position, calibration *(v0.4.0)*

### Styling

- **Tailwind CSS 3** - Utility-first CSS
- **PostCSS + Autoprefixer** - CSS processing

---

## Architecture

### Data Flow

```
Webcam (30fps)                     WiFi Companion (WebSocket, 2Hz)
    ↓                                      ↓
MediaPipe Hands (CDN)              WiFi RSSI Scan (3+ routers)
    ↓                                      ↓
handTrackingStore                  positioningStore
(21 landmarks × 2 hands)           (routers, trilateration)
    ↓                                      ↓
┌───────────┬──────────┬──────────────────┴──────────────────┐
↓           ↓          ↓                                      ↓
Gesture     Hand-to-3D HandOverlay                    Sensor Fusion
Detection   Mapping    (2D skeleton)                  (Kalman filter)
            ↓                                                 ↓
useGestureStore    useHandCursorStore ←─────── WiFi + Camera fusion
    ↓                 ↓                       (room coordinates)
    └────────┬────────┘
             ↓
    InteractiveObject
    (collision, grab, drag)
             ↓
    sceneStore (object positions)
             ↓
    Scene3D (R3F Canvas, 60fps)
        ↓
    RoomOriginMarker (XYZ axes at origin)
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
│   │   ├── ControlPanel/          # Status UI
│   │   ├── Positioning/           # WiFi positioning & fusion (v0.4.0)
│   │   │   ├── PositioningStatus.tsx    # Connection status widget
│   │   │   ├── CalibrationWizard.tsx    # Router calibration
│   │   │   ├── RoomOriginMarker.tsx     # 3D coordinate axes
│   │   │   └── SensorFusionDebug.tsx    # Fusion statistics panel
│   │   ├── Tutorial/              # Interactive tutorial (v0.3.0)
│   │   ├── GestureStatusWidget/   # Real-time gesture display (v0.3.0)
│   │   └── BuildMode/             # Drag-to-place objects (v0.3.0)
│   ├── hooks/
│   │   ├── useWebcam.ts           # Camera access
│   │   ├── useHandTracking.ts     # MediaPipe integration
│   │   ├── useHandTo3DMapping.ts  # 2D→3D coordinate mapping
│   │   ├── useGestureRecognition.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useWiFiPositioning.ts  # WiFi companion connection (v0.4.0)
│   │   └── useSensorFusion.ts     # Kalman filter integration (v0.4.0)
│   ├── stores/
│   │   ├── handTrackingStore.ts
│   │   ├── sceneStore.ts
│   │   ├── positioningStore.ts    # WiFi routers & position (v0.4.0)
│   │   ├── tutorialStore.ts       # Tutorial state (v0.3.0)
│   │   └── buildModeStore.ts      # Build mode state (v0.3.0)
│   ├── services/
│   │   └── sensorFusion/          # Sensor fusion service (v0.4.0)
│   │       └── SensorFusionService.ts
│   └── utils/
│       ├── collisionDetection.ts  # Proximity detection
│       └── kalman/                # Kalman filter (v0.4.0)
│           └── KalmanFilter.ts    # 6DOF state estimation
├── examples/                      # Plugin tutorials
│   ├── custom-gesture-plugin.md
│   ├── custom-interaction-plugin.md
│   └── custom-physics-adapter.md
├── tools/                         # Development tools
│   └── wifi-companion/            # WiFi positioning server (v0.4.0)
│       ├── server.js              # WebSocket server (port 8080)
│       ├── wifiScanner.js         # WiFi RSSI scanner
│       └── package.json
├── docs/phase4/                   # Phase 4 documentation (v0.4.0)
│   ├── PHASE_4B_SUMMARY.md        # Sensor fusion integration
│   ├── PHASE_4C_SUMMARY.md        # Kalman filter implementation
│   ├── POSITIONING_RESEARCH.md    # Technical background
│   ├── QUICKSTART.md              # Setup guide
│   └── TEST_RESULTS.md            # Accuracy benchmarks
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

### WiFi positioning not connecting *(v0.4.0)*

- **Companion app not running**: Start WiFi companion (`cd tools/wifi-companion && npm start`)
- **Port blocked**: Check if port 8080 is available (WebSocket server)
- **Wrong network**: Companion app must be on same network as browser
- **Firewall**: Allow incoming WebSocket connections on port 8080

### Sensor fusion not working *(v0.4.0)*

- **Mode disabled**: Check Settings → Positioning → Mode = "Sensor Fusion"
- **No routers calibrated**: Need 3+ routers for trilateration
- **WiFi not connected**: Positioning Status should show "Connected"
- **Camera pose unavailable**: Check if WiFi position is being received (green indicator)

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

### Completed (v0.3.0-alpha.0)
- ✅ Interactive tutorial mode (6-step onboarding)
- ✅ Smart hints system (contextual tooltips)
- ✅ Gesture status widget (real-time confidence display)
- ✅ Settings presets (Responsive/Balanced/Precise)
- ✅ Build mode (drag-to-place with grid snapping)
- ✅ Per-object property editor (right-click customization)

### Completed (v0.4.0-alpha.0)
- ✅ WiFi positioning system (±2-5m room-scale tracking)
- ✅ Sensor fusion (Kalman filter WiFi + camera)
- ✅ Room-relative coordinates (persistent positioning)
- ✅ Router calibration wizard (4-step setup)
- ✅ Fusion debug panel (real-time statistics)
- ✅ Room origin marker (3D coordinate visualization)

### Planned (v0.5.0+)
- [ ] IMU integration (gyroscope/accelerometer for camera orientation)
- [ ] UWB hardware support (±10-30cm accuracy)
- [ ] Multi-user positioning (multiple devices, shared room coordinates)
- [ ] Plugin marketplace / discovery
- [ ] Additional physics adapters (Cannon.js, Ammo.js official support)
- [ ] More gesture plugins (swipe, rotate, pinch-to-zoom, two-hand gestures)
- [ ] Performance profiling tools
- [ ] Multi-user collaboration
- [ ] VR/AR integration
- [ ] Gesture recording and playback

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

**Phase 4 (WiFi Positioning & Sensor Fusion)**:
- [Phase 4B: Sensor Fusion Integration](docs/phase4/PHASE_4B_SUMMARY.md) - WiFi positioning UI implementation
- [Phase 4C: Kalman Filter Implementation](docs/phase4/PHASE_4C_SUMMARY.md) - Sensor fusion core algorithm
- [WiFi Positioning Research](docs/phase4/POSITIONING_RESEARCH.md) - Technical background and design decisions
- [Quick Start Guide](docs/phase4/QUICKSTART.md) - WiFi companion setup and calibration
- [Test Results](docs/phase4/TEST_RESULTS.md) - Accuracy measurements and performance benchmarks

**General**:
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

**v0.4.0-alpha.0** • WiFi Positioning & Sensor Fusion Complete • **Built with ❤️ using TypeScript, React, Three.js, and MediaPipe**

</div>
