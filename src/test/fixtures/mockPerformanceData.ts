/**
 * Performance metrics for testing performance monitoring components
 */

export interface PerformanceSnapshot {
  fps: number;
  frameTime: number;
  timestamp: number;
}

/**
 * Create a single performance snapshot
 */
export function createPerformanceSnapshot(
  fps: number = 60,
  frameTime?: number,
  timestamp?: number
): PerformanceSnapshot {
  return {
    fps,
    frameTime: frameTime ?? 1000 / fps,
    timestamp: timestamp ?? Date.now(),
  };
}

/**
 * Create a series of performance snapshots with stable FPS
 */
export function createStableFPSHistory(
  fps: number = 60,
  duration: number = 5000
): PerformanceSnapshot[] {
  const snapshots: PerformanceSnapshot[] = [];
  const interval = 1000 / fps;
  const count = Math.floor(duration / interval);
  const baseTime = Date.now();

  for (let i = 0; i < count; i++) {
    snapshots.push({
      fps,
      frameTime: interval,
      timestamp: baseTime + i * interval,
    });
  }

  return snapshots;
}

/**
 * Create performance history with degrading FPS (performance drop)
 */
export function createDegradingFPSHistory(): PerformanceSnapshot[] {
  const snapshots: PerformanceSnapshot[] = [];
  const baseTime = Date.now();
  const fpsSamples = [60, 58, 55, 50, 45, 40, 35, 30, 28, 25, 23, 20];

  fpsSamples.forEach((fps, i) => {
    snapshots.push({
      fps,
      frameTime: 1000 / fps,
      timestamp: baseTime + i * 100,
    });
  });

  return snapshots;
}

/**
 * Create performance history with improving FPS (performance recovery)
 */
export function createImprovingFPSHistory(): PerformanceSnapshot[] {
  const snapshots: PerformanceSnapshot[] = [];
  const baseTime = Date.now();
  const fpsSamples = [20, 23, 28, 32, 38, 42, 47, 52, 56, 58, 60, 60];

  fpsSamples.forEach((fps, i) => {
    snapshots.push({
      fps,
      frameTime: 1000 / fps,
      timestamp: baseTime + i * 100,
    });
  });

  return snapshots;
}

/**
 * Create performance history with fluctuating FPS (unstable)
 */
export function createFluctuatingFPSHistory(): PerformanceSnapshot[] {
  const snapshots: PerformanceSnapshot[] = [];
  const baseTime = Date.now();
  const fpsSamples = [60, 45, 58, 35, 55, 40, 60, 30, 50, 55, 60, 48];

  fpsSamples.forEach((fps, i) => {
    snapshots.push({
      fps,
      frameTime: 1000 / fps,
      timestamp: baseTime + i * 100,
    });
  });

  return snapshots;
}

/**
 * Create performance history with FPS spikes (sudden drops)
 */
export function createFPSSpikesHistory(): PerformanceSnapshot[] {
  const snapshots: PerformanceSnapshot[] = [];
  const baseTime = Date.now();

  // Stable at 60 FPS
  for (let i = 0; i < 20; i++) {
    snapshots.push({
      fps: 60,
      frameTime: 16.67,
      timestamp: baseTime + i * 16.67,
    });
  }

  // Sudden drop to 15 FPS (frame skip)
  snapshots.push({
    fps: 15,
    frameTime: 66.67,
    timestamp: baseTime + 20 * 16.67,
  });

  // Recovery to 60 FPS
  for (let i = 21; i < 40; i++) {
    snapshots.push({
      fps: 60,
      frameTime: 16.67,
      timestamp: baseTime + i * 16.67,
    });
  }

  return snapshots;
}

/**
 * Calculate average FPS from performance history
 */
export function calculateAverageFPS(history: PerformanceSnapshot[]): number {
  if (history.length === 0) return 0;
  const sum = history.reduce((acc, snap) => acc + snap.fps, 0);
  return sum / history.length;
}

/**
 * Calculate min/max FPS from performance history
 */
export function calculateFPSRange(history: PerformanceSnapshot[]): { min: number; max: number } {
  if (history.length === 0) return { min: 0, max: 0 };
  const fps = history.map((snap) => snap.fps);
  return {
    min: Math.min(...fps),
    max: Math.max(...fps),
  };
}

/**
 * Calculate 1% low FPS (worst 1% of frames)
 */
export function calculate1PercentLowFPS(history: PerformanceSnapshot[]): number {
  if (history.length === 0) return 0;

  const sorted = [...history].sort((a, b) => a.fps - b.fps);
  const onePercentCount = Math.max(1, Math.floor(sorted.length * 0.01));
  const worst = sorted.slice(0, onePercentCount);

  return worst.reduce((acc, snap) => acc + snap.fps, 0) / worst.length;
}

/**
 * Detect if FPS is below threshold
 */
export function isFPSBelowThreshold(
  history: PerformanceSnapshot[],
  threshold: number = 30,
  consecutiveFrames: number = 10
): boolean {
  if (history.length < consecutiveFrames) return false;

  const recent = history.slice(-consecutiveFrames);
  return recent.every((snap) => snap.fps < threshold);
}
