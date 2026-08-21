import { describe, it, expect, beforeEach } from 'vitest';
import { MultiHandGestureDetector } from '../multi-hand-detector';
import type { MultiHandGesturePlugin } from '../../plugins/multi-hand-types';
import type { HandLandmark } from '../../types/hand';
import type { GestureSettings } from '../../types/gesture';

/**
 * Mock gesture plugin for testing
 */
class MockGesturePlugin implements MultiHandGesturePlugin {
  readonly name: string;
  readonly priority: number;
  readonly gestureType: string;
  readonly requiredHands: number;
  private shouldDetect: boolean;

  constructor(
    name: string,
    gestureType: string,
    priority: number = 50,
    requiredHands: number = 2,
    shouldDetect: boolean = false
  ) {
    this.name = name;
    this.gestureType = gestureType;
    this.priority = priority;
    this.requiredHands = requiredHands;
    this.shouldDetect = shouldDetect;
  }

  detect(_hands: HandLandmark[][], _settings: GestureSettings): boolean {
    return this.shouldDetect;
  }

  setShouldDetect(value: boolean): void {
    this.shouldDetect = value;
  }
}

/**
 * Create mock hand landmarks
 */
function createMockHand(): HandLandmark[] {
  return Array.from({ length: 21 }, (_, i) => ({
    x: i * 0.05,
    y: i * 0.05,
    z: i * 0.01,
  }));
}

describe('MultiHandGestureDetector', () => {
  let detector: MultiHandGestureDetector;

  beforeEach(() => {
    detector = new MultiHandGestureDetector();
  });

  describe('Plugin Registration', () => {
    it('should register a plugin', () => {
      const plugin = new MockGesturePlugin('test:plugin', 'test');
      detector.registerGesture(plugin);

      expect(detector.hasGesture('test:plugin')).toBe(true);
    });

    it('should throw error when registering duplicate plugin', () => {
      const plugin1 = new MockGesturePlugin('test:plugin', 'test');
      const plugin2 = new MockGesturePlugin('test:plugin', 'test');

      detector.registerGesture(plugin1);

      expect(() => detector.registerGesture(plugin2)).toThrow(
        'Plugin "test:plugin" is already registered'
      );
    });

    it('should unregister a plugin', () => {
      const plugin = new MockGesturePlugin('test:plugin', 'test');
      detector.registerGesture(plugin);

      const removed = detector.unregisterGesture('test:plugin');

      expect(removed).toBe(true);
      expect(detector.hasGesture('test:plugin')).toBe(false);
    });

    it('should return false when unregistering non-existent plugin', () => {
      const removed = detector.unregisterGesture('nonexistent');
      expect(removed).toBe(false);
    });

    it('should get all registered plugins sorted by priority', () => {
      const plugin1 = new MockGesturePlugin('test:low', 'test1', 10);
      const plugin2 = new MockGesturePlugin('test:high', 'test2', 90);
      const plugin3 = new MockGesturePlugin('test:mid', 'test3', 50);

      detector.registerGesture(plugin1);
      detector.registerGesture(plugin2);
      detector.registerGesture(plugin3);

      const plugins = detector.getGesturePlugins();

      expect(plugins).toHaveLength(3);
      expect(plugins[0].priority).toBe(90); // Highest first
      expect(plugins[1].priority).toBe(50);
      expect(plugins[2].priority).toBe(10);
    });
  });

  describe('Settings Management', () => {
    it('should use default settings', () => {
      const settings = detector.getSettings();
      expect(settings.pinchThreshold).toBeDefined();
    });

    it('should accept custom settings', () => {
      detector = new MultiHandGestureDetector({ pinchThreshold: 0.1 });
      const settings = detector.getSettings();
      expect(settings.pinchThreshold).toBe(0.1);
    });

    it('should update settings', () => {
      detector.updateSettings({ pinchThreshold: 0.15 });
      const settings = detector.getSettings();
      expect(settings.pinchThreshold).toBe(0.15);
    });
  });

  describe('Gesture Detection', () => {
    it('should return "none" when no plugins registered', () => {
      const hands = [createMockHand(), createMockHand()];
      const gesture = detector.detectGesture(hands);
      expect(gesture).toBe('none');
    });

    it('should return "none" when no hands provided', () => {
      const plugin = new MockGesturePlugin('test:plugin', 'test', 50, 2, true);
      detector.registerGesture(plugin);

      const gesture = detector.detectGesture([]);
      expect(gesture).toBe('none');
    });

    it('should skip plugins requiring more hands than available', () => {
      const plugin = new MockGesturePlugin('test:plugin', 'test', 50, 3, true);
      detector.registerGesture(plugin);

      const hands = [createMockHand(), createMockHand()]; // Only 2 hands
      const gesture = detector.detectGesture(hands);

      expect(gesture).toBe('none');
    });

    it('should detect gesture when plugin returns true', () => {
      const plugin = new MockGesturePlugin('test:plugin', 'test-gesture', 50, 2, true);
      detector.registerGesture(plugin);

      const hands = [createMockHand(), createMockHand()];
      const gesture = detector.detectGesture(hands);

      expect(gesture).toBe('test-gesture');
    });

    it('should check plugins in priority order', () => {
      const lowPriority = new MockGesturePlugin('test:low', 'low', 10, 2, true);
      const highPriority = new MockGesturePlugin('test:high', 'high', 90, 2, true);

      detector.registerGesture(lowPriority);
      detector.registerGesture(highPriority);

      const hands = [createMockHand(), createMockHand()];
      const gesture = detector.detectGesture(hands);

      // Should detect high priority first
      expect(gesture).toBe('high');
    });

    it('should continue to next plugin if first returns false', () => {
      const plugin1 = new MockGesturePlugin('test:first', 'first', 90, 2, false);
      const plugin2 = new MockGesturePlugin('test:second', 'second', 80, 2, true);

      detector.registerGesture(plugin1);
      detector.registerGesture(plugin2);

      const hands = [createMockHand(), createMockHand()];
      const gesture = detector.detectGesture(hands);

      expect(gesture).toBe('second');
    });
  });

  describe('Detailed Detection', () => {
    it('should return detailed result with gesture type', () => {
      const plugin = new MockGesturePlugin('test:plugin', 'test-gesture', 50, 2, true);
      detector.registerGesture(plugin);

      const hands = [createMockHand(), createMockHand()];
      const result = detector.detectGestureDetailed(hands);

      expect(result.type).toBe('test-gesture');
      expect(result.handCount).toBe(2);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it('should return correct hand count', () => {
      const plugin = new MockGesturePlugin('test:plugin', 'test', 50, 3, true);
      detector.registerGesture(plugin);

      const hands = [createMockHand(), createMockHand(), createMockHand()];
      const result = detector.detectGestureDetailed(hands);

      expect(result.handCount).toBe(3);
    });
  });

  describe('Lifecycle', () => {
    it('should call plugin initialize on registration', () => {
      let initialized = false;

      class InitPlugin extends MockGesturePlugin {
        initialize() {
          initialized = true;
        }
      }

      const plugin = new InitPlugin('test:plugin', 'test');
      detector.registerGesture(plugin);

      expect(initialized).toBe(true);
    });

    it('should call plugin dispose on unregistration', () => {
      let disposed = false;

      class DisposePlugin extends MockGesturePlugin {
        dispose() {
          disposed = true;
        }
      }

      const plugin = new DisposePlugin('test:plugin', 'test');
      detector.registerGesture(plugin);
      detector.unregisterGesture('test:plugin');

      expect(disposed).toBe(true);
    });

    it('should dispose all plugins when detector is disposed', () => {
      let disposed1 = false;
      let disposed2 = false;

      class DisposePlugin1 extends MockGesturePlugin {
        dispose() {
          disposed1 = true;
        }
      }

      class DisposePlugin2 extends MockGesturePlugin {
        dispose() {
          disposed2 = true;
        }
      }

      detector.registerGesture(new DisposePlugin1('test:plugin1', 'test1'));
      detector.registerGesture(new DisposePlugin2('test:plugin2', 'test2'));

      detector.dispose();

      expect(disposed1).toBe(true);
      expect(disposed2).toBe(true);
    });
  });
});
