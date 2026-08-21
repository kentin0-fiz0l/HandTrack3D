/**
 * Tests for plugin registry system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginRegistry, GesturePluginRegistry } from '../registry';
import type { BasePlugin, GesturePlugin } from '../types';
import type { HandLandmark, GestureSettings } from '../../types/gesture';

// Mock plugins for testing
class MockPlugin implements BasePlugin {
  readonly name: string;
  readonly version?: string;
  initializeCalled = false;
  disposeCalled = false;

  constructor(name: string, version?: string) {
    this.name = name;
    this.version = version;
  }

  initialize(): void {
    this.initializeCalled = true;
  }

  dispose(): void {
    this.disposeCalled = true;
  }
}

class MockAsyncPlugin implements BasePlugin {
  readonly name: string;
  initializeDelay: number;

  constructor(name: string, initializeDelay = 10) {
    this.name = name;
    this.initializeDelay = initializeDelay;
  }

  async initialize(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.initializeDelay));
  }

  async dispose(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

class MockGesturePlugin implements GesturePlugin {
  readonly name: string;
  readonly priority: number;
  readonly gestureType: string;
  detectResult: boolean;

  constructor(name: string, priority: number, gestureType: string, detectResult = true) {
    this.name = name;
    this.priority = priority;
    this.gestureType = gestureType;
    this.detectResult = detectResult;
  }

  detect(_landmarks: HandLandmark[], _settings: GestureSettings): boolean {
    return this.detectResult;
  }
}

describe('PluginRegistry', () => {
  let registry: PluginRegistry<BasePlugin>;

  beforeEach(() => {
    registry = new PluginRegistry<BasePlugin>();
  });

  describe('register', () => {
    it('should register a plugin', () => {
      const plugin = new MockPlugin('test-plugin');
      registry.register(plugin);

      expect(registry.has('test-plugin')).toBe(true);
      expect(registry.get('test-plugin')).toBe(plugin);
    });

    it('should call initialize on plugin registration', () => {
      const plugin = new MockPlugin('test-plugin');
      registry.register(plugin);

      expect(plugin.initializeCalled).toBe(true);
    });

    it('should throw error when registering duplicate plugin', () => {
      const plugin1 = new MockPlugin('test-plugin');
      const plugin2 = new MockPlugin('test-plugin');

      registry.register(plugin1);

      expect(() => registry.register(plugin2)).toThrow(
        'Plugin "test-plugin" is already registered'
      );
    });

    it('should handle async initialization', async () => {
      const plugin = new MockAsyncPlugin('async-plugin', 10);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      registry.register(plugin);

      // Plugin should be registered immediately
      expect(registry.has('async-plugin')).toBe(true);

      // Wait for async initialization
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle failed async initialization gracefully', async () => {
      const plugin: BasePlugin = {
        name: 'failing-plugin',
        async initialize() {
          throw new Error('Initialization failed');
        },
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      registry.register(plugin);

      // Plugin should still be registered
      expect(registry.has('failing-plugin')).toBe(true);

      // Wait for async error
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize plugin "failing-plugin"'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('unregister', () => {
    it('should unregister a plugin', () => {
      const plugin = new MockPlugin('test-plugin');
      registry.register(plugin);

      const result = registry.unregister('test-plugin');

      expect(result).toBe(true);
      expect(registry.has('test-plugin')).toBe(false);
    });

    it('should call dispose on plugin unregistration', () => {
      const plugin = new MockPlugin('test-plugin');
      registry.register(plugin);

      registry.unregister('test-plugin');

      expect(plugin.disposeCalled).toBe(true);
    });

    it('should return false when unregistering non-existent plugin', () => {
      const result = registry.unregister('non-existent');
      expect(result).toBe(false);
    });

    it('should handle async disposal', async () => {
      const plugin = new MockAsyncPlugin('async-plugin');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      registry.register(plugin);
      registry.unregister('async-plugin');

      // Plugin should be unregistered immediately
      expect(registry.has('async-plugin')).toBe(false);

      // Wait for async disposal
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('get', () => {
    it('should return plugin by name', () => {
      const plugin = new MockPlugin('test-plugin');
      registry.register(plugin);

      expect(registry.get('test-plugin')).toBe(plugin);
    });

    it('should return undefined for non-existent plugin', () => {
      expect(registry.get('non-existent')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for registered plugin', () => {
      const plugin = new MockPlugin('test-plugin');
      registry.register(plugin);

      expect(registry.has('test-plugin')).toBe(true);
    });

    it('should return false for non-registered plugin', () => {
      expect(registry.has('non-existent')).toBe(false);
    });
  });

  describe('list', () => {
    it('should return all registered plugins', () => {
      const plugin1 = new MockPlugin('plugin-1');
      const plugin2 = new MockPlugin('plugin-2');
      const plugin3 = new MockPlugin('plugin-3');

      registry.register(plugin1);
      registry.register(plugin2);
      registry.register(plugin3);

      const plugins = registry.list();

      expect(plugins).toHaveLength(3);
      expect(plugins).toContain(plugin1);
      expect(plugins).toContain(plugin2);
      expect(plugins).toContain(plugin3);
    });

    it('should return empty array when no plugins registered', () => {
      expect(registry.list()).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should remove all plugins', () => {
      registry.register(new MockPlugin('plugin-1'));
      registry.register(new MockPlugin('plugin-2'));

      registry.clear();

      expect(registry.size).toBe(0);
      expect(registry.list()).toEqual([]);
    });

    it('should call dispose on all plugins', () => {
      const plugin1 = new MockPlugin('plugin-1');
      const plugin2 = new MockPlugin('plugin-2');

      registry.register(plugin1);
      registry.register(plugin2);

      registry.clear();

      expect(plugin1.disposeCalled).toBe(true);
      expect(plugin2.disposeCalled).toBe(true);
    });
  });

  describe('size', () => {
    it('should return number of registered plugins', () => {
      expect(registry.size).toBe(0);

      registry.register(new MockPlugin('plugin-1'));
      expect(registry.size).toBe(1);

      registry.register(new MockPlugin('plugin-2'));
      expect(registry.size).toBe(2);

      registry.unregister('plugin-1');
      expect(registry.size).toBe(1);
    });
  });
});

describe('GesturePluginRegistry', () => {
  let registry: GesturePluginRegistry;

  beforeEach(() => {
    registry = new GesturePluginRegistry();
  });

  describe('priority-based sorting', () => {
    it('should sort plugins by priority (highest first)', () => {
      const lowPriority = new MockGesturePlugin('low', 30, 'low-gesture');
      const highPriority = new MockGesturePlugin('high', 90, 'high-gesture');
      const mediumPriority = new MockGesturePlugin('medium', 60, 'medium-gesture');

      registry.register(lowPriority);
      registry.register(highPriority);
      registry.register(mediumPriority);

      const plugins = registry.list();

      expect(plugins[0]).toBe(highPriority);
      expect(plugins[1]).toBe(mediumPriority);
      expect(plugins[2]).toBe(lowPriority);
    });

    it('should sort alphabetically for plugins with same priority', () => {
      const pluginC = new MockGesturePlugin('charlie', 50, 'gesture-c');
      const pluginA = new MockGesturePlugin('alpha', 50, 'gesture-a');
      const pluginB = new MockGesturePlugin('bravo', 50, 'gesture-b');

      registry.register(pluginC);
      registry.register(pluginA);
      registry.register(pluginB);

      const plugins = registry.list();

      expect(plugins[0].name).toBe('alpha');
      expect(plugins[1].name).toBe('bravo');
      expect(plugins[2].name).toBe('charlie');
    });

    it('should handle mixed priorities and names', () => {
      const plugins = [
        new MockGesturePlugin('zebra', 100, 'z'),
        new MockGesturePlugin('alpha', 100, 'a'),
        new MockGesturePlugin('bravo', 50, 'b'),
        new MockGesturePlugin('charlie', 75, 'c'),
      ];

      plugins.forEach((p) => registry.register(p));

      const sorted = registry.list();

      // Priority 100: alpha, zebra (alphabetical)
      expect(sorted[0].name).toBe('alpha');
      expect(sorted[1].name).toBe('zebra');
      // Priority 75: charlie
      expect(sorted[2].name).toBe('charlie');
      // Priority 50: bravo
      expect(sorted[3].name).toBe('bravo');
    });
  });

  describe('caching', () => {
    it('should cache sorted results', () => {
      const plugin1 = new MockGesturePlugin('plugin-1', 80, 'gesture-1');
      const plugin2 = new MockGesturePlugin('plugin-2', 60, 'gesture-2');

      registry.register(plugin1);
      registry.register(plugin2);

      const list1 = registry.list();
      const list2 = registry.list();

      // Should return same array reference (cached)
      expect(list1).toBe(list2);
    });

    it('should invalidate cache on register', () => {
      const plugin1 = new MockGesturePlugin('plugin-1', 80, 'gesture-1');
      registry.register(plugin1);

      const list1 = registry.list();

      const plugin2 = new MockGesturePlugin('plugin-2', 90, 'gesture-2');
      registry.register(plugin2);

      const list2 = registry.list();

      // Should return different array reference (cache invalidated)
      expect(list1).not.toBe(list2);
      // New plugin should be first (higher priority)
      expect(list2[0]).toBe(plugin2);
    });

    it('should invalidate cache on unregister', () => {
      const plugin1 = new MockGesturePlugin('plugin-1', 80, 'gesture-1');
      const plugin2 = new MockGesturePlugin('plugin-2', 60, 'gesture-2');

      registry.register(plugin1);
      registry.register(plugin2);

      const list1 = registry.list();

      registry.unregister('plugin-1');

      const list2 = registry.list();

      // Should return different array reference (cache invalidated)
      expect(list1).not.toBe(list2);
      expect(list2).toHaveLength(1);
      expect(list2[0]).toBe(plugin2);
    });

    it('should invalidate cache on clear', () => {
      registry.register(new MockGesturePlugin('plugin-1', 80, 'gesture-1'));

      const list1 = registry.list();

      registry.clear();

      const list2 = registry.list();

      // Should return different array reference (cache invalidated)
      expect(list1).not.toBe(list2);
      expect(list2).toHaveLength(0);
    });
  });

  describe('gesture detection priority', () => {
    it('should check high priority gestures first', () => {
      const builtinPinch = new MockGesturePlugin('builtin:pinch', 80, 'pinch', true);
      const customThumbsUp = new MockGesturePlugin('custom:thumbs-up', 70, 'thumbs-up', true);
      const builtinPoint = new MockGesturePlugin('builtin:point', 60, 'point', true);

      registry.register(builtinPoint);
      registry.register(customThumbsUp);
      registry.register(builtinPinch);

      const plugins = registry.list();

      // Order should be: pinch (80), thumbs-up (70), point (60)
      expect(plugins[0].gestureType).toBe('pinch');
      expect(plugins[1].gestureType).toBe('thumbs-up');
      expect(plugins[2].gestureType).toBe('point');
    });
  });
});
