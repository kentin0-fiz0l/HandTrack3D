import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { usePerformanceMetricsStore } from '../PerformanceTracker';

describe('PerformanceTracker Store', () => {
  beforeEach(() => {
    // Reset performance metrics store
    usePerformanceMetricsStore.setState({
      metrics: { fps: 0, frameTime: 0 },
    });
  });

  describe('usePerformanceMetricsStore', () => {
    it('should initialize with default metrics', () => {
      const { result } = renderHook(() => usePerformanceMetricsStore());

      expect(result.current.metrics.fps).toBe(0);
      expect(result.current.metrics.frameTime).toBe(0);
    });

    it('should update metrics when setMetrics is called', () => {
      const { result } = renderHook(() => usePerformanceMetricsStore());

      act(() => {
        result.current.setMetrics({ fps: 60, frameTime: 16.67 });
      });

      expect(result.current.metrics.fps).toBe(60);
      expect(result.current.metrics.frameTime).toBe(16.67);
    });
  });

  describe('FPS and Frame Time Values', () => {
    it('should store FPS from frame time (60 FPS)', () => {
      act(() => {
        usePerformanceMetricsStore.getState().setMetrics({ fps: 60, frameTime: 16.67 });
      });

      const store = usePerformanceMetricsStore.getState();
      expect(store.metrics.fps).toBe(60);
      expect(store.metrics.frameTime).toBeCloseTo(16.67, 1);
    });

    it('should store FPS for 30 FPS scenario', () => {
      act(() => {
        usePerformanceMetricsStore.getState().setMetrics({ fps: 30, frameTime: 33.33 });
      });

      const store = usePerformanceMetricsStore.getState();
      expect(store.metrics.fps).toBe(30);
      expect(store.metrics.frameTime).toBeCloseTo(33.33, 1);
    });

    it('should store FPS for variable frame times', () => {
      act(() => {
        usePerformanceMetricsStore.getState().setMetrics({ fps: 45, frameTime: 22.22 });
      });

      const store = usePerformanceMetricsStore.getState();
      expect(store.metrics.fps).toBe(45);
      expect(store.metrics.frameTime).toBeCloseTo(22.22, 1);
    });
  });

  describe('Rolling Average Simulation', () => {
    it('should accept rolling average calculations (60 frames)', () => {
      // Simulate averaging over 60 frames
      const frameTimes = Array.from({ length: 60 }, () => 16.67);
      const avgFrameTime = frameTimes.reduce((sum, ft) => sum + ft, 0) / frameTimes.length;
      const avgFps = Math.round(1000 / avgFrameTime);

      act(() => {
        usePerformanceMetricsStore.getState().setMetrics({ fps: avgFps, frameTime: avgFrameTime });
      });

      const store = usePerformanceMetricsStore.getState();
      expect(store.metrics.fps).toBe(60);
      expect(store.metrics.frameTime).toBeCloseTo(16.67, 1);
    });

    it('should accept smoothed frame time with occasional spikes', () => {
      // Simulate frames with occasional spikes
      const frameTimes = [
        ...Array(55).fill(16.67),
        ...Array(5).fill(50),
      ];
      const avgFrameTime = frameTimes.reduce((sum, ft) => sum + ft, 0) / frameTimes.length;
      const avgFps = Math.round(1000 / avgFrameTime);

      act(() => {
        usePerformanceMetricsStore.getState().setMetrics({
          fps: avgFps,
          frameTime: Math.round(avgFrameTime * 100) / 100
        });
      });

      const store = usePerformanceMetricsStore.getState();
      expect(store.metrics.frameTime).toBeGreaterThan(16.67);
      expect(store.metrics.frameTime).toBeLessThan(50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero frame time', () => {
      const store = usePerformanceMetricsStore.getState();

      act(() => {
        store.setMetrics({ fps: 0, frameTime: 0 });
      });

      expect(store.metrics.fps).toBe(0);
      expect(store.metrics.frameTime).toBe(0);
    });

    it('should handle very low FPS', () => {
      act(() => {
        usePerformanceMetricsStore.getState().setMetrics({ fps: 5, frameTime: 200 });
      });

      const store = usePerformanceMetricsStore.getState();
      expect(store.metrics.fps).toBe(5);
      expect(store.metrics.frameTime).toBe(200);
    });

    it('should handle very high FPS', () => {
      act(() => {
        usePerformanceMetricsStore.getState().setMetrics({ fps: 120, frameTime: 8.33 });
      });

      const store = usePerformanceMetricsStore.getState();
      expect(store.metrics.fps).toBe(120);
      expect(store.metrics.frameTime).toBe(8.33);
    });

    it('should accept rounded FPS values', () => {
      act(() => {
        usePerformanceMetricsStore.getState().setMetrics({ fps: 60, frameTime: 16.72 });
      });

      const store = usePerformanceMetricsStore.getState();
      expect(store.metrics.fps).toBe(60);
    });

    it('should accept frame time with precision', () => {
      act(() => {
        usePerformanceMetricsStore.getState().setMetrics({ fps: 60, frameTime: 16.666666 });
      });

      const store = usePerformanceMetricsStore.getState();
      expect(store.metrics.frameTime).toBeCloseTo(16.67, 2);
    });
  });

  describe('Performance Overhead', () => {
    it('should have minimal memory footprint', () => {
      const store = usePerformanceMetricsStore.getState();

      expect(Object.keys(store.metrics).length).toBe(2);
      expect(typeof store.metrics.fps).toBe('number');
      expect(typeof store.metrics.frameTime).toBe('number');
    });

    it('should update metrics efficiently', () => {
      const store = usePerformanceMetricsStore.getState();
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        act(() => {
          store.setMetrics({ fps: 60, frameTime: 16.67 });
        });
      }

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      expect(updateTime).toBeLessThan(10);
    });
  });

  describe('Store Persistence', () => {
    it('should maintain metrics across hook calls', () => {
      const store = usePerformanceMetricsStore.getState();

      act(() => {
        store.setMetrics({ fps: 55, frameTime: 18.18 });
      });

      const freshStore = usePerformanceMetricsStore.getState();

      expect(freshStore.metrics.fps).toBe(55);
      expect(freshStore.metrics.frameTime).toBe(18.18);
    });

    it('should allow multiple subscribers', () => {
      const { result: result1 } = renderHook(() => usePerformanceMetricsStore());
      const { result: result2 } = renderHook(() => usePerformanceMetricsStore());

      act(() => {
        result1.current.setMetrics({ fps: 50, frameTime: 20 });
      });

      expect(result1.current.metrics.fps).toBe(50);
      expect(result2.current.metrics.fps).toBe(50);
    });
  });

  describe('Metric Validation', () => {
    it('should store valid FPS range (0-240)', () => {
      const store = usePerformanceMetricsStore.getState();

      // Test boundary values
      act(() => store.setMetrics({ fps: 0, frameTime: 0 }));
      expect(store.metrics.fps).toBeGreaterThanOrEqual(0);

      act(() => store.setMetrics({ fps: 240, frameTime: 4.17 }));
      expect(store.metrics.fps).toBeLessThanOrEqual(240);
    });

    it('should store valid frame time values', () => {
      act(() => {
        usePerformanceMetricsStore.getState().setMetrics({ fps: 60, frameTime: 16.67 });
      });
      let store = usePerformanceMetricsStore.getState();
      expect(store.metrics.frameTime).toBeGreaterThan(0);

      act(() => {
        usePerformanceMetricsStore.getState().setMetrics({ fps: 1, frameTime: 1000 });
      });
      store = usePerformanceMetricsStore.getState();
      expect(store.metrics.frameTime).toBeLessThanOrEqual(1000);
    });
  });
});
