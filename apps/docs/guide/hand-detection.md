# Hand Detection

Learn how HandTrack3D detects and tracks hands in real-time.

::: info Coming Soon
This guide is being written. Check back soon for detailed information on hand detection.
:::

## Overview

HandTrack3D uses MediaPipe's hand tracking model to detect and track hands in 3D space. The system can:

- Detect up to 2 hands simultaneously
- Track 21 3D landmarks per hand
- Provide real-time position updates at 30+ fps
- Work in various lighting conditions

## How It Works

1. **Camera Input**: Capture video from webcam
2. **Detection**: MediaPipe identifies hands in the frame
3. **Landmark Extraction**: Extract 21 3D points per hand
4. **Gesture Analysis**: Analyze landmarks to detect gestures
5. **Output**: Provide structured hand data to your app

## Coming Soon

Detailed information on:
- Detection algorithms
- Landmark structure
- Confidence thresholds
- Performance optimization
- Troubleshooting

## See Also

- [Getting Started](/guide/getting-started)
- [Gesture Recognition](/guide/gestures)
- [API Reference](/api/core)
