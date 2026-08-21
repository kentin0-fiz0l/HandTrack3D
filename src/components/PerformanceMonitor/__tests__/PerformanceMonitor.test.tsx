import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { usePerformanceMetricsStore } from '../PerformanceTracker';
import { useSettingsStore } from '@/stores/settingsStore';
import { useHandTrackingStore } from '@/stores/handTrackingStore';
import { useSceneStore } from '@/stores/sceneStore';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    // Reset all stores
    useSettingsStore.getState().reset();
    useSettingsStore.getState().updateVisualSetting('showPerformance', true);
    usePerformanceMetricsStore.getState().setMetrics({ fps: 60, frameTime: 16.67 });
    useHandTrackingStore.setState({ hands: [], fps: 30, lastUpdate: Date.now() });
    useSceneStore.setState({ objects: [] });
  });

  describe('Visibility', () => {
    it('should display when showPerformance is true', () => {
      useSettingsStore.getState().updateVisualSetting('showPerformance', true);

      render(<PerformanceMonitor />);

      expect(screen.getByText('Performance')).toBeInTheDocument();
    });

    it('should hide when showPerformance is false', () => {
      useSettingsStore.getState().updateVisualSetting('showPerformance', false);

      render(<PerformanceMonitor />);

      expect(screen.queryByText('Performance')).not.toBeInTheDocument();
    });

    it('should toggle off when close button clicked', async () => {
      const user = userEvent.setup();
      render(<PerformanceMonitor />);

      const closeButton = screen.getByTitle('Hide Performance Monitor');
      await user.click(closeButton);

      expect(useSettingsStore.getState().showPerformance).toBe(false);
    });
  });

  describe('Metric Display', () => {
    it('should render all metric labels', () => {
      render(<PerformanceMonitor />);

      expect(screen.getByText('FPS')).toBeInTheDocument();
      expect(screen.getByText('Frame Time')).toBeInTheDocument();
      expect(screen.getByText('Hand Tracking')).toBeInTheDocument();
      expect(screen.getByText('Objects')).toBeInTheDocument();
    });

    it('should display FPS value from performance tracker', async () => {
      usePerformanceMetricsStore.getState().setMetrics({ fps: 58, frameTime: 17.2 });

      render(<PerformanceMonitor />);

      await waitFor(() => {
        expect(screen.getByText('58')).toBeInTheDocument();
      });
      expect(screen.getByText(/fps/)).toBeInTheDocument();
    });

    it('should display frame time value from performance tracker', async () => {
      usePerformanceMetricsStore.getState().setMetrics({ fps: 60, frameTime: 16.67 });

      render(<PerformanceMonitor />);

      await waitFor(() => {
        expect(screen.getByText('16.67')).toBeInTheDocument();
      });
      expect(screen.getByText(/ms/)).toBeInTheDocument();
    });

    it('should display hand tracking FPS from hand tracking store', async () => {
      useHandTrackingStore.setState({ hands: [], fps: 28, lastUpdate: Date.now() });

      render(<PerformanceMonitor />);

      await waitFor(() => {
        expect(screen.getByText('28')).toBeInTheDocument();
      });
    });

    it('should display object count from scene store', () => {
      useSceneStore.setState({
        objects: [
          {
            id: '1',
            type: 'box',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: 1,
            color: '#ffffff',
          },
          {
            id: '2',
            type: 'sphere',
            position: [1, 1, 1],
            rotation: [0, 0, 0],
            scale: 1,
            color: '#ff0000',
          },
        ],
      });

      render(<PerformanceMonitor />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display memory usage when available', async () => {
      // Mock performance.memory API (Chrome only)
      Object.defineProperty(performance, 'memory', {
        configurable: true,
        value: {
          usedJSHeapSize: 100 * 1024 * 1024, // 100 MB
        },
      });

      render(<PerformanceMonitor />);

      await waitFor(() => {
        expect(screen.getByText('Memory')).toBeInTheDocument();
      });
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText(/MB/)).toBeInTheDocument();
    });

    it('should not display memory when API unavailable', () => {
      // Ensure performance.memory is undefined
      Object.defineProperty(performance, 'memory', {
        configurable: true,
        value: undefined,
      });

      render(<PerformanceMonitor />);

      expect(screen.queryByText('Memory')).not.toBeInTheDocument();
    });
  });

  describe('Color Coding', () => {
    it('should show green for good FPS (>= 55)', () => {
      usePerformanceMetricsStore.getState().setMetrics({ fps: 60, frameTime: 16.67 });

      const { container } = render(<PerformanceMonitor />);

      const fpsValue = container.querySelector('.text-green-400');
      expect(fpsValue).toBeInTheDocument();
    });

    it('should show yellow for warning FPS (30-54)', () => {
      usePerformanceMetricsStore.getState().setMetrics({ fps: 45, frameTime: 22 });

      const { container } = render(<PerformanceMonitor />);

      const fpsValue = container.querySelector('.text-yellow-400');
      expect(fpsValue).toBeInTheDocument();
    });

    it('should show red for critical FPS (< 30)', () => {
      usePerformanceMetricsStore.getState().setMetrics({ fps: 25, frameTime: 40 });

      const { container } = render(<PerformanceMonitor />);

      const fpsValue = container.querySelector('.text-red-400');
      expect(fpsValue).toBeInTheDocument();
    });

    it('should show green for good frame time (<= 16.67ms)', () => {
      usePerformanceMetricsStore.getState().setMetrics({ fps: 60, frameTime: 16.0 });

      const { container } = render(<PerformanceMonitor />);

      // Frame time should have green color
      const greenMetrics = container.querySelectorAll('.text-green-400');
      expect(greenMetrics.length).toBeGreaterThanOrEqual(1);
    });

    it('should show yellow for warning frame time (16.67-33.33ms)', () => {
      usePerformanceMetricsStore.getState().setMetrics({ fps: 45, frameTime: 25 });

      const { container } = render(<PerformanceMonitor />);

      const yellowMetrics = container.querySelectorAll('.text-yellow-400');
      expect(yellowMetrics.length).toBeGreaterThanOrEqual(1);
    });

    it('should show red for critical frame time (> 33.33ms)', () => {
      usePerformanceMetricsStore.getState().setMetrics({ fps: 20, frameTime: 50 });

      const { container } = render(<PerformanceMonitor />);

      const redMetrics = container.querySelectorAll('.text-red-400');
      expect(redMetrics.length).toBeGreaterThanOrEqual(1);
    });

    it('should show green for good hand tracking FPS (>= 25)', () => {
      useHandTrackingStore.setState({ hands: [], fps: 30, lastUpdate: Date.now() });

      const { container } = render(<PerformanceMonitor />);

      const greenMetrics = container.querySelectorAll('.text-green-400');
      expect(greenMetrics.length).toBeGreaterThanOrEqual(1);
    });

    it('should show yellow for warning hand tracking FPS (15-24)', () => {
      useHandTrackingStore.setState({ hands: [], fps: 20, lastUpdate: Date.now() });

      const { container } = render(<PerformanceMonitor />);

      const yellowMetrics = container.querySelectorAll('.text-yellow-400');
      expect(yellowMetrics.length).toBeGreaterThanOrEqual(1);
    });

    it('should show red for critical hand tracking FPS (< 15)', () => {
      useHandTrackingStore.setState({ hands: [], fps: 10, lastUpdate: Date.now() });

      const { container } = render(<PerformanceMonitor />);

      const redMetrics = container.querySelectorAll('.text-red-400');
      expect(redMetrics.length).toBeGreaterThanOrEqual(1);
    });

    it('should show correct memory color coding', () => {
      Object.defineProperty(performance, 'memory', {
        configurable: true,
        value: {
          usedJSHeapSize: 600 * 1024 * 1024, // 600 MB - critical
        },
      });

      const { container } = render(<PerformanceMonitor />);

      const redMetrics = container.querySelectorAll('.text-red-400');
      expect(redMetrics.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Dynamic Updates', () => {
    it('should update when performance metrics change', async () => {
      const { rerender } = render(<PerformanceMonitor />);

      await waitFor(() => {
        expect(screen.getByText('60')).toBeInTheDocument();
      });

      act(() => {
        usePerformanceMetricsStore.getState().setMetrics({ fps: 45, frameTime: 22 });
      });
      rerender(<PerformanceMonitor />);

      await waitFor(() => {
        expect(screen.getByText('45')).toBeInTheDocument();
      });
    });

    it('should update when hand tracking FPS changes', async () => {
      const { rerender } = render(<PerformanceMonitor />);

      act(() => {
        useHandTrackingStore.setState({ hands: [], fps: 25, lastUpdate: Date.now() });
      });
      rerender(<PerformanceMonitor />);

      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument();
      });
    });

    it('should update when object count changes', () => {
      const { rerender } = render(<PerformanceMonitor />);

      expect(screen.getByText('0')).toBeInTheDocument();

      useSceneStore.setState({
        objects: [
          {
            id: '1',
            type: 'box',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: 1,
            color: '#ffffff',
          },
        ],
      });
      rerender(<PerformanceMonitor />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('UI Elements', () => {
    it('should display header with title', () => {
      render(<PerformanceMonitor />);

      expect(screen.getByText('Performance')).toBeInTheDocument();
    });

    it('should display target FPS legend', () => {
      render(<PerformanceMonitor />);

      expect(screen.getByText(/Target: 60 FPS/)).toBeInTheDocument();
      expect(screen.getByText(/16\.67ms/)).toBeInTheDocument();
    });

    it('should have close button with proper title', () => {
      render(<PerformanceMonitor />);

      const closeButton = screen.getByTitle('Hide Performance Monitor');
      expect(closeButton).toBeInTheDocument();
    });
  });
});
