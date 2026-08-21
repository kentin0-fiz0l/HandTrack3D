/**
 * Plugin registry system
 *
 * Manages plugin lifecycle (registration, lookup, disposal).
 * Supports priority-based plugin ordering for gesture detection.
 */

import type { BasePlugin, GesturePlugin } from './types';

/**
 * Generic plugin registry
 *
 * @template T - Plugin type (must extend BasePlugin)
 */
export class PluginRegistry<T extends BasePlugin> {
  /** Registered plugins mapped by name */
  protected plugins = new Map<string, T>();

  /**
   * Register a plugin
   * @param plugin - Plugin instance to register
   * @throws Error if plugin with same name already exists
   */
  register(plugin: T): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(
        `Plugin "${plugin.name}" is already registered. ` +
        `Unregister it first or use a unique name.`
      );
    }

    // Initialize plugin if it has an initialize method
    if (plugin.initialize) {
      const result = plugin.initialize();
      // Handle async initialization
      if (result instanceof Promise) {
        result.catch((error) => {
          console.error(`Failed to initialize plugin "${plugin.name}":`, error);
        });
      }
    }

    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Unregister a plugin by name
   * @param name - Plugin name to unregister
   * @returns True if plugin was found and removed
   */
  unregister(name: string): boolean {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      return false;
    }

    // Dispose plugin if it has a dispose method
    if (plugin.dispose) {
      const result = plugin.dispose();
      // Handle async disposal
      if (result instanceof Promise) {
        result.catch((error) => {
          console.error(`Failed to dispose plugin "${plugin.name}":`, error);
        });
      }
    }

    return this.plugins.delete(name);
  }

  /**
   * Get a plugin by name
   * @param name - Plugin name
   * @returns Plugin instance or undefined
   */
  get(name: string): T | undefined {
    return this.plugins.get(name);
  }

  /**
   * Check if a plugin is registered
   * @param name - Plugin name
   * @returns True if plugin exists
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Get all registered plugins
   * @returns Array of all plugins
   */
  list(): T[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Clear all plugins
   * Calls dispose() on each plugin before removing
   */
  clear(): void {
    for (const plugin of this.plugins.values()) {
      if (plugin.dispose) {
        const result = plugin.dispose();
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(`Failed to dispose plugin "${plugin.name}":`, error);
          });
        }
      }
    }
    this.plugins.clear();
  }

  /**
   * Get the number of registered plugins
   * @returns Plugin count
   */
  get size(): number {
    return this.plugins.size;
  }
}

/**
 * Gesture plugin registry with priority-based sorting
 *
 * Gestures are checked in priority order (highest first).
 * Built-in gesture priorities:
 * - pinch: 80
 * - point: 60
 * - fist: 40
 * - open: 40
 */
export class GesturePluginRegistry extends PluginRegistry<GesturePlugin> {
  /** Cached sorted plugin list (invalidated on register/unregister) */
  private sortedCache: GesturePlugin[] | null = null;

  /**
   * Register a gesture plugin and invalidate sort cache
   * @param plugin - Gesture plugin to register
   */
  register(plugin: GesturePlugin): void {
    super.register(plugin);
    this.sortedCache = null; // Invalidate cache
  }

  /**
   * Unregister a gesture plugin and invalidate sort cache
   * @param name - Plugin name to unregister
   * @returns True if plugin was removed
   */
  unregister(name: string): boolean {
    const removed = super.unregister(name);
    if (removed) {
      this.sortedCache = null; // Invalidate cache
    }
    return removed;
  }

  /**
   * Get plugins sorted by priority (highest first)
   * Results are cached until register/unregister is called
   * @returns Sorted array of gesture plugins
   */
  list(): GesturePlugin[] {
    if (this.sortedCache) {
      return this.sortedCache;
    }

    // Sort by priority (descending), then by name (ascending) for stability
    this.sortedCache = Array.from(this.plugins.values()).sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.name.localeCompare(b.name); // Alphabetical for same priority
    });

    return this.sortedCache;
  }

  /**
   * Clear all plugins and reset cache
   */
  clear(): void {
    super.clear();
    this.sortedCache = null;
  }
}
