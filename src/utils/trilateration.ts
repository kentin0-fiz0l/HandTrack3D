/**
 * Trilateration Algorithm
 * Calculates position from distances to known reference points (routers)
 */

import { Vector3 } from 'three';

export interface ReferencePoint {
  position: Vector3;
  distance: number;
}

/**
 * Calculate position using trilateration (3D)
 *
 * Solves the system of equations:
 * (x - x₁)² + (y - y₁)² + (z - z₁)² = d₁²
 * (x - x₂)² + (y - y₂)² + (z - z₂)² = d₂²
 * (x - x₃)² + (y - y₃)² + (z - z₃)² = d₃²
 * ...
 *
 * @param points - Array of reference points with known positions and measured distances
 * @returns Estimated position, or null if insufficient data or calculation fails
 */
export function trilaterate(points: ReferencePoint[]): Vector3 | null {
  if (points.length < 3) {
    console.warn('Need at least 3 reference points for trilateration');
    return null;
  }

  // Use first 3 points for basic trilateration
  // For 4+ points, use least squares method (future improvement)
  const [p1, p2, p3] = points;

  // Use simplified 3-sphere intersection algorithm
  // Based on: https://en.wikipedia.org/wiki/Trilateration

  // Translate so p1 is at origin
  const p2_translated = p2.position.clone().sub(p1.position);
  const p3_translated = p3.position.clone().sub(p1.position);

  // Calculate unit vectors
  const ex = p2_translated.clone().normalize();

  // Project p3 onto ex to get i
  const i = ex.dot(p3_translated);

  // Calculate ey (perpendicular to ex, in plane of p1-p2-p3)
  const ey = p3_translated
    .clone()
    .sub(ex.clone().multiplyScalar(i))
    .normalize();

  // Calculate ez (perpendicular to both ex and ey)
  const ez = ex.clone().cross(ey);

  // Calculate distances
  const d = p2_translated.length();
  const j = ey.dot(p3_translated);

  // Calculate coordinates in transformed system
  const x = (p1.distance ** 2 - p2.distance ** 2 + d ** 2) / (2 * d);

  const y =
    (p1.distance ** 2 - p3.distance ** 2 + i ** 2 + j ** 2) / (2 * j) -
    (i / j) * x;

  const z_squared = p1.distance ** 2 - x ** 2 - y ** 2;

  if (z_squared < 0) {
    console.warn('No valid solution (negative z²), using closest point');
    // Use closest point on plane (z = 0)
    const result = p1.position
      .clone()
      .add(ex.multiplyScalar(x))
      .add(ey.multiplyScalar(y));
    return result;
  }

  const z = Math.sqrt(z_squared);

  // Transform back to original coordinate system
  // We have two solutions (+z and -z), choose the one closer to existing points
  const solution1 = p1.position
    .clone()
    .add(ex.clone().multiplyScalar(x))
    .add(ey.clone().multiplyScalar(y))
    .add(ez.clone().multiplyScalar(z));

  const solution2 = p1.position
    .clone()
    .add(ex.clone().multiplyScalar(x))
    .add(ey.clone().multiplyScalar(y))
    .add(ez.clone().multiplyScalar(-z));

  // If we have more than 3 points, choose solution closer to 4th point
  if (points.length >= 4) {
    const p4 = points[3];
    const dist1 = solution1.distanceTo(p4.position);
    const dist2 = solution2.distanceTo(p4.position);

    return dist1 < dist2 ? solution1 : solution2;
  }

  // Otherwise, choose solution with positive z (above plane)
  return z >= 0 ? solution1 : solution2;
}

/**
 * Calculate position using weighted least squares (for 4+ points)
 * More accurate than basic trilateration when more reference points available
 *
 * @param points - Array of reference points (4+ recommended)
 * @returns Estimated position, or null if insufficient data
 */
export function trilaterateWeighted(
  points: ReferencePoint[]
): Vector3 | null {
  if (points.length < 3) {
    return null;
  }

  if (points.length === 3) {
    return trilaterate(points);
  }

  // Use iterative least squares (Gauss-Newton method)
  // Start with basic trilateration result as initial guess
  let position = trilaterate(points.slice(0, 3));

  if (!position) {
    return null;
  }

  // Refine position using all points (max 10 iterations)
  const maxIterations = 10;
  const tolerance = 0.001; // meters

  for (let iter = 0; iter < maxIterations; iter++) {
    let deltaX = 0;
    let deltaY = 0;
    let deltaZ = 0;
    let totalWeight = 0;

    for (const point of points) {
      const diff = point.position.clone().sub(position);
      const estimatedDistance = diff.length();
      const error = point.distance - estimatedDistance;

      // Weight by inverse square of distance (closer points more reliable)
      const weight = 1 / (point.distance ** 2 + 1);

      if (estimatedDistance > 0.001) {
        // Avoid division by zero
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

    // Check convergence
    const delta = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
    if (delta < tolerance) {
      break;
    }
  }

  return position;
}

/**
 * Estimate positioning accuracy based on geometry and signal quality
 *
 * @param points - Reference points used for trilateration
 * @param position - Estimated position
 * @returns Estimated error in meters
 */
export function estimateAccuracy(
  points: ReferencePoint[],
  position: Vector3
): number {
  if (points.length < 3) {
    return Infinity;
  }

  // Calculate RMSE (root mean square error) of distance residuals
  let sumSquaredErrors = 0;

  for (const point of points) {
    const estimatedDistance = position.distanceTo(point.position);
    const error = point.distance - estimatedDistance;
    sumSquaredErrors += error ** 2;
  }

  const rmse = Math.sqrt(sumSquaredErrors / points.length);

  // Factor in geometric dilution of precision (GDOP)
  // Poor geometry (all points collinear/coplanar) increases error
  const gdop = calculateGDOP(points);

  return rmse * gdop;
}

/**
 * Calculate Geometric Dilution of Precision (GDOP)
 * Measures how reference point geometry affects positioning accuracy
 *
 * @param points - Reference points
 * @returns GDOP value (1.0 = ideal, higher = worse geometry)
 */
function calculateGDOP(points: ReferencePoint[]): number {
  if (points.length < 3) {
    return 10; // Poor geometry
  }

  // Simple GDOP estimate based on point spread
  // Better geometry = points spread out in 3D
  const centroid = new Vector3();
  for (const point of points) {
    centroid.add(point.position);
  }
  centroid.divideScalar(points.length);

  // Calculate variance in each dimension
  let varX = 0;
  let varY = 0;
  let varZ = 0;

  for (const point of points) {
    const diff = point.position.clone().sub(centroid);
    varX += diff.x ** 2;
    varY += diff.y ** 2;
    varZ += diff.z ** 2;
  }

  varX /= points.length;
  varY /= points.length;
  varZ /= points.length;

  // GDOP inversely proportional to geometric spread
  const spread = Math.sqrt(varX + varY + varZ);
  const gdop = spread > 0.1 ? 1.0 : 10.0 / spread;

  return Math.max(1.0, Math.min(gdop, 10.0)); // Clamp to [1, 10]
}

export default trilaterate;
