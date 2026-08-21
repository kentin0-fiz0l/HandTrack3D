/**
 * Tests for plugin-based gesture detection
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GestureDetector, detectPinch, detectOpenHand, detectFist, detectPoint } from '../detector';
import type { HandLandmark, GestureSettings } from '../../types/gesture';
import type { GesturePlugin } from '../../plugins';

// Helper to create mock landmarks (neutral hand pose)
function createMockLandmarks(): HandLandmark[] {
  const landmarks: HandLandmark[] = [];
  // Create landmarks with some spatial variation to avoid accidental gestures
  for (let i = 0; i < 21; i++) {
    // Spread landmarks apart so they don't accidentally match gestures
    const variation = i * 0.02;
    landmarks.push({ x: 0.5 + variation, y: 0.5 + variation, z: 0 });
  }
  return landmarks;
}

// Custom gesture plugin for testing
class ThumbsUpPlugin implements GesturePlugin {
  readonly name = 'custom:thumbs-up';
  readonly priority = 70;
  readonly gestureType = 'thumbs-up';

  detect(landmarks: HandLandmark[]): boolean {
    // Simple mock: thumb tip (4) above thumb base (2)
    return landmarks[4].y < landmarks[2].y;
  }
}

describe('GestureDetector with plugins', () => {
  let detector: GestureDetector;

  beforeEach(() => {
    detector = new GestureDetector();
  });

  describe('backward compatibility', () => {
    it('should detect built-in gestures by default', () => {
      // Create pinch gesture (thumb and index close)
      const landmarks = createMockLandmarks();
      landmarks[4] = { x: 0.5, y: 0.5, z: 0 }; // Thumb tip
      landmarks[8] = { x: 0.51, y: 0.5, z: 0 }; // Index tip (very close)

      const gesture = detector.detectGesture(landmarks);
      expect(gesture).toBe('pinch');
    });

    it('should work without plugin system (standalone functions)', () => {
      const landmarks = createMockLandmarks();
      landmarks[4] = { x: 0.5, y: 0.5, z: 0 };
      landmarks[8] = { x: 0.51, y: 0.5, z: 0 };

      // Standalone functions should still work
      expect(detectPinch(landmarks)).toBe(true);
      expect(detectOpenHand(landmarks)).toBe(false);
      expect(detectFist(landmarks)).toBe(false);
      expect(detectPoint(landmarks)).toBe(false);
    });

    it('should respect priority order (built-in gestures)', () => {
      const detector = new GestureDetector();

      // All built-in gestures should be registered
      expect(detector.hasGesture('builtin:pinch')).toBe(true);
      expect(detector.hasGesture('builtin:point')).toBe(true);
      expect(detector.hasGesture('builtin:fist')).toBe(true);
      expect(detector.hasGesture('builtin:open-hand')).toBe(true);
    });
  });

  describe('custom gesture plugins', () => {
    it('should register custom gesture plugin', () => {
      const thumbsUpPlugin = new ThumbsUpPlugin();
      detector.registerGesture(thumbsUpPlugin);

      expect(detector.hasGesture('custom:thumbs-up')).toBe(true);
    });

    it('should detect custom gesture', () => {
      const thumbsUpPlugin = new ThumbsUpPlugin();
      detector.registerGesture(thumbsUpPlugin);

      const landmarks = createMockLandmarks();
      landmarks[4] = { x: 0.5, y: 0.3, z: 0 }; // Thumb tip high
      landmarks[2] = { x: 0.5, y: 0.5, z: 0 }; // Thumb base low

      const gesture = detector.detectGesture(landmarks);
      expect(gesture).toBe('thumbs-up');
    });

    it('should unregister custom gesture', () => {
      const thumbsUpPlugin = new ThumbsUpPlugin();
      detector.registerGesture(thumbsUpPlugin);
      expect(detector.hasGesture('custom:thumbs-up')).toBe(true);

      const removed = detector.unregisterGesture('custom:thumbs-up');
      expect(removed).toBe(true);
      expect(detector.hasGesture('custom:thumbs-up')).toBe(false);
    });

    it('should respect priority (high priority detected first)', () => {
      // Create high-priority plugin that always returns true
      class HighPriorityPlugin implements GesturePlugin {
        readonly name = 'test:high-priority';
        readonly priority = 100; // Higher than built-in pinch (80)
        readonly gestureType = 'high-priority';

        detect(): boolean {
          return true; // Always detect
        }
      }

      detector.registerGesture(new HighPriorityPlugin());

      const landmarks = createMockLandmarks();
      landmarks[4] = { x: 0.5, y: 0.5, z: 0 };
      landmarks[8] = { x: 0.51, y: 0.5, z: 0 }; // Would be pinch

      // High priority plugin should be detected instead of pinch
      const gesture = detector.detectGesture(landmarks);
      expect(gesture).toBe('high-priority');
    });

    it('should detect first matching plugin (priority order)', () => {
      // Disable built-in gestures for this test
      detector.unregisterGesture('builtin:pinch');
      detector.unregisterGesture('builtin:point');
      detector.unregisterGesture('builtin:fist');
      detector.unregisterGesture('builtin:open-hand');

      class MediumPriorityPlugin implements GesturePlugin {
        readonly name = 'test:medium';
        readonly priority = 50;
        readonly gestureType = 'medium';

        detect(): boolean {
          return true;
        }
      }

      class LowPriorityPlugin implements GesturePlugin {
        readonly name = 'test:low';
        readonly priority = 10;
        readonly gestureType = 'low';

        detect(): boolean {
          return true;
        }
      }

      detector.registerGesture(new LowPriorityPlugin());
      detector.registerGesture(new MediumPriorityPlugin());

      const plugins = detector.getGesturePlugins();

      // Should be sorted by priority: medium(50), low(10)
      expect(plugins[0].name).toBe('test:medium');
      expect(plugins[1].name).toBe('test:low');

      // First matching plugin should win (medium has higher priority)
      const landmarks = createMockLandmarks();
      const gesture = detector.detectGesture(landmarks);
      expect(gesture).toBe('medium'); // Medium detected before low
    });
  });

  describe('plugin management', () => {
    it('should list all registered plugins', () => {
      const plugins = detector.getGesturePlugins();

      expect(plugins.length).toBe(4); // 4 built-in gestures
      expect(plugins.map((p) => p.name)).toContain('builtin:pinch');
      expect(plugins.map((p) => p.name)).toContain('builtin:point');
      expect(plugins.map((p) => p.name)).toContain('builtin:fist');
      expect(plugins.map((p) => p.name)).toContain('builtin:open-hand');
    });

    it('should return plugins sorted by priority', () => {
      const plugins = detector.getGesturePlugins();

      // Verify descending priority order
      for (let i = 0; i < plugins.length - 1; i++) {
        expect(plugins[i].priority).toBeGreaterThanOrEqual(plugins[i + 1].priority);
      }
    });

    it('should allow disabling built-in gestures', () => {
      detector.unregisterGesture('builtin:pinch');

      const landmarks = createMockLandmarks();
      landmarks[4] = { x: 0.5, y: 0.5, z: 0 };
      landmarks[8] = { x: 0.51, y: 0.5, z: 0 }; // Would be pinch

      // Pinch disabled, should fall through to next gesture
      const gesture = detector.detectGesture(landmarks);
      expect(gesture).not.toBe('pinch');
    });

    it('should create detector without built-in gestures', () => {
      const bareDetector = new GestureDetector({}, { registerBuiltins: false });

      expect(bareDetector.getGesturePlugins()).toHaveLength(0);

      // Register only custom gesture
      bareDetector.registerGesture(new ThumbsUpPlugin());

      const landmarks = createMockLandmarks();
      landmarks[4] = { x: 0.5, y: 0.3, z: 0 };
      landmarks[2] = { x: 0.5, y: 0.5, z: 0 };

      const gesture = bareDetector.detectGesture(landmarks);
      expect(gesture).toBe('thumbs-up');
    });
  });

  describe('settings integration', () => {
    it('should pass settings to plugin detect method', () => {
      let receivedSettings: GestureSettings | undefined;

      class SettingsCheckPlugin implements GesturePlugin {
        readonly name = 'test:settings-check';
        readonly priority = 100;
        readonly gestureType = 'test';

        detect(_landmarks: HandLandmark[], settings: GestureSettings): boolean {
          receivedSettings = settings;
          return false;
        }
      }

      const customSettings: Partial<GestureSettings> = {
        pinchThreshold: 0.123,
        fingerExtensionAngle: 175,
      };

      const detector = new GestureDetector(customSettings);
      detector.registerGesture(new SettingsCheckPlugin());

      detector.detectGesture(createMockLandmarks());

      expect(receivedSettings).toBeDefined();
      expect(receivedSettings?.pinchThreshold).toBe(0.123);
      expect(receivedSettings?.fingerExtensionAngle).toBe(175);
    });

    it('should update settings and affect plugin detection', () => {
      // Create very permissive pinch threshold
      detector.updateSettings({ pinchThreshold: 1.0 });

      const landmarks = createMockLandmarks();
      landmarks[4] = { x: 0.0, y: 0.0, z: 0 };
      landmarks[8] = { x: 0.5, y: 0.5, z: 0 }; // Far apart

      // Should still detect pinch with high threshold
      const gesture = detector.detectGesture(landmarks);
      expect(gesture).toBe('pinch');
    });
  });
});
