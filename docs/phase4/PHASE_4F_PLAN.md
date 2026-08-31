# Phase 4F: UWB Hardware Integration - Implementation Plan

## Context

**Why**: HandTrack3D currently uses WiFi positioning (±2-5m accuracy, 2Hz updates) for room-scale tracking. While adaptive Kalman filtering (Phase 4E) has improved robustness, the fundamental limitation is WiFi's low accuracy due to signal propagation variability and multipath interference.

**Problem**: WiFi-based positioning faces inherent challenges:
- **Low accuracy**: ±2-5m even with 3+ routers and optimal calibration
- **Low update rate**: ~2Hz due to RSSI scanning overhead
- **Multipath interference**: Indoor reflections distort RSSI measurements
- **Environmental sensitivity**: Furniture, people, walls affect signal strength
- **Calibration burden**: Requires manual reference RSSI measurement per router

**Solution**: Integrate **Ultra-Wideband (UWB)** hardware for high-accuracy, high-rate positioning:
- **Hardware**: DWM1001 modules (Qorvo/Decawave chipset)
- **Accuracy**: ±10-30cm (10-30x improvement over WiFi)
- **Update rate**: 10Hz (5x improvement over WiFi)
- **Method**: Time-of-Flight (ToF) trilateration
- **Advantages**: Immune to multipath, no RSSI calibration needed

**Expected Outcome**:
- Room-scale positioning: ±10-30cm accuracy (vs ±2-5m WiFi)
- Faster updates: 10Hz (vs 2Hz WiFi)
- Sensor fusion accuracy: ±5-15cm avg (vs ±1.5cm with WiFi, ±1cm camera-only)
- No manual calibration (ToF is absolute distance)
- Better multipath rejection (wide bandwidth resists interference)

---

## UWB Technology Overview

### What is Ultra-Wideband (UWB)?

UWB is a wireless technology that uses **very short pulses** (<2ns duration) over a **wide frequency spectrum** (>500 MHz bandwidth, typically 3.5-6.5 GHz). The wide bandwidth enables:

1. **Precise ranging**: Time-of-Flight (ToF) measurement with ~1ns resolution
2. **Multipath immunity**: Wide bandwidth separates direct path from reflections
3. **Low power**: Short pulses consume minimal energy
4. **Penetration**: Low frequency component penetrates obstacles

### Time-of-Flight (ToF) Ranging

**Principle**: Measure round-trip time of radio signal to compute distance.

```
Device A sends pulse → Device B receives and responds → Device A receives response
Round-trip time: t_rtt
Distance: d = (t_rtt * c) / 2
where c = speed of light (3 × 10^8 m/s)
```

**Two-Way Ranging (TWR)**:
```
1. Anchor sends "poll" message at time T1
2. Tag receives at time T2, processes, responds at time T3
3. Anchor receives response at time T4

Round-trip time: t_rtt = (T4 - T1) - (T3 - T2)
Distance: d = (t_rtt * c) / 2
```

**Accuracy**: ~10-30cm typical (vs ±2-5m WiFi RSSI)
- Clock drift compensation improves accuracy
- Multipath resistance reduces error
- No RSSI calibration needed (absolute ToF)

### DWM1001 Module

**Specifications**:
- Chip: Qorvo DW1000 (IEEE 802.15.4-2011 UWB)
- Frequency: 3.5-6.5 GHz (Channel 5: 6.5 GHz recommended)
- Range: 40-50m indoors, 100m+ outdoors
- Update rate: Up to 10Hz per tag
- Accuracy: ±10cm (ideal), ±10-30cm (typical indoor)
- Power: 100-300mW typical
- Interface: UART, SPI, Bluetooth LE
- Size: 21mm × 40mm module

**Modes**:
- **Anchor**: Fixed position, known coordinates
- **Tag**: Mobile device, position to be determined
- **Bridge**: Forwards data to PC/network via USB or Bluetooth

**Cost** (as of 2026):
- DWM1001-DEV board: ~$60-80 per module
- Minimum setup: 4 anchors + 1 tag = ~$300-400
- Recommended: 6 anchors + 1 tag = ~$420-560

---

## Implementation Plan

### Overview

Replace WiFi companion app with UWB positioning system:
- WiFi: RSSI scanning → path loss model → trilateration (±2-5m, 2Hz)
- UWB: ToF ranging → trilateration → Kalman filtering (±10-30cm, 10Hz)

**Architecture**:
```
UWB Tag (on camera/device)
    ↓ (UART/Bluetooth)
UWB Bridge (USB to PC)
    ↓ (Serial/WebSocket)
HandTrack3D Web App
    ↓
Sensor Fusion Service
    ↓
Fused Hand Position (±5-15cm room-scale)
```

**Effort**: 1-2 weeks (hardware setup, firmware, software integration, testing)

**Key Challenges**:
1. Hardware procurement and setup (4-6 anchors, 1 tag, 1 bridge)
2. Anchor placement and coordinate mapping
3. Serial communication (UART/Bluetooth → WebSocket)
4. UWB data parsing and trilateration
5. Integration with existing sensor fusion service
6. Performance validation and accuracy measurement

---

## Step 1: Hardware Setup and Anchor Placement

**File**: `/Users/kentino/Projects/Active/HandTrack3D/docs/phase4/UWB_HARDWARE_SETUP.md` (NEW, documentation)

**Hardware Required**:
- **4-6× DWM1001-DEV** modules (anchors, fixed positions)
- **1× DWM1001-DEV** module (tag, attached to camera/mobile device)
- **1× DWM1001-DEV** module (optional: USB bridge for PC connection)
- **Power supply**: USB cables or battery packs
- **Mounting**: Tripods, adhesive mounts, or 3D-printed brackets

**Anchor Placement Strategy**:

**Minimum Setup (4 anchors)**:
```
Room Layout (top view, 5m × 5m example):

    Y (forward)
    ↑
    |
    |   A2 (2.5, 5.0, 2.0)     A3 (5.0, 5.0, 2.0)
    |         ●─────────────────●
    |         │                 │
    |         │                 │
    |         │       👤        │
    |         │    (user)       │
    |         │                 │
    |         ●─────────────────●
    |   A0 (0, 0, 0)       A1 (5.0, 0, 0)
    |
    └─────────────────────────────→ X (right)
   Origin                         Z (up, not shown)

Heights:
- A0, A1: z = 0m (ground level)
- A2, A3: z = 2.0m (elevated for 3D positioning)
```

**Recommended Setup (6 anchors)**:
```
    A4 (2.5, 5.0, 2.5)  ← ceiling
         ●
        /│\
       / | \
      /  |  \
A2 ●───────────● A3
    │   |   │
    │   ●   │  ← A5 (2.5, 2.5, 0) ground center
    │   👤  │
A0 ●───────────● A1

- Better 3D coverage
- Improved Z-axis accuracy
- Redundancy for occlusion
```

**Placement Guidelines**:
1. **Line of Sight**: Ensure clear path from tag to most anchors
2. **Height Variation**: Mix ground and elevated anchors for 3D accuracy
3. **Geometric Diversity**: Avoid collinear or coplanar arrangements
4. **Coverage**: Tag should be within 3-4m of nearest anchor
5. **Symmetry**: Avoid clustering all anchors on one side

**Configuration Steps**:
1. Flash DWM1001 firmware (anchor mode)
2. Assign unique anchor IDs (0x0000, 0x0001, 0x0002, ...)
3. Set anchor coordinates (X, Y, Z in meters)
4. Configure tag mode for mobile module
5. Configure bridge mode for USB module (if used)

**Tools**:
- **Segger J-Link** or **ST-Link**: Firmware flashing
- **DRTLS Manager** (Qorvo): Configuration GUI
- **Serial terminal** (PuTTY, screen): Debug output

---

## Step 2: Create UWB Companion Service

**File**: `/Users/kentino/Projects/Active/HandTrack3D/tools/uwb-companion/server.js` (NEW, ~300 LOC)

**Purpose**: Bridge between UWB hardware and HandTrack3D web app
- Reads UWB position data from serial port (UART/Bluetooth)
- Parses DWM1001 UART output (JSON or binary format)
- Broadcasts position updates via WebSocket
- Provides anchor configuration API

**Architecture**:
```
DWM1001 Bridge (USB)
    ↓ UART (115200 baud)
Node.js Server (serial port listener)
    ↓ WebSocket (port 8081)
HandTrack3D Web App (browser)
```

**Implementation**:

```javascript
// tools/uwb-companion/server.js
const WebSocket = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Configuration
const SERIAL_PORT = '/dev/ttyACM0'; // Linux
// const SERIAL_PORT = 'COM3'; // Windows
const BAUD_RATE = 115200;
const WS_PORT = 8081;

// UWB anchor coordinates (configured via DRTLS Manager)
const ANCHORS = [
  { id: 0x0000, position: [0.0, 0.0, 0.0] },
  { id: 0x0001, position: [5.0, 0.0, 0.0] },
  { id: 0x0002, position: [0.0, 5.0, 2.0] },
  { id: 0x0003, position: [5.0, 5.0, 2.0] },
];

class UWBCompanion {
  constructor() {
    this.serialPort = null;
    this.wsServer = null;
    this.clients = new Set();
    this.lastPosition = null;
  }

  /**
   * Initialize serial port connection to UWB bridge
   */
  async initSerial() {
    this.serialPort = new SerialPort({
      path: SERIAL_PORT,
      baudRate: BAUD_RATE,
    });

    const parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    parser.on('data', (line) => {
      this.handleUWBData(line);
    });

    this.serialPort.on('error', (err) => {
      console.error('[UWB] Serial error:', err.message);
    });

    console.log(`[UWB] Connected to ${SERIAL_PORT} @ ${BAUD_RATE} baud`);
  }

  /**
   * Parse DWM1001 UART output
   *
   * Format (JSON mode):
   * {
   *   "position": {"x": 1.23, "y": 2.34, "z": 0.56},
   *   "quality": 95,
   *   "anchors": [
   *     {"id": "0000", "distance": 2.45, "rssi": -65},
   *     {"id": "0001", "distance": 3.12, "rssi": -72},
   *     ...
   *   ]
   * }
   */
  handleUWBData(line) {
    try {
      const data = JSON.parse(line);

      if (!data.position) {
        return; // Not a position update
      }

      const position = {
        x: data.position.x,
        y: data.position.y,
        z: data.position.z,
        quality: data.quality || 100,
        anchorsUsed: data.anchors?.length || 0,
        timestamp: Date.now(),
      };

      this.lastPosition = position;

      // Broadcast to all WebSocket clients
      this.broadcastPosition(position);

    } catch (error) {
      // Ignore non-JSON lines (debug output, etc.)
    }
  }

  /**
   * Initialize WebSocket server
   */
  initWebSocket() {
    this.wsServer = new WebSocket.Server({ port: WS_PORT });

    this.wsServer.on('connection', (ws) => {
      console.log('[WS] Client connected');
      this.clients.add(ws);

      // Send current position immediately
      if (this.lastPosition) {
        ws.send(JSON.stringify({
          type: 'position',
          data: this.lastPosition,
        }));
      }

      // Send anchor configuration
      ws.send(JSON.stringify({
        type: 'anchors',
        data: ANCHORS,
      }));

      ws.on('close', () => {
        console.log('[WS] Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (err) => {
        console.error('[WS] Client error:', err.message);
        this.clients.delete(ws);
      });
    });

    console.log(`[WS] WebSocket server listening on port ${WS_PORT}`);
  }

  /**
   * Broadcast position to all connected clients
   */
  broadcastPosition(position) {
    const message = JSON.stringify({
      type: 'position',
      data: position,
    });

    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Start companion service
   */
  async start() {
    await this.initSerial();
    this.initWebSocket();
    console.log('[UWB Companion] Service started');
  }
}

// Start service
const companion = new UWBCompanion();
companion.start().catch(console.error);
```

**Dependencies** (`package.json`):
```json
{
  "name": "uwb-companion",
  "version": "1.0.0",
  "dependencies": {
    "ws": "^8.13.0",
    "serialport": "^12.0.0",
    "@serialport/parser-readline": "^12.0.0"
  }
}
```

**Running**:
```bash
cd tools/uwb-companion
npm install
node server.js
```

---

## Step 3: Create UWB Positioning Hook

**File**: `/Users/kentino/Projects/Active/HandTrack3D/src/hooks/useUWBPositioning.ts` (NEW, ~200 LOC)

**Purpose**: Connect to UWB companion service and provide position updates

**Similar to** `useWiFiPositioning.ts` but with UWB-specific data:
- Higher update rate (10Hz vs 2Hz)
- Position quality metric (0-100)
- Number of anchors used (3+ required)

**Implementation**:

```typescript
import { useEffect, useRef, useState } from 'react';
import { usePositioningStore } from '@/stores/positioningStore';

interface UWBPosition {
  x: number;
  y: number;
  z: number;
  quality: number; // 0-100
  anchorsUsed: number;
  timestamp: number;
}

interface UWBAnchor {
  id: number;
  position: [number, number, number];
}

export function useUWBPositioning() {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [anchors, setAnchors] = useState<UWBAnchor[]>([]);

  const { setRoomPosition, setPositionAccuracy, enablePositioning } =
    usePositioningStore();

  useEffect(() => {
    if (!enablePositioning) {
      return;
    }

    // Connect to UWB companion service
    const ws = new WebSocket('ws://localhost:8081');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[UWB] Connected to companion service');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'position') {
        handlePositionUpdate(message.data as UWBPosition);
      } else if (message.type === 'anchors') {
        setAnchors(message.data);
        console.log(`[UWB] Received ${message.data.length} anchor configurations`);
      }
    };

    ws.onclose = () => {
      console.log('[UWB] Disconnected from companion service');
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error('[UWB] WebSocket error:', error);
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [enablePositioning]);

  const handlePositionUpdate = (position: UWBPosition) => {
    const { x, y, z, quality, anchorsUsed } = position;

    // Update position store
    setRoomPosition([x, y, z]);

    // Estimate accuracy from quality metric
    // Quality 100 = ±10cm, Quality 50 = ±30cm, Quality 0 = ±50cm
    const accuracy = 0.1 + (1 - quality / 100) * 0.4;
    setPositionAccuracy(accuracy);

    console.log(
      `[UWB] Position: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}) ` +
      `±${(accuracy * 100).toFixed(0)}cm, ` +
      `quality=${quality}, anchors=${anchorsUsed}`
    );
  };

  return {
    connected,
    anchors,
  };
}
```

---

## Step 4: Update Positioning Store for UWB

**File**: `/Users/kentino/Projects/Active/HandTrack3D/src/stores/positioningStore.ts` (MODIFY)

**Changes**:
Add UWB mode alongside WiFi mode

```typescript
export type PositioningMode =
  | 'disabled'
  | 'wifi-only'
  | 'uwb-only'     // NEW
  | 'fusion';

interface PositioningState {
  // ... existing fields

  // UWB-specific
  uwbQuality: number; // 0-100
  uwbAnchorsUsed: number;
}
```

---

## Step 5: Integrate UWB with Sensor Fusion

**File**: `/Users/kentino/Projects/Active/HandTrack3D/src/services/sensorFusion/SensorFusionService.ts` (MODIFY)

**Changes**: UWB provides higher accuracy positioning → adjust Kalman filter parameters

**Current**: WiFi measurement noise = 2.5m
**New**: UWB measurement noise = 0.15m (average of ±10-30cm)

```typescript
updateCameraPose(
  position: THREE.Vector3,
  accuracy: number,
  orientation?: THREE.Quaternion,
  signalQuality?: WiFiSignalQuality,
  positioningType?: 'wifi' | 'uwb' // NEW
): void {
  // ... existing code

  // Adjust measurement noise based on positioning type
  if (positioningType === 'uwb') {
    // UWB has much higher accuracy
    // Use reported accuracy directly (typically 0.1-0.3m)
    this.wifiNoiseStd = accuracy;
  } else {
    // WiFi positioning (existing behavior)
    this.wifiNoiseStd = 2.5;
  }
}
```

---

## Step 6: Update UI for UWB Mode

**File**: `/Users/kentino/Projects/Active/HandTrack3D/src/components/Positioning/PositioningStatus.tsx` (MODIFY)

**Changes**:
- Display "UWB" instead of "WiFi" when in UWB mode
- Show UWB quality metric (0-100)
- Show number of anchors used

```tsx
{positioningMode === 'uwb-only' && (
  <>
    <div className="text-xs text-gray-400">Mode: UWB Positioning</div>
    <div className="text-xs text-gray-400">
      Quality: {uwbQuality}% | Anchors: {uwbAnchorsUsed}
    </div>
  </>
)}
```

---

## Testing Strategy

### Phase 1: Hardware Validation

**Objective**: Verify UWB hardware works correctly

1. **Single Anchor-Tag Pair**
   - Measure distance with tape measure (e.g., 2.00m)
   - Read UWB distance from UART output
   - Expected: ±10-30cm accuracy

2. **Multiple Anchors (4+)**
   - Place anchors at known coordinates
   - Read tag position from UART
   - Compare with physical measurement
   - Expected: ±10-30cm 3D accuracy

3. **Update Rate**
   - Monitor UART output frequency
   - Expected: ~10Hz position updates

### Phase 2: Software Integration

**Objective**: Verify UWB data flows to HandTrack3D

1. **UWB Companion Service**
   - Start server: `node tools/uwb-companion/server.js`
   - Verify serial connection
   - Verify WebSocket server starts
   - Check position broadcasts

2. **Web App Connection**
   - Start HandTrack3D: `pnpm dev`
   - Enable UWB positioning in settings
   - Verify WebSocket connection
   - Check room position updates in console

3. **Sensor Fusion**
   - Enable fusion mode
   - Move hand in front of camera
   - Verify fused hand positions update
   - Check debug panel for fusion statistics

### Phase 3: Accuracy Validation

**Objective**: Measure end-to-end accuracy

1. **Static Accuracy** (tag at fixed position)
   - Place tag at known coordinates
   - Record 100 position samples (10 seconds @ 10Hz)
   - Compute mean and standard deviation
   - Expected: Mean within ±10-30cm, σ < 10cm

2. **Dynamic Accuracy** (tag moving)
   - Move tag along known path (e.g., straight line 2m)
   - Record position trajectory
   - Compare with ground truth
   - Expected: Path accuracy ±10-30cm

3. **Sensor Fusion Accuracy**
   - Place hand at known room position
   - Track with camera + UWB fusion
   - Measure fused hand position error
   - Expected: ±5-15cm (combines UWB ±10-30cm with camera ±1cm)

### Phase 4: Performance Benchmarking

**Objective**: Verify performance meets requirements

1. **Latency**
   - Measure UWB → WebSocket → Sensor Fusion latency
   - Expected: <100ms end-to-end

2. **Update Rate**
   - Monitor position update frequency
   - Expected: 10Hz sustained

3. **Computational Cost**
   - Measure Kalman filter overhead with UWB
   - Expected: <3% of frame budget (same as WiFi)

---

## Success Criteria

- ✅ UWB hardware configured (4-6 anchors, 1 tag)
- ✅ UWB companion service running
- ✅ Position updates at 10Hz
- ✅ Accuracy: ±10-30cm room-scale positioning
- ✅ Sensor fusion: ±5-15cm hand tracking accuracy
- ✅ WebSocket integration working
- ✅ UI displays UWB mode and quality
- ✅ Performance: <100ms latency, <3% CPU overhead

---

## Cost-Benefit Analysis

### Costs

**Hardware** (~$420-560):
- 6× DWM1001-DEV @ $70 = $420
- USB cables, mounting: $50-100
- **Total**: $470-520

**Time** (1-2 weeks):
- Hardware setup: 2-3 days
- Software integration: 3-4 days
- Testing and validation: 2-3 days
- **Total**: 7-10 days

### Benefits

**Accuracy**: 10-30x improvement
- WiFi: ±2-5m → UWB: ±10-30cm
- Sensor fusion: ±1.5cm → ±5-15cm

**Update Rate**: 5x improvement
- WiFi: 2Hz → UWB: 10Hz
- Faster tracking, lower latency

**Reliability**:
- Multipath immunity (wide bandwidth)
- No RSSI calibration needed
- Consistent accuracy across environments

**Use Cases Enabled**:
- Precise spatial anchors (±10cm placement)
- Multi-user collaborative AR (room-scale tracking)
- Hand gesture recording/replay (accurate positioning)
- Physical object interaction (sub-decimeter accuracy)

---

## Files Summary

### New Files (3 files, ~500 LOC)

1. **`tools/uwb-companion/server.js`** (~300 LOC)
   - Serial port connection to UWB bridge
   - WebSocket server for position broadcast
   - UWB data parsing (JSON format)
   - Anchor configuration management

2. **`src/hooks/useUWBPositioning.ts`** (~200 LOC)
   - WebSocket connection to UWB companion
   - Position update handling
   - Quality and anchor metrics
   - Store integration

3. **`docs/phase4/UWB_HARDWARE_SETUP.md`** (documentation)
   - Hardware procurement guide
   - Anchor placement strategies
   - Configuration procedures
   - Firmware flashing instructions

### Modified Files (4 files)

1. **`src/stores/positioningStore.ts`**
   - Add 'uwb-only' positioning mode
   - Add UWB quality and anchor count fields

2. **`src/services/sensorFusion/SensorFusionService.ts`**
   - Accept positioning type parameter
   - Adjust measurement noise for UWB (0.15m vs 2.5m)

3. **`src/components/Positioning/PositioningStatus.tsx`**
   - Display UWB mode indicator
   - Show quality and anchor count

4. **`src/components/SettingsPanel/SettingsPanel.tsx`**
   - Add UWB mode option in positioning tab

---

## Next Steps After Phase 4F

**Phase 4G**: Multi-User Support
- UWB tag per user/device
- Separate Kalman filters per user
- Shared room coordinate system
- Collaborative hand tracking

**Phase 4H**: Advanced Filtering
- Interacting Multiple Model (IMM) filter
- Unscented Kalman Filter (UKF) for nonlinear motion
- Magnetometer fusion (absolute heading)
- Cross-user prediction

---

## Alternative: UWB in Mobile Devices

**Note**: Some modern smartphones have built-in UWB chips:
- Apple: iPhone 11+ (U1 chip)
- Samsung: Galaxy S21+ (UWB)
- Google: Pixel 6 Pro+ (UWB)

**Browser API**: Currently **no standard Web API** for UWB access
- Native apps can access UWB (iOS Nearby Interaction, Android UWB API)
- Web apps require external hardware (DWM1001 bridge)

**Future**: If browser UWB API becomes available, Phase 4F can be simplified to software-only implementation (similar to DeviceOrientationEvent for IMU).

---

## Conclusion

Phase 4F replaces WiFi positioning with UWB hardware, achieving **10-30x accuracy improvement** (±2-5m → ±10-30cm) and **5x update rate improvement** (2Hz → 10Hz). The integration reuses existing sensor fusion architecture with minimal changes, primarily adjusting Kalman filter measurement noise parameters.

**ROI**: High accuracy gain for moderate hardware cost (~$500) and development effort (1-2 weeks).

**Recommendation**: Proceed if budget allows and use cases require sub-decimeter room-scale accuracy.
