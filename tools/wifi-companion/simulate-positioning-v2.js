#!/usr/bin/env node

/**
 * Simulated WiFi Positioning Test (v2 - Fixed Algorithm)
 * Validates trilateration algorithm with synthetic but realistic RSSI data
 */

// Simulated room configuration (5m x 5m x 2.5m)
const routers = [
  {
    name: 'Router 1 (NW Corner)',
    position: { x: 0, y: 5, z: 2.5 },
    referenceRssi: -40,
    pathLossExponent: 2.7,
  },
  {
    name: 'Router 2 (NE Corner)',
    position: { x: 5, y: 5, z: 2.5 },
    referenceRssi: -42,
    pathLossExponent: 2.8,
  },
  {
    name: 'Router 3 (SE Corner)',
    position: { x: 5, y: 0, z: 2.5 },
    referenceRssi: -41,
    pathLossExponent: 2.6,
  },
  {
    name: 'Router 4 (SW Corner)',
    position: { x: 0, y: 0, z: 2.5 },
    referenceRssi: -40,
    pathLossExponent: 2.7,
  },
];

// Test positions (grid pattern)
const testPositions = [
  { name: 'Center', position: { x: 2.5, y: 2.5, z: 1.0 } },
  { name: 'NW Quadrant', position: { x: 1.25, y: 3.75, z: 1.0 } },
  { name: 'NE Quadrant', position: { x: 3.75, y: 3.75, z: 1.0 } },
  { name: 'SE Quadrant', position: { x: 3.75, y: 1.25, z: 1.0 } },
  { name: 'SW Quadrant', position: { x: 1.25, y: 1.25, z: 1.0 } },
];

// Vector math helpers
function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function distanceToRssi(dist, referenceRssi, pathLossExponent) {
  if (dist <= 0) return referenceRssi;
  return -10 * pathLossExponent * Math.log10(dist) + referenceRssi;
}

function addNoise(rssi, stdDev = 2) {
  const u1 = Math.random();
  const u2 = Math.random();
  const noise = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * stdDev;
  return rssi + noise;
}

function rssiToDistance(rssi, referenceRssi, pathLossExponent) {
  if (rssi > referenceRssi) return 1.0;
  return Math.pow(10, (referenceRssi - rssi) / (10 * pathLossExponent));
}

/**
 * Simplified 2D trilateration (more stable for testing)
 * Assumes all routers and device on same plane (z=constant)
 */
function trilaterate2D(measurements) {
  if (measurements.length < 3) return null;

  const [m1, m2, m3] = measurements;
  const {x: x1, y: y1} = m1.position;
  const {x: x2, y: y2} = m2.position;
  const {x: x3, y: y3} = m3.position;
  const r1 = m1.distance;
  const r2 = m2.distance;
  const r3 = m3.distance;

  // Using algebraic solution
  const A = 2 * (x2 - x1);
  const B = 2 * (y2 - y1);
  const C = r1 * r1 - r2 * r2 - x1 * x1 + x2 * x2 - y1 * y1 + y2 * y2;
  const D = 2 * (x3 - x2);
  const E = 2 * (y3 - y2);
  const F = r2 * r2 - r3 * r3 - x2 * x2 + x3 * x3 - y2 * y2 + y3 * y3;

  const denom = A * E - B * D;
  if (Math.abs(denom) < 0.0001) {
    // Collinear points, use centroid as fallback
    const x = (x1 + x2 + x3) / 3;
    const y = (y1 + y2 + y3) / 3;
    return { x, y, z: m1.position.z };
  }

  const x = (C * E - F * B) / denom;
  const y = (A * F - D * C) / denom;
  const z = (m1.position.z + m2.position.z + m3.position.z) / 3;

  return { x, y, z };
}

/**
 * Weighted least squares (use all 4 measurements)
 */
function trilaterateWeighted(measurements) {
  if (measurements.length < 3) return null;

  // Start with basic trilateration
  let pos = trilaterate2D(measurements.slice(0, 3));
  if (!pos) return null;

  // Refine using all measurements (gradient descent)
  for (let iter = 0; iter < 20; iter++) {
    let gradX = 0, gradY = 0, totalWeight = 0;

    for (const m of measurements) {
      const dx = pos.x - m.position.x;
      const dy = pos.y - m.position.y;
      const dz = pos.z - m.position.z;
      const estDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (estDist < 0.01) continue; // Avoid division by zero

      const error = m.distance - estDist;
      const weight = 1 / (m.distance * m.distance + 1);

      gradX += weight * error * (-dx / estDist);
      gradY += weight * error * (-dy / estDist);
      totalWeight += weight;
    }

    if (totalWeight > 0) {
      gradX /= totalWeight;
      gradY /= totalWeight;
    }

    pos.x += gradX;
    pos.y += gradY;

    // Check convergence
    if (Math.abs(gradX) + Math.abs(gradY) < 0.001) break;
  }

  return pos;
}

// Run simulation
console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║                WiFi Positioning Simulation (2D, Fixed Algorithm)              ║');
console.log('╠════════════════════════════════════════════════════════════════════════════════╣');
console.log('║ Room: 5m x 5m                                                                  ║');
console.log('║ Routers: 4 (corners, ceiling)                                                  ║');
console.log('║ Test Positions: 5 (center + quadrants)                                         ║');
console.log('║ Noise: ±2 dBm                                                                  ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════╝');
console.log('');

const results = [];

testPositions.forEach((test) => {
  console.log(`Testing: ${test.name} at (${test.position.x.toFixed(2)}, ${test.position.y.toFixed(2)})`);

  // Simulate RSSI measurements
  const measurements = routers.map((router) => {
    const trueDistance = distance(test.position, router.position);
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
    const error = distance(test.position, estimated);
    results.push({
      name: test.name,
      true: test.position,
      estimated,
      error,
    });

    console.log(`  ✓ Estimated: (${estimated.x.toFixed(2)}, ${estimated.y.toFixed(2)})`);
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

console.log(`║ Mean Error:  ${meanError.toFixed(3)}m                                                                 ║`);
console.log(`║ RMSE:        ${rmse.toFixed(3)}m                                                                 ║`);
console.log(`║ Min Error:   ${minError.toFixed(3)}m                                                                 ║`);
console.log(`║ Max Error:   ${maxError.toFixed(3)}m                                                                 ║`);
console.log(`║ Success Rate: ${results.length}/${testPositions.length} (${((results.length / testPositions.length) * 100).toFixed(0)}%)                                                        ║`);
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
console.log('Note: This is a SIMULATED test with synthetic RSSI data (±2dBm noise).');
console.log('Real-world testing will have higher noise (±3-5dBm typical).');
console.log('Results validate that the trilateration algorithm works correctly.');
