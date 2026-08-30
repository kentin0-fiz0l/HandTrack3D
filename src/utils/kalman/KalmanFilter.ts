import * as THREE from 'three';

/**
 * State vector for 3D position tracking
 * [x, y, z, vx, vy, vz] - position and velocity in 3D space
 */
export type StateVector = [number, number, number, number, number, number];

/**
 * Kalman Filter for sensor fusion
 *
 * Fuses high-frequency, high-accuracy measurements (camera tracking)
 * with low-frequency, low-accuracy measurements (WiFi positioning)
 *
 * State: [x, y, z, vx, vy, vz]
 * - Position (x, y, z) in room coordinates (meters)
 * - Velocity (vx, vy, vz) in m/s
 */
export class KalmanFilter {
  // State vector (6x1): [x, y, z, vx, vy, vz]
  private state: StateVector;

  // Error covariance matrix (6x6)
  private P: number[][];

  // Process noise covariance (6x6)
  private Q: number[][];

  // Time of last update (for dt calculation)
  private lastUpdateTime: number;

  /**
   * Create a new Kalman filter
   * @param initialState - Initial state [x, y, z, vx, vy, vz]
   * @param processNoise - Process noise standard deviation (default: 0.1)
   */
  constructor(
    initialState: StateVector = [0, 0, 0, 0, 0, 0],
    processNoise: number = 0.1
  ) {
    this.state = [...initialState];
    this.lastUpdateTime = Date.now() / 1000; // Convert to seconds

    // Initialize error covariance (high initial uncertainty)
    this.P = this.createIdentityMatrix(6, 10.0);

    // Process noise covariance (position and velocity uncertainty)
    const q = processNoise * processNoise;
    this.Q = [
      [q, 0, 0, 0, 0, 0],
      [0, q, 0, 0, 0, 0],
      [0, 0, q, 0, 0, 0],
      [0, 0, 0, q * 0.1, 0, 0], // Lower noise for velocity
      [0, 0, 0, 0, q * 0.1, 0],
      [0, 0, 0, 0, 0, q * 0.1],
    ];
  }

  /**
   * Predict step: Update state based on motion model
   * Uses constant velocity model: x(t+1) = x(t) + v(t) * dt
   */
  predict(): void {
    const now = Date.now() / 1000;
    const dt = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    // Clamp dt to prevent instability
    const dtClamped = Math.min(dt, 0.1); // Max 100ms

    // State transition matrix F (constant velocity model)
    const F = this.createStateTransitionMatrix(dtClamped);

    // Predict state: x' = F * x
    this.state = this.matrixVectorMultiply(F, this.state);

    // Predict covariance: P' = F * P * F^T + Q
    const FP = this.matrixMultiply(F, this.P);
    const FPFt = this.matrixMultiply(FP, this.transpose(F));
    this.P = this.matrixAdd(FPFt, this.Q);
  }

  /**
   * Update step: Correct state with new measurement
   * @param measurement - Measured position [x, y, z]
   * @param measurementNoise - Measurement uncertainty (standard deviation in meters)
   * @param measurementType - 'camera' (high accuracy) or 'wifi' (low accuracy)
   */
  update(
    measurement: [number, number, number],
    measurementNoise: number,
    measurementType: 'camera' | 'wifi' = 'camera'
  ): void {
    // Measurement matrix H (extracts position from state)
    const H = [
      [1, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0],
    ];

    // Measurement noise covariance R (3x3)
    const r = measurementNoise * measurementNoise;
    const R = [
      [r, 0, 0],
      [0, r, 0],
      [0, 0, r],
    ];

    // Innovation: y = z - H * x
    const Hx = this.matrixVectorMultiply(H, this.state);
    const y = [
      measurement[0] - Hx[0],
      measurement[1] - Hx[1],
      measurement[2] - Hx[2],
    ];

    // Innovation covariance: S = H * P * H^T + R
    const HP = this.matrixMultiply(H, this.P);
    const HPHt = this.matrixMultiply(HP, this.transpose(H));
    const S = this.matrixAdd3x3(HPHt as number[][], R);

    // Kalman gain: K = P * H^T * S^-1
    const Ht = this.transpose(H);
    const PHt = this.matrixMultiply(this.P, Ht);
    const Sinv = this.invert3x3(S);
    const K = this.matrixMultiply(PHt, Sinv);

    // Update state: x' = x + K * y
    const Ky = this.matrixVectorMultiply(K as number[][], y);
    this.state = [
      this.state[0] + Ky[0],
      this.state[1] + Ky[1],
      this.state[2] + Ky[2],
      this.state[3] + Ky[3],
      this.state[4] + Ky[4],
      this.state[5] + Ky[5],
    ];

    // Update covariance: P' = (I - K * H) * P
    const KH = this.matrixMultiply(K as number[][], H);
    const I = this.createIdentityMatrix(6, 1.0);
    const IminusKH = this.matrixSubtract(I, KH as number[][]);
    this.P = this.matrixMultiply(IminusKH, this.P);
  }

  /**
   * Get current state estimate
   */
  getState(): StateVector {
    return [...this.state];
  }

  /**
   * Get current position estimate
   */
  getPosition(): THREE.Vector3 {
    return new THREE.Vector3(this.state[0], this.state[1], this.state[2]);
  }

  /**
   * Get current velocity estimate
   */
  getVelocity(): THREE.Vector3 {
    return new THREE.Vector3(this.state[3], this.state[4], this.state[5]);
  }

  /**
   * Get position uncertainty (standard deviation)
   */
  getPositionUncertainty(): number {
    // Average of position variances
    const variance = (this.P[0][0] + this.P[1][1] + this.P[2][2]) / 3;
    return Math.sqrt(variance);
  }

  /**
   * Reset filter with new state
   */
  reset(newState: StateVector): void {
    this.state = [...newState];
    this.P = this.createIdentityMatrix(6, 10.0);
    this.lastUpdateTime = Date.now() / 1000;
  }

  // Matrix operations

  private createStateTransitionMatrix(dt: number): number[][] {
    return [
      [1, 0, 0, dt, 0, 0],
      [0, 1, 0, 0, dt, 0],
      [0, 0, 1, 0, 0, dt],
      [0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 1],
    ];
  }

  private createIdentityMatrix(size: number, scale: number): number[][] {
    const matrix: number[][] = [];
    for (let i = 0; i < size; i++) {
      matrix[i] = [];
      for (let j = 0; j < size; j++) {
        matrix[i][j] = i === j ? scale : 0;
      }
    }
    return matrix;
  }

  private matrixMultiply(A: number[][], B: number[][]): number[][] {
    const rowsA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;
    const result: number[][] = [];

    for (let i = 0; i < rowsA; i++) {
      result[i] = [];
      for (let j = 0; j < colsB; j++) {
        let sum = 0;
        for (let k = 0; k < colsA; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  private matrixVectorMultiply(A: number[][], v: number[]): number[] {
    const result: number[] = [];
    for (let i = 0; i < A.length; i++) {
      let sum = 0;
      for (let j = 0; j < v.length; j++) {
        sum += A[i][j] * v[j];
      }
      result[i] = sum;
    }
    return result;
  }

  private matrixAdd(A: number[][], B: number[][]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < A.length; i++) {
      result[i] = [];
      for (let j = 0; j < A[0].length; j++) {
        result[i][j] = A[i][j] + B[i][j];
      }
    }
    return result;
  }

  private matrixAdd3x3(A: number[][], B: number[][]): number[][] {
    return [
      [A[0][0] + B[0][0], A[0][1] + B[0][1], A[0][2] + B[0][2]],
      [A[1][0] + B[1][0], A[1][1] + B[1][1], A[1][2] + B[1][2]],
      [A[2][0] + B[2][0], A[2][1] + B[2][1], A[2][2] + B[2][2]],
    ];
  }

  private matrixSubtract(A: number[][], B: number[][]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < A.length; i++) {
      result[i] = [];
      for (let j = 0; j < A[0].length; j++) {
        result[i][j] = A[i][j] - B[i][j];
      }
    }
    return result;
  }

  private transpose(A: number[][]): number[][] {
    const rows = A.length;
    const cols = A[0].length;
    const result: number[][] = [];
    for (let j = 0; j < cols; j++) {
      result[j] = [];
      for (let i = 0; i < rows; i++) {
        result[j][i] = A[i][j];
      }
    }
    return result;
  }

  private invert3x3(A: number[][]): number[][] {
    // Calculate determinant
    const det =
      A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
      A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
      A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);

    if (Math.abs(det) < 1e-10) {
      // Singular matrix - return identity
      console.warn('[Kalman] Singular matrix in inversion, returning identity');
      return [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ];
    }

    const invDet = 1 / det;

    return [
      [
        (A[1][1] * A[2][2] - A[1][2] * A[2][1]) * invDet,
        (A[0][2] * A[2][1] - A[0][1] * A[2][2]) * invDet,
        (A[0][1] * A[1][2] - A[0][2] * A[1][1]) * invDet,
      ],
      [
        (A[1][2] * A[2][0] - A[1][0] * A[2][2]) * invDet,
        (A[0][0] * A[2][2] - A[0][2] * A[2][0]) * invDet,
        (A[0][2] * A[1][0] - A[0][0] * A[1][2]) * invDet,
      ],
      [
        (A[1][0] * A[2][1] - A[1][1] * A[2][0]) * invDet,
        (A[0][1] * A[2][0] - A[0][0] * A[2][1]) * invDet,
        (A[0][0] * A[1][1] - A[0][1] * A[1][0]) * invDet,
      ],
    ];
  }
}
