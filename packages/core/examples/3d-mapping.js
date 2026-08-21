/**
 * 3D coordinate mapping example
 *
 * This example demonstrates how to map 2D hand landmarks to 3D world space
 * for use in 3D scenes (e.g., with Three.js, Babylon.js, etc.)
 *
 * Prerequisites:
 * - Include MediaPipe Hands script in your HTML (see basic.js)
 */

import {
  HandTracker,
  mapHandTo3D,
  getIndexFingerTip,
  getThumbTip,
  getWrist,
  isInGrabRange,
  calculateGrabOffset,
} from '@handtrack3d/core';

// Get video element
const videoElement = document.getElementById('webcam');

// Create hand tracker
const tracker = new HandTracker();

// Example 3D object position (in your 3D scene)
const cubePosition = { x: 1.0, y: 1.5, z: -2.0 };
let isGrabbing = false;
let grabOffset = null;

// Initialize hand tracking
await tracker.initialize((hands) => {
  if (hands.length === 0) {
    isGrabbing = false;
    return;
  }

  // Get the first hand
  const hand = hands[0];

  // Get key landmarks
  const indexTip = getIndexFingerTip(hand.landmarks);
  const thumbTip = getThumbTip(hand.landmarks);
  const wrist = getWrist(hand.landmarks);

  // Map to 3D world space
  const index3D = mapHandTo3D(indexTip);
  const thumb3D = mapHandTo3D(thumbTip);
  const wrist3D = mapHandTo3D(wrist);

  console.log(`Hand position in 3D space:`);
  console.log(`  Index finger: (${index3D.x.toFixed(2)}, ${index3D.y.toFixed(2)}, ${index3D.z.toFixed(2)})`);
  console.log(`  Thumb: (${thumb3D.x.toFixed(2)}, ${thumb3D.y.toFixed(2)}, ${thumb3D.z.toFixed(2)})`);
  console.log(`  Wrist: (${wrist3D.x.toFixed(2)}, ${wrist3D.y.toFixed(2)}, ${wrist3D.z.toFixed(2)})`);

  // Check if hand is in grab range of the cube
  const inRange = isInGrabRange(index3D, cubePosition, 1.5);

  if (inRange && !isGrabbing) {
    // Start grabbing
    isGrabbing = true;
    grabOffset = calculateGrabOffset(index3D, cubePosition);
    console.log('🎯 Grabbed cube!');
  } else if (!inRange && isGrabbing) {
    // Release
    isGrabbing = false;
    grabOffset = null;
    console.log('✋ Released cube!');
  }

  // Update cube position if grabbing
  if (isGrabbing && grabOffset) {
    const newCubePosition = {
      x: index3D.x + grabOffset.x,
      y: index3D.y + grabOffset.y,
      z: index3D.z + grabOffset.z,
    };

    console.log(`📦 Cube position: (${newCubePosition.x.toFixed(2)}, ${newCubePosition.y.toFixed(2)}, ${newCubePosition.z.toFixed(2)})`);

    // In a real 3D scene, you would update your cube's position here:
    // cube.position.set(newCubePosition.x, newCubePosition.y, newCubePosition.z);
  }
});

// Start the camera
await tracker.startCamera(videoElement);

// Cleanup
window.addEventListener('beforeunload', () => {
  tracker.close();
});
