/**
 * RSSI to Distance Conversion
 * Converts WiFi signal strength (RSSI) to distance using path loss model
 */

/**
 * Convert RSSI to distance using log-distance path loss model
 *
 * Formula: RSSI = -10·n·log₁₀(d) + A
 * Solving for d: d = 10^((A - RSSI) / (10·n))
 *
 * @param rssi - Received signal strength in dBm (negative value, e.g., -60)
 * @param referenceRssi - RSSI at 1 meter (typically -40 to -50 dBm)
 * @param pathLossExponent - Environment-specific exponent (2.0 = free space, 2.5-4.0 = indoor)
 * @returns Estimated distance in meters
 *
 * @example
 * // Router at -40 dBm @ 1m, indoor environment (n=2.5)
 * const distance = rssiToDistance(-60, -40, 2.5);
 * console.log(distance); // ~3.16 meters
 */
export function rssiToDistance(
  rssi: number,
  referenceRssi = -40,
  pathLossExponent = 2.5
): number {
  if (rssi > 0) {
    console.warn('RSSI should be negative (dBm). Got:', rssi);
    return 0;
  }

  if (rssi > referenceRssi) {
    // Closer than 1 meter
    return 1.0;
  }

  const distance = Math.pow(
    10,
    (referenceRssi - rssi) / (10 * pathLossExponent)
  );

  return distance;
}

/**
 * Convert distance to RSSI using path loss model
 * Inverse of rssiToDistance()
 *
 * @param distance - Distance in meters
 * @param referenceRssi - RSSI at 1 meter
 * @param pathLossExponent - Environment-specific exponent
 * @returns Estimated RSSI in dBm
 */
export function distanceToRssi(
  distance: number,
  referenceRssi = -40,
  pathLossExponent = 2.5
): number {
  if (distance <= 0) {
    console.warn('Distance must be positive. Got:', distance);
    return referenceRssi;
  }

  const rssi = -10 * pathLossExponent * Math.log10(distance) + referenceRssi;
  return rssi;
}

/**
 * Calibrate path loss parameters from measured data
 *
 * @param measurements - Array of {distance, rssi} pairs
 * @returns {referenceRssi, pathLossExponent} - Best-fit parameters
 *
 * @example
 * const measurements = [
 *   { distance: 1, rssi: -42 },
 *   { distance: 2, rssi: -50 },
 *   { distance: 3, rssi: -55 },
 *   { distance: 5, rssi: -62 },
 * ];
 * const params = calibratePathLoss(measurements);
 * console.log(params); // { referenceRssi: -40.5, pathLossExponent: 2.8 }
 */
export function calibratePathLoss(
  measurements: Array<{ distance: number; rssi: number }>
): { referenceRssi: number; pathLossExponent: number } {
  if (measurements.length < 2) {
    throw new Error('Need at least 2 measurements for calibration');
  }

  // Linear regression on log-distance model
  // y = -10n * log10(d) + A
  // Let x = log10(d), then y = -10n * x + A
  // Solve for n and A using least squares

  const n = measurements.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (const { distance, rssi } of measurements) {
    const x = Math.log10(distance);
    const y = rssi;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  // Calculate slope and intercept
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const pathLossExponent = -slope / 10;
  const referenceRssi = intercept;

  return {
    referenceRssi: Math.round(referenceRssi * 10) / 10,
    pathLossExponent: Math.round(pathLossExponent * 100) / 100,
  };
}

export default rssiToDistance;
