/**
 * Tests for RSSI to Distance Conversion
 */

import { describe, it, expect } from 'vitest';
import {
  rssiToDistance,
  distanceToRssi,
  calibratePathLoss,
} from '../rssiToDistance';

describe('rssiToDistance', () => {
  it('should return 1 meter at reference RSSI', () => {
    const distance = rssiToDistance(-40, -40, 2.5);
    expect(distance).toBeCloseTo(1.0, 2);
  });

  it('should return increasing distance as RSSI decreases', () => {
    const d1 = rssiToDistance(-40, -40, 2.5);
    const d2 = rssiToDistance(-50, -40, 2.5);
    const d3 = rssiToDistance(-60, -40, 2.5);

    expect(d2).toBeGreaterThan(d1);
    expect(d3).toBeGreaterThan(d2);
  });

  it('should handle free space path loss (n=2.0)', () => {
    const distance = rssiToDistance(-50, -40, 2.0);
    expect(distance).toBeCloseTo(3.16, 1); // 10^((40-50)/(10*2)) ≈ 3.16
  });

  it('should handle indoor path loss (n=3.0)', () => {
    const distance = rssiToDistance(-60, -40, 3.0);
    expect(distance).toBeCloseTo(4.64, 1); // 10^((40-60)/(10*3)) ≈ 4.64
  });

  it('should return 1.0 for RSSI stronger than reference', () => {
    const distance = rssiToDistance(-30, -40, 2.5);
    expect(distance).toBe(1.0);
  });

  it('should warn on positive RSSI and return 0', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const distance = rssiToDistance(20, -40, 2.5);

    expect(distance).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith(
      'RSSI should be negative (dBm). Got:',
      20
    );

    consoleSpy.mockRestore();
  });
});

describe('distanceToRssi', () => {
  it('should return reference RSSI at 1 meter', () => {
    const rssi = distanceToRssi(1.0, -40, 2.5);
    expect(rssi).toBeCloseTo(-40, 2);
  });

  it('should return decreasing RSSI as distance increases', () => {
    const r1 = distanceToRssi(1.0, -40, 2.5);
    const r2 = distanceToRssi(2.0, -40, 2.5);
    const r3 = distanceToRssi(5.0, -40, 2.5);

    expect(r2).toBeLessThan(r1);
    expect(r3).toBeLessThan(r2);
  });

  it('should be inverse of rssiToDistance', () => {
    const originalRssi = -55;
    const distance = rssiToDistance(originalRssi, -40, 2.5);
    const calculatedRssi = distanceToRssi(distance, -40, 2.5);

    expect(calculatedRssi).toBeCloseTo(originalRssi, 1);
  });

  it('should handle zero distance by returning reference RSSI', () => {
    const rssi = distanceToRssi(0, -40, 2.5);
    expect(rssi).toBe(-40);
  });

  it('should warn on negative distance', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const rssi = distanceToRssi(-5, -40, 2.5);

    expect(rssi).toBe(-40);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe('calibratePathLoss', () => {
  it('should throw error with insufficient measurements', () => {
    expect(() => calibratePathLoss([{ distance: 1, rssi: -40 }])).toThrow(
      'Need at least 2 measurements for calibration'
    );
  });

  it('should calibrate from perfect free-space data (n=2.0)', () => {
    const measurements = [
      { distance: 1, rssi: -40 },
      { distance: 10, rssi: -60 }, // -40 - 20 = -60 (20dB loss over 10x distance)
    ];

    const { referenceRssi, pathLossExponent } = calibratePathLoss(measurements);

    expect(referenceRssi).toBeCloseTo(-40, 1);
    expect(pathLossExponent).toBeCloseTo(2.0, 1);
  });

  it('should calibrate from indoor environment data (n≈2.5)', () => {
    const measurements = [
      { distance: 1, rssi: -42 },
      { distance: 2, rssi: -50 },
      { distance: 3, rssi: -55 },
      { distance: 5, rssi: -62 },
    ];

    const { referenceRssi, pathLossExponent } = calibratePathLoss(measurements);

    // Should be close to indoor values
    expect(referenceRssi).toBeGreaterThan(-50);
    expect(referenceRssi).toBeLessThan(-35);
    expect(pathLossExponent).toBeGreaterThan(2.0);
    expect(pathLossExponent).toBeLessThan(4.0);
  });

  it('should handle real-world noisy measurements', () => {
    const measurements = [
      { distance: 1, rssi: -41 },
      { distance: 2, rssi: -48 },
      { distance: 3, rssi: -54 },
      { distance: 4, rssi: -59 },
      { distance: 5, rssi: -63 },
    ];

    const { referenceRssi, pathLossExponent } = calibratePathLoss(measurements);

    // Should produce reasonable values
    expect(referenceRssi).toBeGreaterThan(-50);
    expect(referenceRssi).toBeLessThan(-30);
    expect(pathLossExponent).toBeGreaterThan(1.5);
    expect(pathLossExponent).toBeLessThan(4.5);
  });

  it('should round results to reasonable precision', () => {
    const measurements = [
      { distance: 1, rssi: -40 },
      { distance: 10, rssi: -60 },
    ];

    const { referenceRssi, pathLossExponent } = calibratePathLoss(measurements);

    // Check rounding (referenceRssi to 0.1, pathLossExponent to 0.01)
    expect(referenceRssi).toBe(Math.round(referenceRssi * 10) / 10);
    expect(pathLossExponent).toBe(
      Math.round(pathLossExponent * 100) / 100
    );
  });
});
