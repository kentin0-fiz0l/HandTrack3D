# Phase 4B: Sensor Fusion Integration

## Overview

Phase 4B integrates WiFi positioning with the existing MediaPipe hand tracking system to provide room-scale spatial awareness. This builds on Phase 4A's WiFi positioning research and prototype.

## Completed Features

### 1. Positioning State Management (`positioningStore.ts`)

**Purpose**: Centralized state for WiFi positioning system

**Key Features**:
- Router configuration management (add, update, remove, persist)
- Real-time position tracking (room-scale coordinates + accuracy estimation)
- Calibration wizard state (4-step router setup)
- Connection status tracking
- Positioning modes: `disabled`, `wifi-only`, `fusion`
- Zustand persistence for router configs and settings

**Interface**:
```typescript
interface PositioningStore {
  // Connection
  isConnected: boolean;
  connectionError: string | null;

  // Router configuration
  routers: RouterConfig[];

  // Current position
  roomPosition: [number, number, number] | null;
  positionAccuracy: number | null;

  // Calibration
  isCalibrating: boolean;
  calibrationStep: number;

  // Settings
  enablePositioning: boolean;
  positioningMode: 'wifi-only' | 'fusion' | 'disabled';
  updateInterval: number; // milliseconds
}
```

---

### 2. WiFi Positioning Hook (`useWiFiPositioning.ts`)

**Purpose**: Manages WebSocket connection and position calculation

**Features**:
- Auto-connect/disconnect based on settings
- RSSI data processing from companion app
- Real-time trilateration (3D position from WiFi signal strength)
- Event-based architecture (connect, disconnect, error, RSSI update)
- Exponential backoff reconnection (via `WiFiCompanionClient`)

**Flow**:
1. User enables positioning in settings
2. Hook connects to `ws://localhost:8080` (companion app)
3. Receives RSSI data every 500ms
4. Matches RSSI to configured routers
5. Converts RSSI → distance (path loss model)
6. Trilaterates position from 3+ routers
7. Updates `positioningStore` with room coordinates

**Usage**:
```typescript
const { connect, disconnect, isConnected } = useWiFiPositioning();
```

---

### 3. Positioning Status Indicator (`PositioningStatus.tsx`)

**Purpose**: Real-time display of WiFi positioning status

**UI Elements**:
- **Connection Status**: Green pulse (connected) / Red (disconnected)
- **Mode Display**: WiFi Only / Sensor Fusion
- **Router Count**: Shows 0-4 routers, warns if < 3
- **Current Position**: Live room coordinates (X, Y, Z in meters)
- **Accuracy Estimate**: ±2-5m typical
- **Staleness Warning**: Alerts if no data for 2+ seconds
- **Connect/Disconnect Button**
- **Help Text**: Instructions for starting companion app

**Location**: Top-right corner (below gesture widget)

**Auto-Hide**: Hidden when positioning disabled

---

### 4. Calibration Wizard (`CalibrationWizard.tsx`)

**Purpose**: 4-step guided setup for router positioning

**Workflow**:
1. **Step 1-4**: For each router:
   - Select WiFi network from detected list (live RSSI data)
   - Enter router name (e.g., "Living Room Router")
   - Set physical position (X, Y, Z in meters from room origin)
   - Optionally: Calibrate reference RSSI (stand 1m from router)
2. **Finish**: Save configuration, auto-enable fusion mode

**Features**:
- Real-time network scanning (requires companion app connected)
- Progress bar (Step X of 4)
- Position guide (room coordinate system explanation)
- Router list preview (configured routers)
- Clear all routers (reset calibration)

**Validation**:
- Requires 3+ routers for positioning (warns if < 3)
- Must select network and enter name before continuing

---

### 5. Settings Panel Integration

**New Tab**: "Positioning" (6th tab)

**Settings**:
- **Enable Positioning** (toggle)
- **Positioning Mode** (dropdown):
  - `disabled`: No positioning
  - `wifi-only`: WiFi RSSI only (±2-5m accuracy)
  - `fusion`: WiFi + camera tracking (future: Kalman filter)
- **Update Interval** (100-2000ms): How often to recalculate position
- **Calibrate Routers** (button): Launch calibration wizard
- **Clear All Routers** (button): Reset configuration
- **Router List** (display): Shows configured routers with positions

**Dependencies**:
- Requires companion app running for calibration
- Disables calibration button when disconnected

---

## Architecture

### Data Flow

```
WiFi Companion App (Node.js)
    ↓ (WebSocket: ws://localhost:8080)
WiFiCompanionClient.onRssiUpdate()
    ↓
useWiFiPositioning.handleRssiUpdate()
    ↓
calculatePosition() (RSSI → distance → trilateration)
    ↓
positioningStore.updatePosition([x, y, z], accuracy)
    ↓
PositioningStatus renders room coordinates
```

### State Management

**Transient State** (not persisted):
- `isConnected`, `connectionError`
- `roomPosition`, `positionAccuracy`
- `lastRssiData`, `lastUpdateTime`
- `isCalibrating`, `calibrationStep`

**Persistent State** (localStorage via Zustand):
- `routers: RouterConfig[]`
- `enablePositioning: boolean`
- `positioningMode: 'wifi-only' | 'fusion' | 'disabled'`
- `updateInterval: number`

---

## Mathematical Foundation

### RSSI to Distance Conversion

**Path Loss Model**:
```
RSSI = -10n * log₁₀(d) + A

Where:
  n = path loss exponent (2.5 for indoor)
  d = distance in meters
  A = reference RSSI at 1 meter (-40 dBm typical)
```

**Inverse** (solves for distance):
```typescript
distance = 10^((referenceRssi - rssi) / (10 * n))
```

### 3D Trilateration

**Weighted Least Squares**:
Given router positions (x₁, y₁, z₁), (x₂, y₂, z₂), (x₃, y₃, z₃)...
And distances d₁, d₂, d₃...

Solves system:
```
(x - x₁)² + (y - y₁)² + (z - z₁)² = d₁²
(x - x₂)² + (y - y₂)² + (z - z₂)² = d₂²
(x - x₃)² + (y - y₃)² + (z - z₃)² = d₃²
...
```

Returns:
```typescript
{
  position: Vector3,
  accuracy: number // estimated error in meters
}
```

---

## Integration Points

### App.tsx
```typescript
// Initialize WiFi positioning hook
useWiFiPositioning();

// Render positioning components
<PositioningStatus />
<CalibrationWizard />
```

### HandTrackingCanvas (Future: Phase 4C)
```typescript
// TODO: Sensor fusion
// Combine roomPosition (WiFi) with hand positions (camera)
// Apply Kalman filter for smooth, accurate tracking
```

---

## Files Created

**Stores** (1 file, ~200 LOC):
- `/src/stores/positioningStore.ts`

**Hooks** (1 file, ~140 LOC):
- `/src/hooks/useWiFiPositioning.ts`

**Components** (3 files, ~400 LOC):
- `/src/components/Positioning/PositioningStatus.tsx` (~140 LOC)
- `/src/components/Positioning/CalibrationWizard.tsx` (~260 LOC)
- `/src/components/Positioning/index.ts`

**Modified Files**:
- `/src/components/SettingsPanel/SettingsPanel.tsx` (~120 lines added)
- `/src/App.tsx` (~10 lines added)

**Total**: ~770 LOC

---

## Usage Instructions

### 1. Start WiFi Companion App

```bash
cd tools/wifi-companion
npm install
npm start

# Output:
# WiFi Companion App listening on ws://localhost:8080
# Scanning WiFi networks...
```

### 2. Enable Positioning in HandTrack3D

1. Open HandTrack3D app
2. Click Settings (gear icon)
3. Navigate to "Positioning" tab
4. Toggle "Enable Positioning" ON
5. Click "Connect" in Positioning Status widget (top-right)
6. Verify green pulse (connected)

### 3. Calibrate Routers

1. Click "Calibrate Routers (0/4)" in Settings
2. For each router (minimum 3):
   - Select WiFi network from list
   - Enter router name
   - Measure router's position from room corner (origin)
   - Enter X, Y, Z coordinates in meters
   - (Optional) Stand 1m from router, note RSSI for calibration
   - Click "Add Router & Continue"
3. After 3-4 routers: Click "Finish Calibration"
4. Positioning auto-enables in "Sensor Fusion" mode

### 4. View Real-Time Position

1. Check Positioning Status widget (top-right)
2. Room Position displays:
   ```
   X: 2.34m
   Y: 1.50m
   Z: 3.12m
   Accuracy: ±2.5m
   ```
3. Position updates every 500ms (default interval)

---

## Known Limitations (Phase 4B)

1. **No Sensor Fusion Yet**:
   - WiFi and camera data are separate
   - Not yet combined via Kalman filter
   - Fusion mode acts as "wifi-only" until Phase 4C

2. **Accuracy**:
   - WiFi-only: ±2-5 meters typical
   - Affected by:
     - Router placement (need good triangulation geometry)
     - Indoor multipath (walls, furniture)
     - Number of routers (3 minimum, 4 recommended)

3. **Companion App Dependency**:
   - Requires separate Node.js process running
   - User must manually start companion app
   - Future: Electron app or native integration

4. **Calibration Complexity**:
   - Users must manually measure router positions
   - No automated calibration (e.g., walk room perimeter)
   - Coordinate system is user-defined (no visual anchor)

---

## Next Steps: Phase 4C (Sensor Fusion Implementation)

### 1. Kalman Filter Integration
- Fuse WiFi position (low-frequency, low-accuracy) with camera tracking (high-frequency, high-accuracy)
- State vector: `[x, y, z, vx, vy, vz]` (position + velocity)
- Prediction step: Use camera hand tracking
- Correction step: Use WiFi position

### 2. Camera-Relative to Room-Relative Transform
- Use WiFi position as "camera anchor" in room
- Transform hand positions from camera-relative to room-relative
- Account for camera orientation (yaw, pitch, roll)

### 3. Multi-User Support
- Track multiple users in same room
- Each user has own camera + WiFi position
- Coordinate system shared across users

### 4. UX Improvements
- Visual room origin marker in 3D scene
- Drag-to-place router positions in 3D UI
- Auto-calibration wizard (walk around room)
- Position heatmap (accuracy visualization)

---

## Testing Checklist

- [x] Store created and persists router configs
- [x] Hook connects to companion app
- [x] Hook calculates position from RSSI
- [x] Status widget displays connection state
- [x] Status widget shows room coordinates
- [x] Calibration wizard detects networks
- [x] Calibration wizard saves router configs
- [x] Settings panel has Positioning tab
- [x] Settings persist across page reload
- [x] Build succeeds without errors

---

## Phase 4B Status: ✅ COMPLETE

**Deliverables**:
- ✅ Positioning state management (positioningStore)
- ✅ WiFi connection hook (useWiFiPositioning)
- ✅ Real-time status indicator (PositioningStatus)
- ✅ 4-step calibration wizard (CalibrationWizard)
- ✅ Settings panel integration (Positioning tab)
- ✅ App.tsx integration
- ✅ Build verification (no errors)

**Ready for**: Phase 4C (Kalman filter + sensor fusion implementation)
