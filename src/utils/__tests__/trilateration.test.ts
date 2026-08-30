/**
 * Tests for Trilateration Algorithm
 */

import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import {
  trilaterate,
  trilaterateWeighted,
  estimateAccuracy,
  type ReferencePoint,
} from '../trilateration';

describe('trilaterate', () => {
  it('should return null with insufficient points', () => {
    const points: ReferencePoint[] = [
      { position: new Vector3(0, 0, 0), distance: 1 },
      { position: new Vector3(5, 0, 0), distance: 4 },
    ];

    const result = trilaterate(points);
    expect(result).toBeNull();
  });

  it('should calculate position with 3 points (2D case)', () => {
    // Device at (2, 2, 0)
    const points: ReferencePoint[] = [
      { position: new Vector3(0, 0, 0), distance: Math.sqrt(8) }, // ~2.83m
      { position: new Vector3(5, 0, 0), distance: Math.sqrt(13) }, // ~3.61m
      { position: new Vector3(0, 5, 0), distance: Math.sqrt(13) }, // ~3.61m
    ];

    const result = trilaterate(points);

    expect(result).not.toBeNull();
    if (result) {
      expect(result.x).toBeCloseTo(2, 1);
      expect(result.y).toBeCloseTo(2, 1);
      expect(result.z).toBeCloseTo(0, 1);
    }
  });

  it('should calculate position with 3 points (3D case)', () => {
    // Device at (1, 1, 1)
    const points: ReferencePoint[] = [
      { position: new Vector3(0, 0, 0), distance: Math.sqrt(3) }, // ~1.73m
      { position: new Vector3(3, 0, 0), distance: Math.sqrt(6) }, // ~2.45m
      { position: new Vector3(0, 3, 0), distance: Math.sqrt(6) }, // ~2.45m
    ];

    const result = trilaterate(points);

    expect(result).not.toBeNull();
    if (result) {
      expect(result.x).toBeCloseTo(1, 0);
      expect(result.y).toBeCloseTo(1, 0);
      // Z might be ±1, both are valid
      expect(Math.abs(result.z)).toBeCloseTo(1, 0);
    }
  });

  it('should handle perfect distances (no measurement error)', () => {
    const actualPosition = new Vector3(3, 4, 0);

    const points: ReferencePoint[] = [
      {
        position: new Vector3(0, 0, 0),
        distance: actualPosition.distanceTo(new Vector3(0, 0, 0)),
      },
      {
        position: new Vector3(6, 0, 0),
        distance: actualPosition.distanceTo(new Vector3(6, 0, 0)),
      },
      {
        position: new Vector3(0, 8, 0),
        distance: actualPosition.distanceTo(new Vector3(0, 8, 0)),
      },
    ];

    const result = trilaterate(points);

    expect(result).not.toBeNull();
    if (result) {
      expect(result.x).toBeCloseTo(actualPosition.x, 1);
      expect(result.y).toBeCloseTo(actualPosition.y, 1);
      expect(result.z).toBeCloseTo(actualPosition.z, 1);
    }
  });

  it('should handle noisy measurements gracefully', () => {
    // Actual position (2, 2, 0)
    const points: ReferencePoint[] = [
      { position: new Vector3(0, 0, 0), distance: 3.0 }, // True: 2.83, error: +0.17
      { position: new Vector3(5, 0, 0), distance: 3.5 }, // True: 3.61, error: -0.11
      { position: new Vector3(0, 5, 0), distance: 3.8 }, // True: 3.61, error: +0.19
    ];

    const result = trilaterate(points);

    expect(result).not.toBeNull();
    if (result) {
      // Should be close to (2, 2, 0) but not exact due to noise
      expect(result.x).toBeCloseTo(2, 0);
      expect(result.y).toBeCloseTo(2, 0);
    }
  });

  it('should choose correct solution when 4+ points available', () => {
    // Device at (2, 2, 2)
    const actualPos = new Vector3(2, 2, 2);

    const points: ReferencePoint[] = [
      {
        position: new Vector3(0, 0, 0),
        distance: actualPos.distanceTo(new Vector3(0, 0, 0)),
      },
      {
        position: new Vector3(5, 0, 0),
        distance: actualPos.distanceTo(new Vector3(5, 0, 0)),
      },
      {
        position: new Vector3(0, 5, 0),
        distance: actualPos.distanceTo(new Vector3(0, 5, 0)),
      },
      {
        position: new Vector3(0, 0, 5),
        distance: actualPos.distanceTo(new Vector3(0, 0, 5)),
      },
    ];

    const result = trilaterate(points);

    expect(result).not.toBeNull();
    if (result) {
      expect(result.x).toBeCloseTo(actualPos.x, 1);
      expect(result.y).toBeCloseTo(actualPos.y, 1);
      expect(result.z).toBeCloseTo(actualPos.z, 1);
    }
  });
});

describe('trilaterateWeighted', () => {
  it('should fallback to basic trilaterate with 3 points', () => {
    const points: ReferencePoint[] = [
      { position: new Vector3(0, 0, 0), distance: Math.sqrt(8) },
      { position: new Vector3(5, 0, 0), distance: Math.sqrt(13) },
      { position: new Vector3(0, 5, 0), distance: Math.sqrt(13) },
    ];

    const result1 = trilaterate(points);
    const result2 = trilaterateWeighted(points);

    expect(result1).not.toBeNull();
    expect(result2).not.toBeNull();

    if (result1 && result2) {
      expect(result2.x).toBeCloseTo(result1.x, 1);
      expect(result2.y).toBeCloseTo(result1.y, 1);
      expect(result2.z).toBeCloseTo(result1.z, 1);
    }
  });

  it('should improve accuracy with 4+ points', () => {
    const actualPos = new Vector3(3, 3, 1);

    // Add some measurement noise
    const points: ReferencePoint[] = [
      {
        position: new Vector3(0, 0, 0),
        distance: actualPos.distanceTo(new Vector3(0, 0, 0)) + 0.2,
      },
      {
        position: new Vector3(6, 0, 0),
        distance: actualPos.distanceTo(new Vector3(6, 0, 0)) - 0.1,
      },
      {
        position: new Vector3(0, 6, 0),
        distance: actualPos.distanceTo(new Vector3(0, 6, 0)) + 0.15,
      },
      {
        position: new Vector3(6, 6, 0),
        distance: actualPos.distanceTo(new Vector3(6, 6, 0)) - 0.05,
      },
    ];

    const result = trilaterateWeighted(points);

    expect(result).not.toBeNull();
    if (result) {
      // Should be close to actual position despite noise
      const error = result.distanceTo(actualPos);
      expect(error).toBeLessThan(0.5); // Within 50cm despite 20cm noise
    }
  });

  it('should converge within tolerance', () => {
    const actualPos = new Vector3(2.5, 2.5, 1.5);

    const points: ReferencePoint[] = [
      {
        position: new Vector3(0, 0, 0),
        distance: actualPos.distanceTo(new Vector3(0, 0, 0)),
      },
      {
        position: new Vector3(5, 0, 0),
        distance: actualPos.distanceTo(new Vector3(5, 0, 0)),
      },
      {
        position: new Vector3(0, 5, 0),
        distance: actualPos.distanceTo(new Vector3(0, 5, 0)),
      },
      {
        position: new Vector3(5, 5, 0),
        distance: actualPos.distanceTo(new Vector3(5, 5, 0)),
      },
    ];

    const result = trilaterateWeighted(points);

    expect(result).not.toBeNull();
    if (result) {
      const error = result.distanceTo(actualPos);
      expect(error).toBeLessThan(0.01); // Converged to <1cm
    }
  });
});

describe('estimateAccuracy', () => {
  it('should return Infinity with insufficient points', () => {
    const points: ReferencePoint[] = [
      { position: new Vector3(0, 0, 0), distance: 1 },
    ];
    const position = new Vector3(1, 0, 0);

    const accuracy = estimateAccuracy(points, position);
    expect(accuracy).toBe(Infinity);
  });

  it('should return low error for perfect trilateration', () => {
    const actualPos = new Vector3(2, 2, 0);

    const points: ReferencePoint[] = [
      {
        position: new Vector3(0, 0, 0),
        distance: actualPos.distanceTo(new Vector3(0, 0, 0)),
      },
      {
        position: new Vector3(5, 0, 0),
        distance: actualPos.distanceTo(new Vector3(5, 0, 0)),
      },
      {
        position: new Vector3(0, 5, 0),
        distance: actualPos.distanceTo(new Vector3(0, 5, 0)),
      },
    ];

    const accuracy = estimateAccuracy(points, actualPos);

    expect(accuracy).toBeLessThan(0.1); // Very accurate
  });

  it('should return higher error for poor geometry (collinear points)', () => {
    const position = new Vector3(2, 0, 0);

    // All points on x-axis (poor geometry)
    const collinearPoints: ReferencePoint[] = [
      { position: new Vector3(0, 0, 0), distance: 2 },
      { position: new Vector3(5, 0, 0), distance: 3 },
      { position: new Vector3(10, 0, 0), distance: 8 },
    ];

    // Good geometry (spread in 2D)
    const goodPoints: ReferencePoint[] = [
      { position: new Vector3(0, 0, 0), distance: 2 },
      { position: new Vector3(5, 0, 0), distance: 3 },
      { position: new Vector3(0, 5, 0), distance: Math.sqrt(29) },
    ];

    const poorAccuracy = estimateAccuracy(collinearPoints, position);
    const goodAccuracy = estimateAccuracy(goodPoints, position);

    // Poor geometry should have higher error estimate
    expect(poorAccuracy).toBeGreaterThan(goodAccuracy);
  });

  it('should increase error estimate with measurement noise', () => {
    const actualPos = new Vector3(3, 3, 0);

    const perfectPoints: ReferencePoint[] = [
      {
        position: new Vector3(0, 0, 0),
        distance: actualPos.distanceTo(new Vector3(0, 0, 0)),
      },
      {
        position: new Vector3(6, 0, 0),
        distance: actualPos.distanceTo(new Vector3(6, 0, 0)),
      },
      {
        position: new Vector3(0, 6, 0),
        distance: actualPos.distanceTo(new Vector3(0, 6, 0)),
      },
    ];

    const noisyPoints: ReferencePoint[] = [
      {
        position: new Vector3(0, 0, 0),
        distance: actualPos.distanceTo(new Vector3(0, 0, 0)) + 0.5,
      },
      {
        position: new Vector3(6, 0, 0),
        distance: actualPos.distanceTo(new Vector3(6, 0, 0)) - 0.3,
      },
      {
        position: new Vector3(0, 6, 0),
        distance: actualPos.distanceTo(new Vector3(0, 6, 0)) + 0.4,
      },
    ];

    const perfectAccuracy = estimateAccuracy(perfectPoints, actualPos);
    const noisyAccuracy = estimateAccuracy(noisyPoints, actualPos);

    expect(noisyAccuracy).toBeGreaterThan(perfectAccuracy);
  });
});
