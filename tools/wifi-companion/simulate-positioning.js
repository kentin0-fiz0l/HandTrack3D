#!/usr/bin/env node

/**
 * Simulated WiFi Positioning Test
 * Validates trilateration algorithm with synthetic but realistic RSSI data
 */

import { Vector3 } from 'three';

// Simulated room configuration (5m x 5m x 2.5m)
const routers = [
  {
    name: 'Router 1 (NW Corner)',
    position: new Vector3(0, 5, 2.5),
    referenceRssi: -40,
    pathLossExponent: 2.7,
  },
  {
    name: 'Router 2 (NE Corner)',
    position: new Vector3(5, 5, 2.5),
    referenceRssi: -42,
    pathLossExponent: 2.8,
  },
  {
    name: 'Router 3 (SE Corner)',
    position: new Vector3(5, 0, 2.5),
    referenceRssi: -41,
    pathLossExponent: 2.6,
  },
  {
    name: 'Router 4 (SW Corner)',
    position: new Vector3(0, 0, 2.5),
    referenceRssi: -40,
    pathLossExponent: 2.7,
  },
];

// Test positions (grid pattern)
const testPositions = [
  { name: 'Center', position: new Vector3(2.5, 2.5, 1.0) },
  { name: 'NW Quadrant', position: new Vector3(1.25, 3.75, 1.0) },
  { name: 'NE Quadrant', position: new Vector3(3.75, 3.75, 1.0) },
  { name: 'SE Quadrant', position: new Vector3(3.75, 1.25, 1.0) },
  { name: 'SW Quadrant', position: new Vector3(1.25, 1.25, 1.0) },
  { name: 'North Wall', position: new Vector3(2.5, 4.5, 1.0) },
  { name: 'East Wall', position: new Vector3(4.5, 2.5, 1.0) },
  { name: 'South Wall', position: new Vector3(2.5, 0.5, 1.0) },
  { name: 'West Wall', position: new Vector3(0.5, 2.5, 1.0) },
];

/**
 * Calculate RSSI from distance using path loss model
 */
function distanceToRssi(distance, referenceRssi, pathLossExponent) {
  if (distance <= 0) return referenceRssi;
  return -10 * pathLossExponent * Math.log10(distance) + referenceRssi;
}

/**
 * Add realistic noise to RSSI measurement (±3 dBm typical)
 */
function addNoise(rssi, stdDev = 3) {
  // Box-Muller transform for Gaussian noise
  const u1 = Math.random();
  const u2 = Math.random();
  const noise = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * stdDev;
  return rssi + noise;
}

/**
 * RSSI to distance conversion
 */
function rssiToDistance(rssi, referenceRssi, pathLossExponent) {
  if (rssi > referenceRssi) return 1.0;
  return Math.pow(10, (referenceRssi - rssi) / (10 * pathLossExponent));
}

/**
 * 3D Trilateration (basic 3-sphere intersection)
 */
function trilaterate(points) {
  if (points.length < 3) return null;

  const [p1, p2, p3] = points;

  // Translate so p1 is at origin
  const p2_translated = p2.position.clone().sub(p1.position);
  const p3_translated = p3.position.clone().sub(p1.position);

  // Calculate unit vectors
  const ex = p2_translated.clone().normalize();
  const i = ex.dot(p3_translated);
  const ey = p3_translated.clone().sub(ex.clone().multiplyScalar(i)).normalize();
  const ez = ex.clone().cross(ey);

  const d = p2_translated.length();
  const j = ey.dot(p3_translated);

  const x = (p1.distance ** 2 - p2.distance ** 2 + d ** 2) / (2 * d);
  const y = (p1.distance ** 2 - p3.distance ** 2 + i ** 2 + j ** 2) / (2 * j) - (i / j) * x;
  const z_squared = p1.distance ** 2 - x ** 2 - y ** 2;

  const z = z_squared >= 0 ? Math.sqrt(z_squared) : 0;

  // Transform back to original coordinate system
  const result = p1.position.clone()
    .add(ex.multiplyScalar(x))
    .add(ey.multiplyScalar(y))
    .add(ez.multiplyScalar(z >= 0 ? z : -z));

  return result;
}

/**
 * Weighted least squares trilateration (4+ points)
 */
function trilaterateWeighted(points) {
  if (points.length < 3) return null;
  if (points.length === 3) return trilaterate(points);

  // Start with basic trilateration
  let position = trilaterate(points.slice(0, 3));
  if (!position) return null;

  // Refine using all points (10 iterations)
  for (let iter = 0; iter < 10; iter++) {
    let deltaX = 0, deltaY = 0, deltaZ = 0, totalWeight = 0;

    for (const point of points) {
      const diff = point.position.clone().sub(position);
      const estimatedDistance = diff.length();
      const error = point.distance - estimatedDistance;
      const weight = 1 / (point.distance ** 2 + 1);

      if (estimatedDistance > 0.001) {
        const gradient = diff.divideScalar(estimatedDistance);
        deltaX += weight * error * gradient.x;
        deltaY += weight * error * gradient.y;
        deltaZ += weight * error * gradient.z;
        totalWeight += weight;
      }
    }

    if (totalWeight > 0) {
      deltaX /= totalWeight;
      deltaY /= totalWeight;
      deltaZ /= totalWeight;
    }

    position.x += deltaX;
    position.y += deltaY;
    position.z += deltaZ;

    const delta = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
    if (delta < 0.001) break;
  }

  return position;
}

/**
 * Run simulation
 */
console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║                    WiFi Positioning Simulation                                ║');
console.log('╠════════════════════════════════════════════════════════════════════════════════╣');
console.log('║ Room: 5m x 5m x 2.5m                                                           ║');
console.log('║ Routers: 4 (corners, ceiling-mounted)                                          ║');
console.log('║ Test Positions: 9 (grid pattern)                                               ║');
console.log('║ Noise: ±3 dBm (realistic RSSI variance)                                        ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════╝');
console.log('');

const results = [];

testPositions.forEach((test) => {
  console.log(`Testing: ${test.name} at (${test.position.x.toFixed(2)}, ${test.position.y.toFixed(2)}, ${test.position.z.toFixed(2)})`);

  // Simulate RSSI measurements
  const measurements = routers.map((router) => {
    const trueDistance = test.position.distanceTo(router.position);
    const trueRssi = distanceToRssi(trueDistance, router.referenceRssi, router.pathLossExponent);
    const noisyRssi = addNoise(trueRssi);
    const estimatedDistance = rssiToDistance(noisyRssi, router.referenceRssi, router.pathLossExponent);

    console.log(`  ${router.name}: d=${trueDistance.toFixed(2)}m, RSSI=${noisyRssi.toFixed(1)}dBm, d_est=${estimatedDistance.toFixed(2)}m`);

    return {
      position: router.position,
      distance: estimatedDistance,
    };
  });

  // Run trilateration
  const estimated = trilaterateWeighted(measurements);

  if (estimated) {
    const error = test.position.distanceTo(estimated);
    results.push({
      name: test.name,
      true: test.position,
      estimated,
      error,
    });

    console.log(`  ✓ Estimated: (${estimated.x.toFixed(2)}, ${estimated.y.toFixed(2)}, ${estimated.z.toFixed(2)})`);
    console.log(`  ✓ Error: ${error.toFixed(2)}m\n`);
  } else {
    console.log(`  ✗ Trilateration failed\n`);
  }
});

// Summary statistics
console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║                              Results Summary                                   ║');
console.log('╠════════════════════════════════════════════════════════════════════════════════╣');

const errors = results.map((r) => r.error);
const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;
const maxError = Math.max(...errors);
const minError = Math.min(...errors);
const rmse = Math.sqrt(errors.map((e) => e ** 2).reduce((a, b) => a + b, 0) / errors.length);

console.log(`║ Mean Error:  ${meanError.toFixed(3)}m${' '.repeat(65)}║`);
console.log(`║ RMSE:        ${rmse.toFixed(3)}m${' '.repeat(65)}║`);
console.log(`║ Min Error:   ${minError.toFixed(3)}m${' '.repeat(65)}║`);
console.log(`║ Max Error:   ${maxError.toFixed(3)}m${' '.repeat(65)}║`);
console.log(`║ Success Rate: ${results.length}/${testPositions.length} (${((results.length / testPositions.length) * 100).toFixed(0)}%)${' '.repeat(56)}║`);
console.log('╠════════════════════════════════════════════════════════════════════════════════╣');
console.log('║ Interpretation:                                                                ║');

if (rmse < 1.0) {
  console.log('║ ✓ Excellent accuracy (<1m) - Algorithm working very well                       ║');
} else if (rmse < 2.0) {
  console.log('║ ✓ Good accuracy (1-2m) - Suitable for room-scale positioning                  ║');
} else if (rmse < 5.0) {
  console.log('║ ⚠ Acceptable accuracy (2-5m) - May need calibration improvement               ║');
} else {
  console.log('║ ✗ Poor accuracy (>5m) - Check path loss parameters or add more routers        ║');
}

console.log('╚════════════════════════════════════════════════════════════════════════════════╝');
console.log('');
console.log('Note: This is a SIMULATED test with synthetic RSSI data.');
console.log('Real-world testing with actual WiFi hardware recommended for Phase 4B.');
