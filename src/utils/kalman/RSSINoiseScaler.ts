/**
 * WiFi signal quality metrics
 */
export interface WiFiSignalQuality {
  /** Average RSSI across all routers (dBm, typically -30 to -90) */
  avgRSSI: number;
  /** Minimum RSSI (weakest signal, dBm) */
  minRSSI: number;
  /** Number of routers used for triangulation */
  routerCount: number;
  /** Reported position accuracy (meters) */
  accuracy: number;
}

/**
 * RSSI-Based Noise Scaler for Adaptive Kalman Filtering
 *
 * Scales measurement noise (R) based on WiFi signal quality (RSSI).
 * Weaker signals result in higher R (trust measurement less),
 * stronger signals result in lower R (trust measurement more).
 *
 * RSSI Signal Quality Mapping:
 * - Excellent (-30 to -40 dBm): Very strong signal, high accuracy (±1m)
 * - Good     (-40 to -60 dBm): Strong signal, good accuracy (±2-3m)
 * - Fair     (-60 to -75 dBm): Moderate signal, fair accuracy (±3-5m)
 * - Poor     (-75 to -85 dBm): Weak signal, poor accuracy (±5-10m)
 * - Very Poor (< -85 dBm):     Very weak signal, very poor accuracy (±10m+)
 *
 * Additional factors:
 * - Router count: More routers → better triangulation → lower scaling
 * - Reported accuracy: Higher accuracy value → higher scaling (less trust)
 *
 * References:
 * - WiFi RSSI-based positioning accuracy studies
 * - Path loss models for indoor environments
 */
export class RSSINoiseScaler {
  // RSSI thresholds (dBm)
  private readonly EXCELLENT_RSSI = -40;
  private readonly GOOD_RSSI = -60;
  private readonly FAIR_RSSI = -75;
  private readonly POOR_RSSI = -85;

  // Scaling factors (multiply R by these values)
  // Lower scaling = trust more, higher scaling = trust less
  private readonly EXCELLENT_SCALE = 0.5; // Trust 2x more
  private readonly GOOD_SCALE = 1.0; // Default trust (baseline)
  private readonly FAIR_SCALE = 2.0; // Trust 2x less
  private readonly POOR_SCALE = 5.0; // Trust 5x less
  private readonly VERY_POOR_SCALE = 10.0; // Trust 10x less

  /**
   * Compute R scaling factor from WiFi signal quality
   *
   * Algorithm:
   * 1. Determine base scaling from RSSI (using weakest signal)
   * 2. Apply router count bonus (more routers → better triangulation)
   * 3. Apply accuracy penalty (reported inaccuracy → higher scaling)
   *
   * @param quality - WiFi signal quality metrics
   * @returns Scaling factor for R (multiply R by this value)
   */
  computeScaling(quality: WiFiSignalQuality): number {
    const { avgRSSI, minRSSI, routerCount, accuracy } = quality;

    // Use minimum RSSI (weakest link determines quality)
    // This is conservative: if one router has poor signal, treat whole measurement as less reliable
    const rssi = minRSSI;

    // Step 1: Compute base scaling from RSSI
    let baseScale: number;

    if (rssi >= this.EXCELLENT_RSSI) {
      // Excellent signal: trust measurement more than default
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
      // Very poor signal (below -85 dBm)
      // Exponential degradation for very weak signals
      const excessLoss = Math.abs(rssi) - 85; // How far below -85 dBm
      baseScale = this.VERY_POOR_SCALE * (1 + excessLoss / 10);
    }

    // Step 2: Router count bonus
    // More routers = better triangulation = lower scaling
    let routerBonus: number;
    if (routerCount >= 4) {
      routerBonus = 0.8; // 4+ routers: 20% improvement
    } else if (routerCount === 3) {
      routerBonus = 1.0; // 3 routers: baseline (ideal for trilateration)
    } else if (routerCount === 2) {
      routerBonus = 1.5; // 2 routers: 50% penalty (underdetermined)
    } else {
      routerBonus = 3.0; // 1 router: 3x penalty (single point, no triangulation)
    }

    // Step 3: Accuracy penalty
    // If WiFi reports high uncertainty, scale R up accordingly
    let accuracyPenalty: number;
    if (accuracy <= 2) {
      accuracyPenalty = 1.0; // Reported accuracy ≤ 2m: no penalty
    } else if (accuracy <= 3) {
      accuracyPenalty = 1.2; // 2-3m: small penalty
    } else if (accuracy <= 5) {
      accuracyPenalty = 1.5; // 3-5m: moderate penalty
    } else {
      accuracyPenalty = 2.0; // >5m: significant penalty
    }

    // Combine all factors
    const finalScaling = baseScale * routerBonus * accuracyPenalty;

    // Clamp to reasonable range (0.1x to 20x)
    return Math.max(0.1, Math.min(20, finalScaling));
  }

  /**
   * Get RSSI quality description (for debugging/UI)
   */
  getQualityDescription(rssi: number): string {
    if (rssi >= this.EXCELLENT_RSSI) {
      return 'Excellent';
    } else if (rssi >= this.GOOD_RSSI) {
      return 'Good';
    } else if (rssi >= this.FAIR_RSSI) {
      return 'Fair';
    } else if (rssi >= this.POOR_RSSI) {
      return 'Poor';
    } else {
      return 'Very Poor';
    }
  }

  /**
   * Estimate expected accuracy from RSSI (for reference)
   *
   * This is an empirical mapping based on typical indoor WiFi positioning.
   * Actual accuracy depends on environment, multipath, interference, etc.
   *
   * @param rssi - RSSI value (dBm)
   * @returns Estimated accuracy (meters)
   */
  estimateAccuracyFromRSSI(rssi: number): number {
    if (rssi >= this.EXCELLENT_RSSI) {
      return 1.0; // ±1m
    } else if (rssi >= this.GOOD_RSSI) {
      // Linear interpolation between 1m and 2.5m
      const t = (rssi - this.GOOD_RSSI) / (this.EXCELLENT_RSSI - this.GOOD_RSSI);
      return 2.5 + t * (1.0 - 2.5);
    } else if (rssi >= this.FAIR_RSSI) {
      // Linear interpolation between 2.5m and 5m
      const t = (rssi - this.FAIR_RSSI) / (this.GOOD_RSSI - this.FAIR_RSSI);
      return 5.0 + t * (2.5 - 5.0);
    } else if (rssi >= this.POOR_RSSI) {
      // Linear interpolation between 5m and 10m
      const t = (rssi - this.POOR_RSSI) / (this.FAIR_RSSI - this.POOR_RSSI);
      return 10.0 + t * (5.0 - 10.0);
    } else {
      // Very poor: 10m+ with degradation
      const excessLoss = Math.abs(rssi) - 85;
      return 10.0 + excessLoss * 0.5;
    }
  }
}
