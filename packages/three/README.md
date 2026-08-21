# @handtrack3d/three

Three.js integration for hand tracking with MediaPipe. Provides both pure Three.js classes and React Three Fiber components for 3D hand visualization and interaction.

## Features

- **Pure Three.js Classes** - Use without React
- **Hand Visualization** - 3D cursors and skeletal rendering
- **Gesture Interactions** - Grab, point, and pinch-to-zoom
- **Coordinate Mapping** - Convert hand landmarks to 3D space
- **TypeScript** - Full type safety
- **Tree-shakeable** - Import only what you need

## Installation

\`\`\`bash
npm install @handtrack3d/three @handtrack3d/core three
# or
pnpm add @handtrack3d/three @handtrack3d/core three
\`\`\`

For React Three Fiber support:

\`\`\`bash
npm install @react-three/fiber react react-dom
\`\`\`

## Quick Start

### Pure Three.js (No React)

\`\`\`typescript
import * as THREE from 'three';
import { HandTracker } from '@handtrack3d/core';
import { HandCursor3D, HandSkeleton3D, GrabInteraction } from '@handtrack3d/three';

// Create scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
const renderer = new THREE.WebGLRenderer();

// Create hand cursor
const handCursor = new HandCursor3D({ color: '#3b82f6' });
scene.add(handCursor.mesh);

// Create hand skeleton
const skeleton = new HandSkeleton3D({ colorScheme: 'rainbow' });
scene.add(skeleton.group);

// Create grab interaction
const grabInteraction = new GrabInteraction();
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 'orange' })
);
grabInteraction.registerObject(cube);
scene.add(cube);

// Initialize hand tracking
const tracker = new HandTracker();
await tracker.initialize();

tracker.onResults((hands) => {
  hands.forEach(hand => {
    // Update cursor position
    handCursor.update(hand);

    // Update skeleton
    skeleton.update(hand);

    // Update grab interaction
    const cursorPos = handCursor.getPosition();
    grabInteraction.update(hand, cursorPos);
  });
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
\`\`\`

## API Reference

### HandCursor3D

3D sphere cursor that follows the hand position.

\`\`\`typescript
import { HandCursor3D } from '@handtrack3d/three';

const cursor = new HandCursor3D({
  color: '#3b82f6',      // Cursor color
  emissiveIntensity: 0.5, // Glow intensity
  scale: 0.15,            // Size
  opacity: 0.8,           // Transparency
  showGlow: true          // Point light glow
});

// Add to scene
scene.add(cursor.mesh);

// Update position
cursor.update(hand);

// Change visual state (e.g., on gesture)
cursor.setVisualState('#f59e0b', 0.1, 1.0); // color, scale, emissive

// Get position
const position = cursor.getPosition();

// Cleanup
cursor.dispose();
\`\`\`

### HandSkeleton3D

Visualizes all 21 hand landmarks as spheres with connections.

\`\`\`typescript
import { HandSkeleton3D } from '@handtrack3d/three';

const skeleton = new HandSkeleton3D({
  jointSize: 0.01,           // Joint sphere size
  boneThickness: 0.005,      // Connection thickness
  opacity: 0.8,              // Transparency
  colorScheme: 'rainbow',    // 'rainbow' | 'monochrome' | 'handedness'
  baseColor: '#3b82f6'       // Used for monochrome scheme
});

// Add to scene
scene.add(skeleton.group);

// Update skeleton
skeleton.update(hand);

// Toggle visibility
skeleton.setVisible(false);

// Change color scheme
skeleton.setColorScheme('monochrome');

// Cleanup
skeleton.dispose();
\`\`\`

### GrabInteraction

Detect pinch gestures and manage object grabbing.

\`\`\`typescript
import { GrabInteraction } from '@handtrack3d/three';

const grabInteraction = new GrabInteraction({
  grabRadius: 0.5,      // Maximum grab distance
  smoothing: 0.3,       // Position smoothing (0-1)
  enableRotation: false // Rotate objects while grabbed
});

// Register objects
grabInteraction.registerObject(cube);
grabInteraction.registerObject(sphere);

// Update on each frame
grabInteraction.update(hand, handCursorPosition);

// Check if grabbed
if (grabInteraction.isGrabbed(cube)) {
  console.log('Cube is grabbed!');
}

// Get all grabbed objects
const grabbed = grabInteraction.getGrabbedObjects();

// Release all
grabInteraction.releaseAll();
\`\`\`

### PointInteraction

Raycast from finger tip to detect pointed-at objects.

\`\`\`typescript
import { PointInteraction } from '@handtrack3d/three';

const pointInteraction = new PointInteraction({
  maxDistance: 50 // Maximum ray distance
});

// Update and get result
const result = pointInteraction.update(hand, camera, [cube, sphere]);

if (result) {
  console.log('Pointing at:', result.object);
  console.log('Hit point:', result.point);
  console.log('Distance:', result.distance);
}

// Check specific object
if (pointInteraction.isPointingAt(cube)) {
  // Add hover effect
}
\`\`\`

### PinchToZoomInteraction

Camera zoom control using pinch gestures.

\`\`\`typescript
import { PinchToZoomInteraction } from '@handtrack3d/three';

const zoomInteraction = new PinchToZoomInteraction({
  minZoom: 0.5,    // Minimum zoom
  maxZoom: 5.0,    // Maximum zoom
  zoomSpeed: 5.0,  // Sensitivity
  smoothing: 0.15  // Smooth interpolation
});

// Update on each frame
zoomInteraction.update(hand, camera);

// Reset zoom
zoomInteraction.resetZoom(camera);

// Adjust settings
zoomInteraction.setZoomLimits(0.2, 10.0);
zoomInteraction.setZoomSpeed(3.0);
\`\`\`

## Coordinate Mapping Utilities

\`\`\`typescript
import {
  landmarkToVector3,
  landmarksToVector3Array,
  projectToScreen,
  screenToWorld,
  getLandmarksCenter,
  customMapping
} from '@handtrack3d/three';

// Convert landmark to THREE.Vector3
const position = landmarkToVector3(hand.landmarks[8]); // Index finger tip

// Convert all landmarks
const positions = landmarksToVector3Array(hand.landmarks);

// Project 3D to screen
const screenPos = projectToScreen(position, camera, window.innerWidth, window.innerHeight);

// Unproject screen to world
const worldPos = screenToWorld(100, 200, 5, window.innerWidth, window.innerHeight, camera);

// Get center of hand
const center = getLandmarksCenter(hand.landmarks);

// Custom coordinate mapping
const customPos = customMapping(landmark, {
  xScale: 10,
  yScale: 5,
  zScale: 8,
  flipX: true
});
\`\`\`

## Coordinate System

HandTrack3D uses a first-person coordinate system where:

- **X-axis**: Left (-) to Right (+), flipped so hand position matches perspective
- **Y-axis**: Down (-) to Up (+)
- **Z-axis**: Far (-) to Near (+), hand closer to camera increases Z

Default mapping:
\`\`\`typescript
x = (0.5 - landmark.x) * 6     // Range: -3 to 3
y = (1 - landmark.y) * 2 + 0.5 // Range: 0.5 to 2.5
z = -3 - (landmark.z * 5)       // Range: varies by depth
\`\`\`

Customize with \`customMapping()\` for different coordinate systems.

## Integration with React Three Fiber

While this package provides pure Three.js classes, you can easily use them with React Three Fiber:

\`\`\`typescript
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { HandCursor3D, GrabInteraction } from '@handtrack3d/three';

function HandCursor({ hand }) {
  const cursorRef = useRef<HandCursor3D>();

  useEffect(() => {
    cursorRef.current = new HandCursor3D({ color: '#10b981' });
    return () => cursorRef.current?.dispose();
  }, []);

  useFrame(() => {
    if (cursorRef.current && hand) {
      cursorRef.current.update(hand);
    }
  });

  return cursorRef.current ? <primitive object={cursorRef.current.mesh} /> : null;
}
\`\`\`

## Examples

See \`/examples/three-js/\` for complete examples:

- Basic hand cursor visualization
- Hand skeleton with color schemes
- Grab interaction with multiple objects
- Point interaction with hover effects
- Pinch-to-zoom camera control
- Combined interactions demo

## Type Exports

All core types are re-exported for convenience:

\`\`\`typescript
import type {
  Hand,
  HandLandmark,
  HandLandmarks,
  HandState,
  GestureType,
  HandGesture,
  Vector3D
} from '@handtrack3d/three';
\`\`\`

Core utilities are also re-exported:

\`\`\`typescript
import {
  detectGesture,
  detectPinch,
  detectOpenHand,
  detectFist,
  distance3D,
  isInGrabRange
} from '@handtrack3d/three';
\`\`\`

## Performance Tips

1. **Reuse geometries**: \`HandSkeleton3D\` internally reuses geometries for all joints and bones
2. **Update selectively**: Only update visuals when hand data changes
3. **Limit interactions**: Register only interactive objects, not entire scenes
4. **Use appropriate smoothing**: Lower smoothing (0.1-0.3) for responsive feel, higher (0.5-0.8) for smoother motion
5. **Dispose properly**: Always call \`dispose()\` when removing hand visuals

## Browser Support

- Modern browsers with WebGL support
- Requires MediaPipe Hands (see \`@handtrack3d/core\`)

## License

MIT

## Contributing

See the [main repository](https://github.com/kentino/handtrack3d) for contribution guidelines.
