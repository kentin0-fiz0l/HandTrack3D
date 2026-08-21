import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { create } from 'zustand';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
}

interface PerformanceMetricsStore {
  metrics: PerformanceMetrics;
  setMetrics: (metrics: PerformanceMetrics) => void;
}

export const usePerformanceMetricsStore = create<PerformanceMetricsStore>((set) => ({
  metrics: { fps: 0, frameTime: 0 },
  setMetrics: (metrics) => set({ metrics }),
}));

const FPS_SAMPLE_SIZE = 60;

/**
 * Component that tracks frame performance inside the R3F Canvas
 * and updates the global store
 */
export function PerformanceTracker() {
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const setMetrics = usePerformanceMetricsStore((state) => state.setMetrics);

  useFrame(() => {
    const now = performance.now();
    const frameTime = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;

    // Add to rolling window
    frameTimesRef.current.push(frameTime);
    if (frameTimesRef.current.length > FPS_SAMPLE_SIZE) {
      frameTimesRef.current.shift();
    }

    // Calculate average frame time and FPS
    const avgFrameTime =
      frameTimesRef.current.reduce((sum, ft) => sum + ft, 0) /
      frameTimesRef.current.length;

    const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;

    setMetrics({
      fps: Math.round(fps),
      frameTime: Math.round(avgFrameTime * 100) / 100,
    });
  });

  return null; // This component doesn't render anything
}
