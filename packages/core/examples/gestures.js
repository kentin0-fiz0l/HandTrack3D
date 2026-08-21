/**
 * Gesture recognition example
 *
 * This example demonstrates how to detect hand gestures (pinch, open, fist, point)
 * using the GestureDetector class.
 *
 * Prerequisites:
 * - Include MediaPipe Hands script in your HTML (see basic.js)
 */

import { HandTracker, GestureDetector } from '@handtrack3d/core';

// Get video element
const videoElement = document.getElementById('webcam');
const statusDiv = document.getElementById('status');

// Create hand tracker
const tracker = new HandTracker();

// Create gesture detector with custom settings
const gestureDetector = new GestureDetector({
  pinchThreshold: 0.05,        // Distance for pinch detection
  fingerExtensionAngle: 160,   // Angle for finger extension
  fistCurlThreshold: 0.15,     // Distance for fist detection
  pointExtensionAngle: 160,    // Angle for pointing gesture
});

// Initialize hand tracking
await tracker.initialize((hands) => {
  if (hands.length === 0) {
    statusDiv.textContent = 'No hands detected';
    return;
  }

  // Detect gestures for each hand
  const gestures = hands.map((hand) => {
    const gesture = gestureDetector.detectGesture(hand.landmarks);
    return `${hand.handedness}: ${gesture}`;
  });

  statusDiv.textContent = gestures.join(' | ');

  // Perform actions based on gestures
  hands.forEach((hand) => {
    const gesture = gestureDetector.detectGesture(hand.landmarks);

    switch (gesture) {
      case 'pinch':
        console.log(`${hand.handedness} hand is pinching - grab action!`);
        break;
      case 'open':
        console.log(`${hand.handedness} hand is open - release action!`);
        break;
      case 'fist':
        console.log(`${hand.handedness} hand is a fist - punch action!`);
        break;
      case 'point':
        console.log(`${hand.handedness} hand is pointing - select action!`);
        break;
    }
  });
});

// Start the camera
await tracker.startCamera(videoElement);

// Update gesture settings dynamically
setTimeout(() => {
  gestureDetector.updateSettings({
    pinchThreshold: 0.08, // Make pinch detection less sensitive
  });
  console.log('Updated pinch threshold to 0.08');
}, 5000);

// Cleanup
window.addEventListener('beforeunload', () => {
  tracker.close();
});
