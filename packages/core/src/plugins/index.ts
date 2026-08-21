/**
 * Plugin system exports
 *
 * HandTrack3D plugin system enables extensibility through:
 * - Custom gesture detection (GesturePlugin)
 * - Custom interactions (InteractionPlugin)
 * - Pluggable registries for lifecycle management
 */

export type {
  BasePlugin,
  GesturePlugin,
  InteractionPlugin,
  InteractionEvent,
  InteractionEventType,
  EventListener,
} from './types';

export { PluginRegistry, GesturePluginRegistry } from './registry';
