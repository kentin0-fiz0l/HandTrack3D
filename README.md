# HandTrack3D

Webcam-Based 3D Hand Interaction prototype using MediaPipe and Three.js.

## Quick Start

```bash
pnpm install
pnpm dev
```

Navigate to http://localhost:5173

## Tech Stack

- **React 19** with TypeScript
- **Vite** - Build tool
- **Three.js 0.180** + React Three Fiber - 3D rendering
- **@react-three/drei** - Three.js helpers
- **MediaPipe Hands** - Hand tracking
- **Zustand** - State management
- **Tailwind CSS** - Styling

## Project Status

### ✅ Phase 1: Project Setup & Basic 3D Scene
- Vite + React + TypeScript configured
- Basic R3F scene with camera, lights, grid
- Three 3D objects (box, sphere, torus)

### 🚧 Phase 2: Webcam Integration (Next)
- Webcam feed with MediaPipe
- Hand tracking overlay

## Controls

- Left click + drag: Rotate camera
- Right click + drag: Pan camera
- Scroll: Zoom in/out

## Development

```bash
pnpm run build  # Build for production
pnpm run dev    # Start dev server
```
