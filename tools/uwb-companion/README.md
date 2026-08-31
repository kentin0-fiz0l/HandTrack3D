# UWB Companion Service

Mock UWB positioning companion service for HandTrack3D development and testing.

## Overview

This service simulates **Ultra-Wideband (UWB)** positioning hardware (DWM1001 modules) without requiring physical devices. It generates realistic position data with characteristics matching real UWB systems:

- **Accuracy**: ±10-30cm (vs ±2-5m for WiFi)
- **Update Rate**: 10Hz (vs 2Hz for WiFi)
- **Quality Metrics**: Simulated based on anchor visibility and distance

## Quick Start

### From Project Root

```bash
# Start mock UWB server
npm run uwb:mock

# Or use Node.js directly
cd tools/uwb-companion
npm install
npm start
```

### From This Directory

```bash
# Install dependencies
npm install

# Start server
npm start

# Development mode (auto-restart on changes)
npm run dev
```

The server will start on **ws://localhost:8081** and broadcast position updates at 10Hz.

## Configuration

### Anchor Setup

The mock server simulates 6 UWB anchors in a **5m × 5m × 3m** room:

| Anchor ID | Position (x, y, z) | Description |
|-----------|-------------------|-------------|
| 0x0000 | (0.0, 0.0, 0.0) | Origin (floor, corner) |
| 0x0001 | (5.0, 0.0, 0.0) | Right wall (floor) |
| 0x0002 | (0.0, 5.0, 2.0) | Forward wall (high) |
| 0x0003 | (5.0, 5.0, 2.0) | Far corner (high) |
| 0x0004 | (2.5, 2.5, 0.0) | Center (floor) |
| 0x0005 | (2.5, 5.0, 2.5) | Center forward (high) |

**Best placement strategy**: Mix of floor and ceiling anchors provides optimal 3D positioning.

### Room Bounds

- **X-axis**: 0 to 5 meters (left-right)
- **Y-axis**: 0 to 5 meters (forward-back)
- **Z-axis**: 0 to 3 meters (floor-ceiling)

### Simulation Parameters

You can modify these in `server.js`:

```javascript
const UPDATE_RATE_HZ = 10;        // Position update frequency
const NOISE_STD_DEV = 0.15;        // Gaussian noise (meters, σ=15cm)
const ROOM_BOUNDS = {
  x: [0, 5],
  y: [0, 5],
  z: [0, 3],
};
```

## WebSocket Protocol

### Connection

Connect to `ws://localhost:8081` using any WebSocket client.

### Message Types

#### 1. Anchor Configuration (Server → Client)

Sent immediately upon connection:

```json
{
  "type": "anchors",
  "data": [
    {
      "id": 0,
      "position": [0.0, 0.0, 0.0],
      "name": "Anchor 0 (Origin)"
    },
    // ... 5 more anchors
  ]
}
```

#### 2. Position Update (Server → Client)

Sent at 10Hz (every 100ms):

```json
{
  "type": "position",
  "data": {
    "x": 2.487,
    "y": 2.521,
    "z": 1.503,
    "quality": 87,
    "anchorsUsed": 6,
    "timestamp": 1709251234567
  }
}
```

**Fields**:
- `x`, `y`, `z`: Position in room coordinates (meters, 3 decimal precision)
- `quality`: Quality metric 0-100 (100 = best)
- `anchorsUsed`: Number of anchors in range (<4m)
- `timestamp`: UNIX timestamp (milliseconds)

### Quality Calculation

```javascript
Quality = (DistanceQuality + RangeQuality) / 2

DistanceQuality = 100 - (avgDistance * 20)  // 100 at 0m, 0 at 5m
RangeQuality = (anchorsInRange / totalAnchors) * 100
```

**Higher quality** when:
- Closer to anchors (average distance <2.5m)
- More anchors in range (>4m threshold)

## Motion Simulation

The mock tag follows a **random walk** motion model:

1. **Random acceleration**: ±0.25 m/s² (XY), ±0.1 m/s² (Z)
2. **Velocity damping**: 0.9x per frame (prevents runaway)
3. **Boundary bounce**: Reverses velocity with energy loss at walls
4. **Gaussian noise**: ±10-30cm added to true position

**Characteristics**:
- Smooth, natural movement (like a person walking)
- Occasional direction changes
- Stays within room bounds
- Realistic measurement noise

## Integration with HandTrack3D

### 1. Enable UWB Mode

In HandTrack3D settings:
1. Open Settings (⚙️ icon)
2. Go to **Positioning** tab
3. Select **"UWB Only (Mock)"** or **"Sensor Fusion (All Sensors)"**
4. Click **Enable Positioning**

### 2. Verify Connection

Check the **Positioning Status** panel (top-right):
- **Green indicator**: Connected to UWB server
- **Update Rate**: Should show ~10.0 Hz
- **Quality**: 0-100 (aim for >50)
- **Anchors**: X/6 visible

### 3. Monitor Position

Position updates appear in real-time:
- **X, Y, Z** coordinates (3 decimal precision)
- **Accuracy**: ±0.02m (average of ±10-30cm)

## Comparison: UWB vs WiFi

| Metric | WiFi | UWB (Mock) | UWB (Real Hardware) |
|--------|------|------------|---------------------|
| Accuracy | ±2-5m | ±10-30cm (simulated) | ±10-30cm |
| Update Rate | 2Hz | 10Hz | 10Hz |
| Latency | ~500ms | ~100ms | ~100ms |
| Setup Complexity | Low (calibration) | None (mock) | High (hardware) |
| Cost | $0 (uses WiFi) | $0 (mock) | ~$500 (6 anchors) |

## Troubleshooting

### Connection Failed

**Error**: `[UWB] Failed to connect`

**Solutions**:
- Ensure server is running: `npm run uwb:mock`
- Check port 8081 is not in use: `lsof -i :8081`
- Verify WebSocket URL: `ws://localhost:8081` (not `wss://`)

### No Position Updates

**Error**: Connected but no position data

**Solutions**:
- Check console logs for errors
- Verify server is sending messages (server logs show broadcasts)
- Ensure HandTrack3D is in UWB mode (Settings → Positioning)

### Low Quality (<50)

**Possible causes**:
- Tag position far from anchors (>3m average distance)
- Few anchors in range (<3 visible)

**Solutions**:
- Adjust anchor positions in `server.js` for better coverage
- Increase anchor count (add more to `ANCHORS` array)
- Reduce room size for higher quality in smaller spaces

### Stale Data

**Error**: Position not updating

**Solutions**:
- Server may have crashed - restart with `npm run uwb:mock`
- Check browser console for WebSocket errors
- Verify `UPDATE_INTERVAL_MS` is 100ms in `server.js`

## Development

### Modify Motion Model

Change acceleration in `generatePosition()`:

```javascript
const accel = {
  x: (Math.random() - 0.5) * 0.5,  // Increase for faster movement
  y: (Math.random() - 0.5) * 0.5,
  z: (Math.random() - 0.5) * 0.2,  // Keep Z movement minimal
};
```

### Adjust Noise Characteristics

Change noise standard deviation:

```javascript
const noise = {
  x: this.gaussianRandom(0, 0.15),  // σ=15cm (±10-30cm range)
  y: this.gaussianRandom(0, 0.15),
  z: this.gaussianRandom(0, 0.15),
};
```

**Lower σ** = more accurate, **Higher σ** = more noise.

### Add Custom Anchors

Add to `ANCHORS` array:

```javascript
const ANCHORS = [
  // ... existing anchors ...
  { id: 0x0006, position: [1.0, 1.0, 1.5], name: 'Custom Anchor' },
];
```

**Best practices**:
- Use unique IDs (0x0000 - 0xFFFF)
- Place anchors in 3D (mix floor/ceiling)
- Aim for 4-8 anchors for optimal coverage

## Real Hardware Implementation

To use actual DWM1001 modules instead of this mock:

1. **Hardware Setup**:
   - Configure 4-6 anchors in room
   - Connect tag via USB/UART
   - Note anchor positions

2. **Serial Bridge**:
   - Replace mock motion with serial port reading:
   ```javascript
   import { SerialPort } from 'serialport';
   const port = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 115200 });
   ```

3. **Parse DWM1001 Output**:
   - Read UART position messages
   - Extract x, y, z coordinates
   - Forward via WebSocket (same protocol)

4. **Calibration**:
   - Survey anchor positions with measuring tape
   - Update anchor coordinates in configuration
   - Verify accuracy with known reference points

## License

MIT - Same as HandTrack3D

## References

- [DWM1001 Product Page](https://www.qorvo.com/products/p/DWM1001)
- [UWB Positioning Overview](https://www.qorvo.com/design-hub/ebook/qorvo-UWB-introduction)
- [HandTrack3D Documentation](https://github.com/kentin0-fiz0l/HandTrack3D)
