/**
 * Basic hand detection example
 *
 * This example demonstrates the minimal setup required to track hands
 * and log detected hands to the console.
 *
 * Prerequisites:
 * - Include MediaPipe Hands script in your HTML:
 *   <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
 *   <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
 */

import { HandTracker } from '@handtrack3d/core';

// Get video element from your HTML
const videoElement = document.getElementById('webcam');

// Create hand tracker instance
const tracker = new HandTracker({
  maxNumHands: 2,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

// Initialize with callback function
await tracker.initialize((hands) => {
  console.log(`Detected ${hands.length} hands:`);

  hands.forEach((hand) => {
    console.log(`- ${hand.handedness} hand (${hand.landmarks.length} landmarks)`);

    // Access landmarks
    const wrist = hand.landmarks[0];
    const indexTip = hand.landmarks[8];

    console.log(`  Wrist: (${wrist.x.toFixed(2)}, ${wrist.y.toFixed(2)}, ${wrist.z.toFixed(2)})`);
    console.log(`  Index tip: (${indexTip.x.toFixed(2)}, ${indexTip.y.toFixed(2)}, ${indexTip.z.toFixed(2)})`);
  });
});

// Start the camera
await tracker.startCamera(videoElement);

// Cleanup when done (call when page unloads)
window.addEventListener('beforeunload', () => {
  tracker.close();
});
