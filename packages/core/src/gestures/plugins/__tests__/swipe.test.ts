import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SwipeLeftGesturePlugin,
  SwipeRightGesturePlugin,
  SwipeUpGesturePlugin,
  SwipeDownGesturePlugin,
} from '../swipe';
import type { HandLandmark } from '../../../types/hand';
import { DEFAULT_GESTURE_SETTINGS } from '../../../types/gesture';

/**
 * Create mock hand landmarks with wrist at specified position
 */
function createMockLandmarks(x: number, y: number, z = 0): HandLandmark[] {
  const landmarks: HandLandmark[] = [];
  // Add wrist (landmark 0)
  landmarks.push({ x, y, z });
  // Add 20 more landmarks (simplified)
  for (let i = 1; i < 21; i++) {
    landmarks.push({ x, y, z });
  }
  return landmarks;
}

describe('SwipeGesturePlugins', () => {
  beforeEach(() => {
    // Mock Date.now() for consistent timing
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('SwipeLeftGesturePlugin', () => {
    it('should detect swipe left motion', () => {
      const plugin = new SwipeLeftGesturePlugin();

      // Simulate hand moving from right to left
      const positions = [
        { x: 0.7, y: 0.5, time: 0 },
        { x: 0.6, y: 0.5, time: 50 },
        { x: 0.5, y: 0.5, time: 100 },
        { x: 0.3, y: 0.5, time: 150 },
      ];

      let detected = false;
      for (const pos of positions) {
        vi.setSystemTime(pos.time);
        const landmarks = createMockLandmarks(pos.x, pos.y);
        if (plugin.detect(landmarks, DEFAULT_GESTURE_SETTINGS)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });

    it('should not detect when moving too slowly', () => {
      const plugin = new SwipeLeftGesturePlugin({ minVelocity: 2.0 });

      // Slow movement
      const positions = [
        { x: 0.7, y: 0.5, time: 0 },
        { x: 0.69, y: 0.5, time: 100 },
        { x: 0.68, y: 0.5, time: 200 },
      ];

      let detected = false;
      for (const pos of positions) {
        vi.setSystemTime(pos.time);
        const landmarks = createMockLandmarks(pos.x, pos.y);
        if (plugin.detect(landmarks, DEFAULT_GESTURE_SETTINGS)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(false);
    });

    it('should not detect diagonal movement (right direction)', () => {
      const plugin = new SwipeLeftGesturePlugin();

      // Moving right instead of left
      const positions = [
        { x: 0.3, y: 0.5, time: 0 },
        { x: 0.4, y: 0.5, time: 50 },
        { x: 0.5, y: 0.5, time: 100 },
        { x: 0.7, y: 0.5, time: 150 },
      ];

      let detected = false;
      for (const pos of positions) {
        vi.setSystemTime(pos.time);
        const landmarks = createMockLandmarks(pos.x, pos.y);
        if (plugin.detect(landmarks, DEFAULT_GESTURE_SETTINGS)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(false);
    });
  });

  describe('SwipeRightGesturePlugin', () => {
    it('should detect swipe right motion', () => {
      const plugin = new SwipeRightGesturePlugin();

      // Simulate hand moving from left to right
      const positions = [
        { x: 0.3, y: 0.5, time: 0 },
        { x: 0.4, y: 0.5, time: 50 },
        { x: 0.5, y: 0.5, time: 100 },
        { x: 0.7, y: 0.5, time: 150 },
      ];

      let detected = false;
      for (const pos of positions) {
        vi.setSystemTime(pos.time);
        const landmarks = createMockLandmarks(pos.x, pos.y);
        if (plugin.detect(landmarks, DEFAULT_GESTURE_SETTINGS)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });

    it('should respect directionality threshold', () => {
      const plugin = new SwipeRightGesturePlugin({
        directionalityThreshold: 2.0,
      });

      // Diagonal movement (equal X and Y change)
      const positions = [
        { x: 0.3, y: 0.3, time: 0 },
        { x: 0.5, y: 0.5, time: 100 },
      ];

      let detected = false;
      for (const pos of positions) {
        vi.setSystemTime(pos.time);
        const landmarks = createMockLandmarks(pos.x, pos.y);
        if (plugin.detect(landmarks, DEFAULT_GESTURE_SETTINGS)) {
          detected = true;
          break;
        }
      }

      // Should not detect because X movement is not 2x greater than Y
      expect(detected).toBe(false);
    });
  });

  describe('SwipeUpGesturePlugin', () => {
    it('should detect swipe up motion', () => {
      const plugin = new SwipeUpGesturePlugin();

      // Simulate hand moving from bottom to top (Y decreases)
      const positions = [
        { x: 0.5, y: 0.7, time: 0 },
        { x: 0.5, y: 0.6, time: 50 },
        { x: 0.5, y: 0.5, time: 100 },
        { x: 0.5, y: 0.3, time: 150 },
      ];

      let detected = false;
      for (const pos of positions) {
        vi.setSystemTime(pos.time);
        const landmarks = createMockLandmarks(pos.x, pos.y);
        if (plugin.detect(landmarks, DEFAULT_GESTURE_SETTINGS)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });
  });

  describe('SwipeDownGesturePlugin', () => {
    it('should detect swipe down motion', () => {
      const plugin = new SwipeDownGesturePlugin();

      // Simulate hand moving from top to bottom (Y increases)
      const positions = [
        { x: 0.5, y: 0.3, time: 0 },
        { x: 0.5, y: 0.4, time: 50 },
        { x: 0.5, y: 0.5, time: 100 },
        { x: 0.5, y: 0.7, time: 150 },
      ];

      let detected = false;
      for (const pos of positions) {
        vi.setSystemTime(pos.time);
        const landmarks = createMockLandmarks(pos.x, pos.y);
        if (plugin.detect(landmarks, DEFAULT_GESTURE_SETTINGS)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(true);
    });
  });

  describe('Configuration options', () => {
    it('should respect custom minVelocity', () => {
      const plugin = new SwipeLeftGesturePlugin({ minVelocity: 5.0 });

      // Fast movement but below custom threshold
      const positions = [
        { x: 0.7, y: 0.5, time: 0 },
        { x: 0.5, y: 0.5, time: 100 },
      ];

      let detected = false;
      for (const pos of positions) {
        vi.setSystemTime(pos.time);
        const landmarks = createMockLandmarks(pos.x, pos.y);
        if (plugin.detect(landmarks, DEFAULT_GESTURE_SETTINGS)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(false);
    });

    it('should respect custom maxDuration', () => {
      const plugin = new SwipeLeftGesturePlugin({ maxDuration: 200 });

      // Positions spread over too long a time
      const positions = [
        { x: 0.7, y: 0.5, time: 0 },
        { x: 0.5, y: 0.5, time: 300 }, // Too far apart
      ];

      let detected = false;
      for (const pos of positions) {
        vi.setSystemTime(pos.time);
        const landmarks = createMockLandmarks(pos.x, pos.y);
        if (plugin.detect(landmarks, DEFAULT_GESTURE_SETTINGS)) {
          detected = true;
          break;
        }
      }

      expect(detected).toBe(false);
    });
  });

  describe('Plugin properties', () => {
    it('should have correct name and gestureType for each direction', () => {
      const leftPlugin = new SwipeLeftGesturePlugin();
      const rightPlugin = new SwipeRightGesturePlugin();
      const upPlugin = new SwipeUpGesturePlugin();
      const downPlugin = new SwipeDownGesturePlugin();

      expect(leftPlugin.name).toBe('builtin:swipe-left');
      expect(leftPlugin.gestureType).toBe('swipeLeft');

      expect(rightPlugin.name).toBe('builtin:swipe-right');
      expect(rightPlugin.gestureType).toBe('swipeRight');

      expect(upPlugin.name).toBe('builtin:swipe-up');
      expect(upPlugin.gestureType).toBe('swipeUp');

      expect(downPlugin.name).toBe('builtin:swipe-down');
      expect(downPlugin.gestureType).toBe('swipeDown');
    });

    it('should have priority of 60', () => {
      const plugin = new SwipeLeftGesturePlugin();
      expect(plugin.priority).toBe(60);
    });
  });

  describe('dispose()', () => {
    it('should clear position history', () => {
      const plugin = new SwipeLeftGesturePlugin();

      // Build up some history
      const positions = [
        { x: 0.7, y: 0.5, time: 0 },
        { x: 0.6, y: 0.5, time: 50 },
      ];

      for (const pos of positions) {
        vi.setSystemTime(pos.time);
        const landmarks = createMockLandmarks(pos.x, pos.y);
        plugin.detect(landmarks, DEFAULT_GESTURE_SETTINGS);
      }

      // Dispose should clear history
      plugin.dispose();

      // After dispose, should need to rebuild history (no immediate detection)
      vi.setSystemTime(100);
      const landmarks = createMockLandmarks(0.3, 0.5);
      const detected = plugin.detect(landmarks, DEFAULT_GESTURE_SETTINGS);

      expect(detected).toBe(false);
    });
  });
});
