import * as THREE from 'three';

/**
 * Noise estimate with confidence metrics
 */
export interface NoiseEstimate {
  /** Estimated measurement noise (R) in meters */
  measurement: number;
  /** Estimated process noise (Q) in meters */
  process: number;
  /** Estimate confidence (0-1, based on sample count) */
  confidence: number;
  /** Number of samples used in estimate */
  sampleCount: number;
}

/**
 * Adaptive Noise Estimator for Kalman Filter
 *
 * Estimates measurement noise (R) and process noise (Q) online based on:
 * - Innovation sequence (prediction error) → R estimate
 * - Motion characteristics (acceleration) → Q estimate
 *
 * Uses exponential moving average for smooth, responsive estimates.
 *
 * Algorithm:
 * 1. R Estimation: Compute sample covariance of innovation sequence
 * 2. Q Estimation: Scale base Q by observed acceleration magnitude
 * 3. Smoothing: Apply EMA to prevent noise estimate from jumping
 *
 * References:
 * - Mehra, R. K. (1970). "On the identification of variances and adaptive Kalman filtering"
 * - Mohamed, A. H., & Schwarz, K. P. (1999). "Adaptive Kalman filtering for INS/GPS"
 */
export class AdaptiveNoiseEstimator {
  // Innovation history (prediction errors)
  private readonly innovationHistory: number[] = [];

  // Acceleration history (motion characteristics)
  private readonly accelerationHistory: number[] = [];

  // Previous velocity (for acceleration computation)
  private previousVelocity: THREE.Vector3 | null = null;

  // Window size (number of samples to keep)
  private readonly windowSize = 30; // 1 second at 30Hz

  // Base noise values (fallback when no data)
  private readonly baseR = 0.01; // 1cm (camera measurement noise)
  private readonly baseQ = 0.05; // 5cm (process noise)

  // EMA smoothing factor (higher = smoother, lower = more responsive)
  // 0.8 means: 80% old value, 20% new value
  private readonly alpha = 0.8;

  // Acceleration scaling factor (Q sensitivity to motion)
  private readonly accelerationScale = 10;

  // Current estimates (smoothed via EMA)
  private currentR: number = this.baseR;
  private currentQ: number = this.baseQ;

  /**
   * Update measurement noise estimate from innovation (prediction error)
   *
   * Innovation-based R estimation:
   * - Innovation = measured_position - predicted_position
   * - If Kalman filter is tuned correctly, innovation should be white noise
   * - Sample covariance of innovation ≈ H*P*H^T + R
   * - Therefore: R ≈ Cov(innovation) - H*P*H^T
   *
   * @param innovation - Prediction error (measured - predicted)
   * @param covarianceP - Current position uncertainty (3x3 matrix)
   */
  updateMeasurementNoise(innovation: THREE.Vector3, covarianceP: number[][]): void {
    // Compute innovation magnitude (scalar error)
    const innovationMag = innovation.length();

    // Add to sliding window
    this.innovationHistory.push(innovationMag);
    if (this.innovationHistory.length > this.windowSize) {
      this.innovationHistory.shift(); // Remove oldest
    }

    // Need at least 5 samples for reasonable estimate
    if (this.innovationHistory.length < 5) {
      return; // Not enough data yet
    }

    // Compute sample mean
    const mean =
      this.innovationHistory.reduce((sum, val) => sum + val, 0) /
      this.innovationHistory.length;

    // Compute sample variance (unbiased estimator)
    const variance =
      this.innovationHistory
        .map((x) => Math.pow(x - mean, 2))
        .reduce((sum, val) => sum + val, 0) /
      (this.innovationHistory.length - 1);

    // Subtract predicted uncertainty (H*P*H^T)
    // For position-only measurement: H = [I_3x3, 0_3x3], so H*P*H^T = P_pos
    const predictedVariance = (covarianceP[0][0] + covarianceP[1][1] + covarianceP[2][2]) / 3;

    // Estimate R (ensure positive, minimum 1mm)
    const estimatedR = Math.max(0.001, Math.sqrt(Math.max(0, variance - predictedVariance)));

    // Apply exponential moving average (smooth estimate)
    this.currentR = this.alpha * this.currentR + (1 - this.alpha) * estimatedR;

    // Clamp to reasonable range (1mm to 10m)
    this.currentR = Math.max(0.001, Math.min(10, this.currentR));
  }

  /**
   * Update process noise estimate from motion characteristics
   *
   * Motion-based Q estimation:
   * - High acceleration → high process noise (hand changing direction)
   * - Low acceleration → low process noise (hand moving smoothly)
   *
   * Q_adaptive = Q_base * (1 + k * |acceleration|)
   *
   * where k is a scaling factor that controls sensitivity
   *
   * @param velocity - Current velocity (m/s)
   * @param dt - Time step (seconds)
   */
  updateProcessNoise(velocity: THREE.Vector3, dt: number): void {
    // Need previous velocity to compute acceleration
    if (!this.previousVelocity) {
      this.previousVelocity = velocity.clone();
      return;
    }

    // Compute acceleration: a = (v_current - v_previous) / dt
    const acceleration = velocity.clone().sub(this.previousVelocity).divideScalar(dt);
    const accelMag = acceleration.length();

    // Update previous velocity
    this.previousVelocity = velocity.clone();

    // Add to sliding window
    this.accelerationHistory.push(accelMag);
    if (this.accelerationHistory.length > this.windowSize) {
      this.accelerationHistory.shift(); // Remove oldest
    }

    // Need at least 5 samples
    if (this.accelerationHistory.length < 5) {
      return;
    }

    // Compute average acceleration over window
    const avgAccel =
      this.accelerationHistory.reduce((sum, val) => sum + val, 0) /
      this.accelerationHistory.length;

    // Scale Q based on acceleration (more motion → more uncertainty)
    // Q = Q_base * (1 + k * acceleration)
    const estimatedQ = this.baseQ * (1 + this.accelerationScale * avgAccel);

    // Apply exponential moving average
    this.currentQ = this.alpha * this.currentQ + (1 - this.alpha) * estimatedQ;

    // Clamp to reasonable range (1mm to 1m)
    this.currentQ = Math.max(0.001, Math.min(1, this.currentQ));
  }

  /**
   * Get current noise estimates with confidence metrics
   *
   * Confidence is based on sample count:
   * - 0-5 samples: 0% confidence (not enough data)
   * - 5-30 samples: Linear interpolation (building confidence)
   * - 30+ samples: 100% confidence (full window)
   */
  getNoiseEstimate(): NoiseEstimate {
    const sampleCount = Math.min(this.innovationHistory.length, this.accelerationHistory.length);

    // Confidence ramps up as we collect samples
    let confidence = 0;
    if (sampleCount >= this.windowSize) {
      confidence = 1.0; // Full confidence
    } else if (sampleCount >= 5) {
      // Linear ramp from 5 to windowSize
      confidence = (sampleCount - 5) / (this.windowSize - 5);
    }

    return {
      measurement: this.currentR,
      process: this.currentQ,
      confidence,
      sampleCount,
    };
  }

  /**
   * Reset estimator (clear all history)
   *
   * Call this when:
   * - Tracking is lost
   * - User manually recalibrates
   * - WiFi positioning changes significantly
   */
  reset(): void {
    this.innovationHistory.length = 0;
    this.accelerationHistory.length = 0;
    this.previousVelocity = null;
    this.currentR = this.baseR;
    this.currentQ = this.baseQ;
    console.log('[Adaptive Noise] Reset to base values');
  }

  /**
   * Get base noise values (for comparison)
   */
  getBaseNoiseValues(): { R: number; Q: number } {
    return {
      R: this.baseR,
      Q: this.baseQ,
    };
  }
}
