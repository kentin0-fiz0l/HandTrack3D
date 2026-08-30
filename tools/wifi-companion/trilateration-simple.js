#!/usr/bin/env node

/**
 * Simple and Robust Trilateration
 * Using centroid + weighted refinement approach
 */

function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Simple trilateration using weighted centroid approach
 * More stable than algebraic methods for noisy data
 */
function trilaterate(measurements) {
  if (measurements.length < 3) return null;

  // Start with weighted centroid
  let sumX = 0, sumY = 0, sumZ = 0, sumWeights = 0;

  for (const m of measurements) {
    // Weight inversely proportional to distance (closer = more weight)
    const weight = 1 / (m.distance * m.distance + 0.1);
    sumX += m.position.x * weight;
    sumY += m.position.y * weight;
    sumZ += (m.position.z || 0) * weight;
    sumWeights += weight;
  }

  let pos = {
    x: sumX / sumWeights,
    y: sumY / sumWeights,
    z: sumZ / sumWeights,
  };

  // Refine using gradient descent (minimize sum of squared errors)
  const learningRate = 0.5;
  for (let iter = 0; iter < 100; iter++) {
    let gradX = 0, gradY = 0, gradZ = 0;

    for (const m of measurements) {
      const dx = pos.x - m.position.x;
      const dy = pos.y - m.position.y;
      const dz = pos.z - (m.position.z || 0);
      const estDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (estDist < 0.001) continue;

      // Gradient of squared error: 2 * (estDist - measuredDist) * (dx/estDist)
      const error = estDist - m.distance;
      gradX += error * (dx / estDist);
      gradY += error * (dy / estDist);
      gradZ += error * (dz / estDist);
    }

    // Update position
    pos.x -= learningRate * gradX / measurements.length;
    pos.y -= learningRate * gradY / measurements.length;
    pos.z -= learningRate * gradZ / measurements.length;

    // Check convergence
    const gradMag = Math.sqrt(gradX * gradX + gradY * gradY + gradZ * gradZ);
    if (gradMag < 0.01) break;
  }

  return pos;
}

// Test with simple case
console.log('Test 1: Perfect measurements (no noise)');
const test1 = [
  { position: { x: 0, y: 0, z: 0 }, distance: 5 },
  { position: { x: 10, y: 0, z: 0 }, distance: 5 },
  { position: { x: 5, y: 10, z: 0 }, distance: Math.sqrt(50) }, // ~7.07
];
const result1 = trilaterate(test1);
console.log('Expected: (5, 0, 0)');
console.log('Got:', result1);
console.log('Error:', distance(result1, { x: 5, y: 0, z: 0 }).toFixed(3), 'm\n');

console.log('Test 2: Square room, device in center');
const test2 = [
  { position: { x: 0, y: 0, z: 2.5 }, distance: Math.sqrt(2.5 * 2.5 + 2.5 * 2.5 + 1.5 * 1.5) },
  { position: { x: 5, y: 0, z: 2.5 }, distance: Math.sqrt(2.5 * 2.5 + 2.5 * 2.5 + 1.5 * 1.5) },
  { position: { x: 5, y: 5, z: 2.5 }, distance: Math.sqrt(2.5 * 2.5 + 2.5 * 2.5 + 1.5 * 1.5) },
  { position: { x: 0, y: 5, z: 2.5 }, distance: Math.sqrt(2.5 * 2.5 + 2.5 * 2.5 + 1.5 * 1.5) },
];
const result2 = trilaterate(test2);
console.log('Expected: (2.5, 2.5, 1.0)');
console.log('Got:', result2);
console.log('Error:', distance(result2, { x: 2.5, y: 2.5, z: 1.0 }).toFixed(3), 'm\n');

console.log('Test 3: With measurement noise');
const addNoise = (val, stdDev) => val + (Math.random() - 0.5) * 2 * stdDev;
const test3 = [
  { position: { x: 0, y: 0, z: 0 }, distance: addNoise(5, 0.5) },
  { position: { x: 10, y: 0, z: 0 }, distance: addNoise(5, 0.5) },
  { position: { x: 5, y: 10, z: 0 }, distance: addNoise(Math.sqrt(50), 0.5) },
];
const result3 = trilaterate(test3);
console.log('Expected: ~(5, 0, 0)');
console.log('Got:', result3);
console.log('Error:', distance(result3, { x: 5, y: 0, z: 0 }).toFixed(3), 'm');
