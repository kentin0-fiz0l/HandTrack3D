import * as THREE from 'three';
import { KalmanFilter, type StateVector } from '@/utils/kalman/KalmanFilter';
import { AdaptiveNoiseEstimator } from '@/utils/kalman/AdaptiveNoiseEstimator';
import { RSSINoiseScaler, type WiFiSignalQuality } from '@/utils/kalman/RSSINoiseScaler';

// Re-export WiFiSignalQuality for external use
export type { WiFiSignalQuality };

/**
 * Hand state with position and tracking metadata
 */
export interface HandState {
  id: string; // 'left' or 'right'
  position: THREE.Vector3; // Camera-relative position
  velocity?: THREE.Vector3; // Optional velocity
  confidence: number; // 0-1, tracking confidence
  timestamp: number; // milliseconds
}

/**
 * Camera pose in room coordinates
 */
export interface CameraPose {
  position: THREE.Vector3; // Room position (from WiFi)
  orientation: THREE.Quaternion; // Camera orientation (from IMU)
  timestamp: number;
  accuracy: number; // Position uncertainty in meters
  signalQuality?: WiFiSignalQuality; // WiFi signal quality (for adaptive filtering)
}

/**
 * Fused hand state in room coordinates
 */
export interface FusedHandState {
  id: string;
  roomPosition: THREE.Vector3; // Room-relative position
  roomVelocity: THREE.Vector3; // Room-relative velocity
  cameraPosition: THREE.Vector3; // Camera-relative position (for fallback)
  confidence: number; // Combined confidence
  uncertainty: number; // Position uncertainty in meters
  lastUpdate: number; // Timestamp of last update
}

/**
 * Sensor Fusion Service
 *
 * Combines WiFi positioning (low-frequency, low-accuracy) with
 * MediaPipe hand tracking (high-frequency, high-accuracy) using
 * Kalman filtering.
 *
 * Flow:
 * 1. WiFi updates camera position in room (~500ms interval, ±2-5m accuracy)
 * 2. Camera updates hand position relative to camera (~33ms interval, ±1cm accuracy)
 * 3. Fusion: Transform camera-relative to room-relative, filter with Kalman
 * 4. Output: Smooth, accurate hand positions in room coordinates
 */
export class SensorFusionService {
  // Kalman filters for each hand (room-relative position tracking)
  private filters: Map<string, KalmanFilter>;

  // Adaptive noise estimators (one per hand)
  private noiseEstimators: Map<string, AdaptiveNoiseEstimator>;

  // RSSI-based noise scaler (shared across hands)
  private rssiScaler: RSSINoiseScaler;

  // Current camera pose in room
  private cameraPose: CameraPose | null;

  // Fused hand states
  private fusedStates: Map<string, FusedHandState>;

  // Configuration
  private readonly cameraNoiseStd = 0.01; // 1cm camera noise (fallback)
  private readonly wifiNoiseStd = 2.5; // 2.5m WiFi noise (fallback)
  private readonly processNoise = 0.05; // 5cm process noise (fallback)

  // Enable/disable adaptive filtering
  private adaptiveFilteringEnabled = true;

  constructor() {
    this.filters = new Map();
    this.noiseEstimators = new Map();
    this.rssiScaler = new RSSINoiseScaler();
    this.fusedStates = new Map();
    this.cameraPose = null;
  }

  /**
   * Update camera pose from WiFi positioning
   * @param position - Room position from WiFi trilateration
   * @param accuracy - Position uncertainty in meters
   * @param orientation - Optional camera orientation from IMU (defaults to identity)
   * @param signalQuality - Optional WiFi signal quality (for adaptive filtering)
   */
  updateCameraPose(
    position: THREE.Vector3,
    accuracy: number,
    orientation?: THREE.Quaternion,
    signalQuality?: WiFiSignalQuality
  ): void {
    const now = Date.now();

    // Update or create camera pose
    this.cameraPose = {
      position: position.clone(),
      orientation: orientation?.clone() || new THREE.Quaternion(), // Use IMU or identity
      timestamp: now,
      accuracy,
      signalQuality, // Store for adaptive filtering
    };

    console.log(
      `[Sensor Fusion] Camera pose updated: ` +
      `pos=(${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}) ±${accuracy.toFixed(2)}m, ` +
      `orientation=${orientation ? 'IMU' : 'identity'}, ` +
      `RSSI=${signalQuality ? signalQuality.minRSSI.toFixed(0) + 'dBm' : 'N/A'}`
    );
  }

  /**
   * Update hand tracking from camera
   * @param hands - Array of hand states from MediaPipe
   */
  updateHandTracking(hands: HandState[]): void {
    if (!this.cameraPose) {
      // No WiFi positioning available - store camera-relative only
      for (const hand of hands) {
        this.fusedStates.set(hand.id, {
          id: hand.id,
          roomPosition: hand.position.clone(), // Fallback: use camera-relative
          roomVelocity: hand.velocity?.clone() || new THREE.Vector3(),
          cameraPosition: hand.position.clone(),
          confidence: hand.confidence,
          uncertainty: 0.01, // 1cm (camera accuracy)
          lastUpdate: hand.timestamp,
        });
      }
      return;
    }

    // Transform camera-relative to room-relative and fuse with Kalman
    for (const hand of hands) {
      // Transform hand position to room coordinates
      const roomPosition = this.transformCameraToRoom(hand.position);

      // Get or create Kalman filter and noise estimator for this hand
      let filter = this.filters.get(hand.id);
      let estimator = this.noiseEstimators.get(hand.id);

      if (!filter) {
        // Initialize filter with current position (zero velocity)
        const initialState: StateVector = [
          roomPosition.x,
          roomPosition.y,
          roomPosition.z,
          0,
          0,
          0,
        ];
        filter = new KalmanFilter(initialState, this.processNoise);
        estimator = new AdaptiveNoiseEstimator();
        this.filters.set(hand.id, filter);
        this.noiseEstimators.set(hand.id, estimator);
        console.log(`[Sensor Fusion] Created Kalman filter for ${hand.id} hand`);
      }

      // Kalman predict step (based on motion model)
      filter.predict();

      // ADAPTIVE NOISE ESTIMATION (Phase 4E)
      if (this.adaptiveFilteringEnabled && estimator) {
        // 1. Compute innovation (prediction error)
        const innovation = filter.getInnovation([
          roomPosition.x,
          roomPosition.y,
          roomPosition.z,
        ]);

        // 2. Update measurement noise estimate from innovation
        const covariance = filter.getPositionCovariance();
        estimator.updateMeasurementNoise(innovation, covariance);

        // 3. Update process noise estimate from motion
        const velocity = filter.getVelocity();
        estimator.updateProcessNoise(velocity, 0.033); // 30Hz ≈ 33ms

        // 4. Get adaptive noise estimates
        const noiseEst = estimator.getNoiseEstimate();

        // 5. Scale R based on WiFi signal quality (if available)
        let adaptiveR = noiseEst.measurement;
        if (this.cameraPose.signalQuality) {
          const scaling = this.rssiScaler.computeScaling(this.cameraPose.signalQuality);
          adaptiveR = adaptiveR * scaling;
        }

        // 6. Apply adaptive noise to filter (if confident enough)
        if (noiseEst.confidence > 0.3) {
          filter.setMeasurementNoise(adaptiveR);
          filter.setProcessNoise(noiseEst.process);
        }
      }

      // Kalman update step (with camera measurement)
      // If adaptive filtering disabled, uses default cameraNoiseStd
      filter.update(
        [roomPosition.x, roomPosition.y, roomPosition.z],
        this.cameraNoiseStd, // Fallback if adaptive disabled
        'camera'
      );

      // Store fused state
      const fusedPosition = filter.getPosition();
      const fusedVelocity = filter.getVelocity();
      const uncertainty = filter.getPositionUncertainty();

      this.fusedStates.set(hand.id, {
        id: hand.id,
        roomPosition: fusedPosition,
        roomVelocity: fusedVelocity,
        cameraPosition: hand.position.clone(),
        confidence: hand.confidence,
        uncertainty,
        lastUpdate: hand.timestamp,
      });
    }

    // Clean up filters for hands that are no longer tracked
    const activeHandIds = new Set(hands.map((h) => h.id));
    for (const [handId, _] of this.filters) {
      if (!activeHandIds.has(handId)) {
        this.filters.delete(handId);
        this.fusedStates.delete(handId);
        console.log(`[Sensor Fusion] Removed Kalman filter for ${handId} hand`);
      }
    }
  }

  /**
   * Get fused hand state for a specific hand
   */
  getHandState(handId: string): FusedHandState | null {
    return this.fusedStates.get(handId) || null;
  }

  /**
   * Get all fused hand states
   */
  getAllHandStates(): FusedHandState[] {
    return Array.from(this.fusedStates.values());
  }

  /**
   * Get current camera pose
   */
  getCameraPose(): CameraPose | null {
    return this.cameraPose;
  }

  /**
   * Check if sensor fusion is active (WiFi positioning available)
   */
  isActive(): boolean {
    return this.cameraPose !== null;
  }

  /**
   * Reset fusion state (clear filters and cached data)
   */
  reset(): void {
    this.filters.clear();
    this.fusedStates.clear();
    this.cameraPose = null;
    console.log('[Sensor Fusion] Reset complete');
  }

  /**
   * Transform camera-relative position to room-relative position
   * @param cameraPos - Position relative to camera
   * @returns Position in room coordinates
   */
  private transformCameraToRoom(cameraPos: THREE.Vector3): THREE.Vector3 {
    if (!this.cameraPose) {
      return cameraPos.clone();
    }

    // Apply camera orientation (rotation)
    const rotated = cameraPos.clone().applyQuaternion(this.cameraPose.orientation);

    // Translate by camera position
    return rotated.add(this.cameraPose.position);
  }

  /**
   * Transform room-relative position to camera-relative position
   * @param roomPos - Position in room coordinates
   * @returns Position relative to camera
   */
  transformRoomToCamera(roomPos: THREE.Vector3): THREE.Vector3 {
    if (!this.cameraPose) {
      return roomPos.clone();
    }

    // Translate by camera position (inverse)
    const translated = roomPos.clone().sub(this.cameraPose.position);

    // Apply inverse camera orientation
    const inverseOrientation = this.cameraPose.orientation.clone().invert();
    return translated.applyQuaternion(inverseOrientation);
  }

  /**
   * Get fusion statistics (for debugging)
   */
  getStats(): {
    activeFilters: number;
    cameraPoseAvailable: boolean;
    averageUncertainty: number;
    hands: Array<{
      id: string;
      roomPos: [number, number, number];
      uncertainty: number;
    }>;
  } {
    const hands = Array.from(this.fusedStates.values());
    const avgUncertainty =
      hands.length > 0
        ? hands.reduce((sum, h) => sum + h.uncertainty, 0) / hands.length
        : 0;

    return {
      activeFilters: this.filters.size,
      cameraPoseAvailable: this.cameraPose !== null,
      averageUncertainty: avgUncertainty,
      hands: hands.map((h) => ({
        id: h.id,
        roomPos: [h.roomPosition.x, h.roomPosition.y, h.roomPosition.z],
        uncertainty: h.uncertainty,
      })),
    };
  }
}

/**
 * Singleton sensor fusion service instance
 */
export const sensorFusion = new SensorFusionService();
