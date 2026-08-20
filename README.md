# HandTrack3D

<div align="center">

![HandTrack3D](https://img.shields.io/badge/HandTrack3D-v1.0.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-0.180-000000?logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)

**Webcam-Based 3D Hand Interaction Prototype**

A web application that uses computer vision to interact with 3D objects through hand gestures and movements.

[Quick Start](#quick-start) • [Features](#features) • [Usage](#usage) • [Architecture](#architecture)

</div>

---

## Overview

HandTrack3D demonstrates natural user interfaces for 3D environments using webcam-based hand tracking. Built with MediaPipe Hands and Three.js, it enables real-time hand gesture recognition and 3D object manipulation directly in the browser.

### Key Features

- ✋ **Real-time hand tracking** (30fps) with MediaPipe Hands
- 🎯 **3D cursor mapping** from 2D hand landmarks to 3D space
- 👌 **Gesture recognition** (pinch, open hand, fist)
- 🎮 **Object interaction** (grab, drag, release)
- 🖐️ **Multi-hand support** (up to 2 hands simultaneously)
- 🎨 **Visual feedback** with color-coded cursors and trails
- 📊 **Real-time stats** (FPS, hand count, gestures)

---

## Quick Start

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
- **React Three Fiber 8.18** - React renderer for Three.js
- **@react-three/drei** - Three.js helpers and components

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
├── src/
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
│   ├── services/
│   │   ├── mediapipeService.ts    # MediaPipe initialization
│   │   └── gestureDetector.ts     # Gesture algorithms
│   ├── stores/
│   │   ├── handTrackingStore.ts
│   │   ├── sceneStore.ts
│   │   └── (gesture/cursor stores in hooks)
│   ├── utils/
│   │   ├── coordinateMapping.ts   # 2D→3D math
│   │   └── collisionDetection.ts  # Proximity detection
│   └── types/
│       ├── hand.types.ts
│       ├── scene.types.ts
│       └── gesture.types.ts
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

1. Add gesture type to `src/types/gesture.types.ts`
2. Implement detection in `src/services/gestureDetector.ts`
3. Add visual feedback in `src/components/HandTrackingCanvas/HandMesh.tsx`

### Adding New Objects

1. Define object in `src/types/scene.types.ts`
2. Add to initial state in `src/stores/sceneStore.ts`
3. Update `InteractiveObject.tsx` geometry rendering

---

## Future Enhancements

- [ ] Physics simulation (gravity, collisions)
- [ ] More gestures (swipe, rotate, scale)
- [ ] Custom object creation UI
- [ ] Multi-user collaboration
- [ ] VR/AR integration
- [ ] Gesture recording and playback
- [ ] Settings panel (sensitivity, detection thresholds)
- [ ] Example scenes (playground, tutorial)

---

## License

MIT License - See LICENSE file for details.

---

## Acknowledgments

- **MediaPipe** by Google for hand tracking
- **Three.js** community for 3D rendering
- **React Three Fiber** for React integration
- Built as part of the **HandTrack3D** exploration project

---

<div align="center">

**Built with ❤️ using React, Three.js, and MediaPipe**

</div>
