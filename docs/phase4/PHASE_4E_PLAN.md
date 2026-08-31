# Phase 4E: Adaptive Kalman Filtering - Implementation Plan

## Context

**Why**: HandTrack3D currently uses **hardcoded noise values** in the Kalman filter (camera: 0.01m, WiFi: 2.5m, process: 0.05m). This works well under ideal conditions but degrades when:
- WiFi signal quality varies (different RSSI values)
- Hand motion characteristics change (fast vs slow movement)
- Environmental conditions fluctuate (interference, obstacles)

**Problem**: Fixed noise parameters cannot adapt to changing conditions, resulting in:
- Suboptimal filtering when WiFi signal is weak (R too small → trusts noisy data)
- Over-smoothing when WiFi signal is strong (R too large → ignores accurate data)
- Lag during rapid motion (Q too small → can't track acceleration)
- Excessive jitter during slow motion (Q too large → follows noise)

**Solution**: Implement **adaptive noise estimation** that:
1. Estimates measurement noise (R) based on WiFi signal quality (RSSI, accuracy)
2. Estimates process noise (Q) based on observed motion characteristics
3. Updates Kalman filter parameters online (every frame)

**Expected Outcome**:
- Improved accuracy across varying WiFi conditions
- Better tracking during rapid motion changes
- Reduced lag and jitter
- Automatic tuning (no manual calibration needed)

---

## Implementation Plan

### Overview

The implementation builds on the existing Kalman filter architecture:
- Current: Fixed R and Q matrices (lines 62-64 of `SensorFusionService.ts`)
- Future: Adaptive R and Q computed per-update based on signal quality and motion

**Effort**: 2-3 days (4 new files, 3 modified files, ~600 LOC total)

**Key Algorithms**:
1. **Innovation-Based R Estimation** - Estimate measurement noise from prediction error
2. **RSSI-Based R Scaling** - Scale R based on WiFi signal strength
3. **Motion-Based Q Estimation** - Adjust process noise based on acceleration
4. **Exponential Moving Average** - Smooth noise estimates over time

---

## Step 1: Create Adaptive Noise Estimator

**File**: `/Users/kentino/Projects/Active/HandTrack3D/src/utils/kalman/AdaptiveNoiseEstimator.ts` (NEW, ~200 LOC)

**Purpose**:
- Estimate measurement noise (R) from innovation sequence
- Estimate process noise (Q) from residual motion
- Provide smoothed noise estimates for Kalman filter

**Key Concepts**:

### Innovation-Based R Estimation

The **innovation** (ν) is the difference between predicted and measured position:
```
ν = z_measured - z_predicted
```

If the Kalman filter is tuned correctly, innovation should be white noise with covariance **S**:
```
S = H * P * H^T + R
```

We can estimate R by computing the sample covariance of recent innovations:
```
R_estimated = E[ν * ν^T] - H * P * H^T
```

### Motion-Based Q Estimation

Process noise Q should increase when acceleration is high (rapid motion changes).

We estimate Q based on observed acceleration:
```
acceleration = (velocity_current - velocity_previous) / dt
Q_base = 0.05m (default)
Q_adaptive = Q_base * (1 + k * |acceleration|)
```

where k is a scaling factor (e.g., 10).

**Implementation**:

```typescript
export interface NoiseEstimate {
  measurement: number; // Estimated measurement noise (R)
  process: number;     // Estimated process noise (Q)
  confidence: number;  // Estimate confidence (0-1)
  sampleCount: number; // Number of samples used
}

export class AdaptiveNoiseEstimator {
  private readonly innovationHistory: number[] = [];
  private readonly accelerationHistory: number[] = [];
  private readonly windowSize = 30; // 1 second at 30Hz

  // Base noise values (fallback)
  private readonly baseR = 0.01; // 1cm (camera)
  private readonly baseQ = 0.05; // 5cm (process)

  // EMA smoothing factor (0.9 = smooth, 0.1 = responsive)
  private readonly alpha = 0.8;

  // Current estimates (smoothed)
  private currentR: number = this.baseR;
  private currentQ: number = this.baseQ;

  /**
   * Update R estimate from innovation (prediction error)
   */
  updateMeasurementNoise(
    innovation: THREE.Vector3,
    covarianceP: number[][] // Position uncertainty
  ): void {
    // Compute innovation magnitude
    const innovationMag = innovation.length();

    // Add to history
    this.innovationHistory.push(innovationMag);
    if (this.innovationHistory.length > this.windowSize) {
      this.innovationHistory.shift();
    }

    // Compute sample variance
    const mean = this.innovationHistory.reduce((a, b) => a + b, 0) /
                 this.innovationHistory.length;
    const variance = this.innovationHistory
      .map(x => Math.pow(x - mean, 2))
      .reduce((a, b) => a + b, 0) / this.innovationHistory.length;

    // Estimate R (subtract predicted uncertainty)
    const predictedVariance = covarianceP[0][0]; // Position variance
    const estimatedR = Math.max(0.001, Math.sqrt(variance - predictedVariance));

    // Exponential moving average (smooth estimate)
    this.currentR = this.alpha * this.currentR + (1 - this.alpha) * estimatedR;
  }

  /**
   * Update Q estimate from motion characteristics
   */
  updateProcessNoise(
    velocity: THREE.Vector3,
    previousVelocity: THREE.Vector3,
    dt: number
  ): void {
    // Compute acceleration magnitude
    const acceleration = velocity.clone().sub(previousVelocity).divideScalar(dt);
    const accelMag = acceleration.length();

    // Add to history
    this.accelerationHistory.push(accelMag);
    if (this.accelerationHistory.length > this.windowSize) {
      this.accelerationHistory.shift();
    }

    // Compute average acceleration
    const avgAccel = this.accelerationHistory.reduce((a, b) => a + b, 0) /
                     this.accelerationHistory.length;

    // Scale Q based on acceleration (more motion → more process noise)
    const k = 10; // Scaling factor
    const estimatedQ = this.baseQ * (1 + k * avgAccel);

    // Exponential moving average
    this.currentQ = this.alpha * this.currentQ + (1 - this.alpha) * estimatedQ;
  }

  /**
   * Get current noise estimates
   */
  getNoiseEstimate(): NoiseEstimate {
    const confidence = Math.min(
      this.innovationHistory.length / this.windowSize,
      this.accelerationHistory.length / this.windowSize
    );

    return {
      measurement: this.currentR,
      process: this.currentQ,
      confidence,
      sampleCount: Math.min(
        this.innovationHistory.length,
        this.accelerationHistory.length
      ),
    };
  }

  /**
   * Reset estimator (clear history)
   */
  reset(): void {
    this.innovationHistory.length = 0;
    this.accelerationHistory.length = 0;
    this.currentR = this.baseR;
    this.currentQ = this.baseQ;
  }
}
```

---

## Step 2: Create RSSI-Based R Scaler

**File**: `/Users/kentino/Projects/Active/HandTrack3D/src/utils/kalman/RSSINoiseScaler.ts` (NEW, ~150 LOC)

**Purpose**:
- Scale measurement noise (R) based on WiFi signal strength (RSSI)
- Weaker signal → higher R (trust measurement less)
- Stronger signal → lower R (trust measurement more)

**Algorithm**:

WiFi positioning accuracy correlates with RSSI (signal strength):
```
RSSI → -30 dBm (very strong): ±1m accuracy
RSSI → -60 dBm (moderate):    ±2.5m accuracy
RSSI → -80 dBm (weak):        ±5m+ accuracy
```

Scale R accordingly:
```
R_scaled = R_base * scalingFactor(RSSI)
```

**Implementation**:

```typescript
export interface WiFiSignalQuality {
  avgRSSI: number;      // Average RSSI across routers (dBm)
  minRSSI: number;      // Weakest signal (dBm)
  routerCount: number;  // Number of routers used
  accuracy: number;     // Reported accuracy (meters)
}

export class RSSINoiseScaler {
  // RSSI thresholds (dBm)
  private readonly EXCELLENT_RSSI = -40;
  private readonly GOOD_RSSI = -60;
  private readonly FAIR_RSSI = -75;
  private readonly POOR_RSSI = -85;

  // Scaling factors
  private readonly EXCELLENT_SCALE = 0.5;  // Trust 2x more
  private readonly GOOD_SCALE = 1.0;       // Default trust
  private readonly FAIR_SCALE = 2.0;       // Trust 2x less
  private readonly POOR_SCALE = 5.0;       // Trust 5x less

  /**
   * Compute R scaling factor from WiFi signal quality
   */
  computeScaling(quality: WiFiSignalQuality): number {
    const { avgRSSI, minRSSI, routerCount, accuracy } = quality;

    // Use minimum RSSI (weakest link determines quality)
    const rssi = minRSSI;

    // Compute base scaling from RSSI
    let baseScale: number;
    if (rssi >= this.EXCELLENT_RSSI) {
      baseScale = this.EXCELLENT_SCALE;
    } else if (rssi >= this.GOOD_RSSI) {
      // Linear interpolation between EXCELLENT and GOOD
      const t = (rssi - this.GOOD_RSSI) / (this.EXCELLENT_RSSI - this.GOOD_RSSI);
      baseScale = this.GOOD_SCALE + t * (this.EXCELLENT_SCALE - this.GOOD_SCALE);
    } else if (rssi >= this.FAIR_RSSI) {
      // Linear interpolation between GOOD and FAIR
      const t = (rssi - this.FAIR_RSSI) / (this.GOOD_RSSI - this.FAIR_RSSI);
      baseScale = this.FAIR_SCALE + t * (this.GOOD_SCALE - this.FAIR_SCALE);
    } else if (rssi >= this.POOR_RSSI) {
      // Linear interpolation between FAIR and POOR
      const t = (rssi - this.POOR_RSSI) / (this.FAIR_RSSI - this.POOR_RSSI);
      baseScale = this.POOR_SCALE + t * (this.FAIR_SCALE - this.POOR_SCALE);
    } else {
      // Below -85 dBm: very poor signal
      baseScale = this.POOR_SCALE * 2; // 10x less trust
    }

    // Adjust for router count (more routers → better triangulation)
    const routerBonus = routerCount >= 4 ? 0.8 : routerCount >= 3 ? 1.0 : 1.5;

    // Adjust for reported accuracy (if available)
    const accuracyPenalty = accuracy > 5 ? 2.0 : accuracy > 3 ? 1.5 : 1.0;

    return baseScale * routerBonus * accuracyPenalty;
  }
}
```

---

## Step 3: Extend Kalman Filter with Adaptive Noise

**File**: `/Users/kentino/Projects/Active/HandTrack3D/src/utils/kalman/KalmanFilter.ts` (MODIFY)

**Changes**:
1. Add `setMeasurementNoise(R)` method to update R dynamically
2. Add `setProcessNoise(Q)` method to update Q dynamically
3. Expose innovation (prediction error) for noise estimation
4. Expose covariance matrix P for R estimation

**Line modifications**:

```typescript
// Add new methods after line 200

/**
 * Update measurement noise (R) dynamically
 */
setMeasurementNoise(R: number): void {
  this.R = Math.max(0.001, R); // Minimum 1mm
  console.log(`[Kalman] Measurement noise updated: ${this.R.toFixed(4)}m`);
}

/**
 * Update process noise (Q) dynamically
 */
setProcessNoise(Q: number): void {
  this.Q = Math.max(0.001, Q); // Minimum 1mm
  console.log(`[Kalman] Process noise updated: ${this.Q.toFixed(4)}m`);
}

/**
 * Get innovation (prediction error) for noise estimation
 */
getInnovation(measurement: [number, number, number]): THREE.Vector3 {
  const predicted = this.getPosition();
  return new THREE.Vector3(
    measurement[0] - predicted.x,
    measurement[1] - predicted.y,
    measurement[2] - predicted.z
  );
}

/**
 * Get position covariance (for R estimation)
 */
getPositionCovariance(): number[][] {
  return [
    [this.P[0][0], this.P[0][1], this.P[0][2]],
    [this.P[1][0], this.P[1][1], this.P[1][2]],
    [this.P[2][0], this.P[2][1], this.P[2][2]],
  ];
}
```

---

## Step 4: Integrate Adaptive Noise in Sensor Fusion Service

**File**: `/Users/kentino/Projects/Active/HandTrack3D/src/services/sensorFusion/SensorFusionService.ts` (MODIFY)

**Changes**:
1. Add `AdaptiveNoiseEstimator` instance per hand
2. Add `RSSINoiseScaler` instance
3. Update Kalman filter noise before each update
4. Compute innovation and update estimators

**Key integration points**:

```typescript
import { AdaptiveNoiseEstimator } from '@/utils/kalman/AdaptiveNoiseEstimator';
import { RSSINoiseScaler, type WiFiSignalQuality } from '@/utils/kalman/RSSINoiseScaler';

export class SensorFusionService {
  // Existing...
  private filters: Map<string, KalmanFilter>;

  // NEW: Adaptive noise estimators (one per hand)
  private noiseEstimators: Map<string, AdaptiveNoiseEstimator>;

  // NEW: RSSI-based scaler (shared)
  private rssiScaler: RSSINoiseScaler;

  // NEW: Enable/disable adaptive filtering
  private adaptiveFilteringEnabled = true;

  constructor() {
    // Existing...
    this.noiseEstimators = new Map();
    this.rssiScaler = new RSSINoiseScaler();
  }

  /**
   * Update camera pose from WiFi positioning
   */
  updateCameraPose(
    position: THREE.Vector3,
    accuracy: number,
    orientation?: THREE.Quaternion,
    signalQuality?: WiFiSignalQuality // NEW parameter
  ): void {
    // Existing code...

    // NEW: Store signal quality for R scaling
    this.cameraPose = {
      position: position.clone(),
      orientation: orientation?.clone() || new THREE.Quaternion(),
      timestamp: now,
      accuracy,
      signalQuality, // NEW field
    };
  }

  /**
   * Update hand tracking with adaptive filtering
   */
  updateHandTracking(hands: HandState[]): void {
    if (!this.cameraPose) {
      // Fallback...
      return;
    }

    for (const hand of hands) {
      const roomPosition = this.transformCameraToRoom(hand.position);

      // Get or create Kalman filter
      let filter = this.filters.get(hand.id);
      let estimator = this.noiseEstimators.get(hand.id);

      if (!filter) {
        // Initialize filter and estimator...
        filter = new KalmanFilter(initialState, this.processNoise);
        estimator = new AdaptiveNoiseEstimator();
        this.filters.set(hand.id, filter);
        this.noiseEstimators.set(hand.id, estimator!);
      }

      // Predict
      filter.predict();

      // ADAPTIVE NOISE ESTIMATION
      if (this.adaptiveFilteringEnabled && estimator) {
        // 1. Compute innovation (prediction error)
        const innovation = filter.getInnovation([
          roomPosition.x,
          roomPosition.y,
          roomPosition.z,
        ]);

        // 2. Update measurement noise estimate
        const covariance = filter.getPositionCovariance();
        estimator.updateMeasurementNoise(innovation, covariance);

        // 3. Update process noise estimate
        const velocity = filter.getVelocity();
        const previousVelocity = this.getPreviousVelocity(hand.id);
        if (previousVelocity) {
          estimator.updateProcessNoise(velocity, previousVelocity, 0.033);
        }

        // 4. Get adaptive noise estimates
        const noiseEst = estimator.getNoiseEstimate();

        // 5. Scale R based on WiFi signal quality
        let R = noiseEst.measurement;
        if (this.cameraPose.signalQuality) {
          const scaling = this.rssiScaler.computeScaling(
            this.cameraPose.signalQuality
          );
          R = R * scaling;
        }

        // 6. Apply adaptive noise to filter
        filter.setMeasurementNoise(R);
        filter.setProcessNoise(noiseEst.process);
      }

      // Update with measurement
      filter.update(
        [roomPosition.x, roomPosition.y, roomPosition.z],
        this.cameraNoiseStd, // Fallback if adaptive disabled
        'camera'
      );

      // Store fused state...
    }
  }
}
```

---

## Step 5: Extend WiFi Positioning Hook to Provide Signal Quality

**File**: `/Users/kentino/Projects/Active/HandTrack3D/src/hooks/useWiFiPositioning.ts` (MODIFY)

**Changes**:
Add signal quality computation from WiFi data

```typescript
// Compute signal quality metrics
const signalQuality: WiFiSignalQuality = {
  avgRSSI: routers.reduce((sum, r) => sum + r.rssi, 0) / routers.length,
  minRSSI: Math.min(...routers.map(r => r.rssi)),
  routerCount: routers.length,
  accuracy: positionAccuracy,
};

// Pass to sensor fusion
sensorFusion.updateCameraPose(
  position,
  positionAccuracy,
  imuOrientation,
  signalQuality // NEW
);
```

---

## Step 6: Update Debug Panel to Show Adaptive Noise

**File**: `/Users/kentino/Projects/Active/HandTrack3D/src/components/Positioning/SensorFusionDebug.tsx` (MODIFY)

**Changes**:
Display adaptive noise estimates in real-time

```tsx
{/* Adaptive Noise Estimates */}
<div className="border-t border-purple-700/30 pt-2 mb-3">
  <div className="text-xs text-gray-400 mb-1">Adaptive Filtering:</div>
  <div className="text-xs space-y-0.5">
    <div className="flex justify-between">
      <span className="text-gray-400">R (measurement):</span>
      <span className="font-mono text-white">
        {adaptiveR.toFixed(4)}m
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-400">Q (process):</span>
      <span className="font-mono text-white">
        {adaptiveQ.toFixed(4)}m
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-400">WiFi RSSI:</span>
      <span className="font-mono text-white">
        {avgRSSI.toFixed(0)} dBm
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-400">Confidence:</span>
      <span className="font-mono text-green-400">
        {(confidence * 100).toFixed(0)}%
      </span>
    </div>
  </div>
</div>
```

---

## Testing Strategy

### Phase 1: Unit Testing (Estimators)

Test noise estimators in isolation:

```typescript
// Test innovation-based R estimation
const estimator = new AdaptiveNoiseEstimator();
const innovation = new THREE.Vector3(0.05, 0.03, 0.02); // 5cm, 3cm, 2cm
const covariance = [[0.0001, 0, 0], [0, 0.0001, 0], [0, 0, 0.0001]];
estimator.updateMeasurementNoise(innovation, covariance);
const R = estimator.getNoiseEstimate().measurement;
// Expect R ≈ 0.06m (innovation magnitude ≈ 6cm)
```

### Phase 2: RSSI Scaling Testing

Test RSSI-based scaling:

```typescript
const scaler = new RSSINoiseScaler();

// Excellent signal
const excellent = scaler.computeScaling({
  avgRSSI: -35,
  minRSSI: -35,
  routerCount: 4,
  accuracy: 1.0,
});
// Expect scaling ≈ 0.4 (trust more)

// Poor signal
const poor = scaler.computeScaling({
  avgRSSI: -80,
  minRSSI: -80,
  routerCount: 2,
  accuracy: 5.0,
});
// Expect scaling ≈ 10.0+ (trust less)
```

### Phase 3: Integration Testing

Test full sensor fusion pipeline:

1. **Stationary Hand, Good WiFi**
   - Expected: Low R, low Q, minimal jitter

2. **Moving Hand, Good WiFi**
   - Expected: Low R, moderate Q, smooth tracking

3. **Stationary Hand, Poor WiFi**
   - Expected: High R (WiFi scaled down), low Q, stable position

4. **Moving Hand, Poor WiFi**
   - Expected: High R, moderate Q, relies more on motion prediction

### Phase 4: Real-World Validation

Measure accuracy improvement:

```bash
# Before (fixed noise)
Avg Error: ±2.5cm
Max Error: ±8cm
Jitter: 1.2cm RMS

# After (adaptive noise)
Avg Error: ±1.5cm (40% improvement)
Max Error: ±5cm (37% improvement)
Jitter: 0.8cm RMS (33% improvement)
```

---

## Success Criteria

- ✅ R adapts based on innovation sequence
- ✅ R scales with WiFi signal quality (RSSI)
- ✅ Q adapts based on motion characteristics
- ✅ Noise estimates smooth over time (EMA)
- ✅ Debug panel shows real-time adaptive noise values
- ✅ Accuracy improves under varying WiFi conditions
- ✅ No performance degradation (remains <1ms overhead)
- ✅ Backward compatible (can disable adaptive filtering)

---

## Files Summary

### New Files (4 files, ~600 LOC)

1. **`src/utils/kalman/AdaptiveNoiseEstimator.ts`** (~200 LOC)
   - Innovation-based R estimation
   - Motion-based Q estimation
   - Exponential moving average smoothing

2. **`src/utils/kalman/RSSINoiseScaler.ts`** (~150 LOC)
   - RSSI-to-scaling mapping
   - Router count adjustment
   - Accuracy-based penalties

3. **`docs/phase4/PHASE_4E_SUMMARY.md`** (~150 LOC)
   - Implementation summary
   - Algorithm explanations
   - Test results

4. **`docs/phase4/PHASE_4E_PLAN.md`** (this file, ~600 LOC)

### Modified Files (3 files)

1. **`src/utils/kalman/KalmanFilter.ts`**
   - Add `setMeasurementNoise()` method
   - Add `setProcessNoise()` method
   - Add `getInnovation()` method
   - Add `getPositionCovariance()` method

2. **`src/services/sensorFusion/SensorFusionService.ts`**
   - Add `AdaptiveNoiseEstimator` instances
   - Add `RSSINoiseScaler` instance
   - Update `updateCameraPose()` to accept signal quality
   - Update `updateHandTracking()` to compute adaptive noise

3. **`src/components/Positioning/SensorFusionDebug.tsx`**
   - Display adaptive R and Q values
   - Display WiFi RSSI
   - Display estimator confidence

---

## Next Steps After Phase 4E

**Phase 4F**: UWB Hardware Integration (±10-30cm accuracy, 10Hz updates)
**Phase 4G**: Multi-User Support (WiFi positioning per device)
**Phase 4H**: Kalman Filter Variants (IMM, UKF for nonlinear motion)

---

## Implementation Timeline

**Day 1**:
- Create `AdaptiveNoiseEstimator.ts`
- Create `RSSINoiseScaler.ts`
- Unit tests for estimators

**Day 2**:
- Extend `KalmanFilter.ts` with adaptive methods
- Integrate adaptive noise in `SensorFusionService.ts`
- Update WiFi hook to provide signal quality

**Day 3**:
- Update debug panel with adaptive noise display
- Integration testing (vary WiFi signal, motion)
- Real-world validation
- Documentation (summary, results)

**Total**: 2-3 days (~20-24 hours)
