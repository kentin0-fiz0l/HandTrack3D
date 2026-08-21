/**
 * React hook for physics-based grab interactions
 *
 * Provides a memoized GrabPlugin instance with automatic cleanup.
 */

import { useMemo } from 'react';
import { GrabPlugin } from '../interactions/GrabPlugin';
import { RapierAdapter } from '../adapters/RapierAdapter';
import type { GrabPluginOptions } from '../interactions/GrabPlugin';

/**
 * Hook for creating a physics grab interaction plugin
 *
 * Returns a memoized GrabPlugin instance configured with RapierAdapter.
 * The plugin instance is stable across re-renders (created only once).
 *
 * @param options - Optional grab plugin configuration
 * @returns GrabPlugin instance
 *
 * @example
 * ```typescript
 * function InteractiveObject({ object }) {
 *   const grabPlugin = usePhysicsGrab({
 *     grabRadius: 0.5,
 *     throwVelocityScale: 60,
 *   });
 *
 *   useFrame(() => {
 *     const hand = { id: 'left', position: cursor.position, gesture: 'pinch' };
 *     const rigidBodies = new Map([[object.id, rigidBodyRef.current]]);
 *     grabPlugin.update(hand, rigidBodies);
 *   });
 *
 *   const isGrabbed = grabPlugin.isGrabbed(object.id);
 *   // ... render logic
 * }
 * ```
 */
export function usePhysicsGrab(options?: GrabPluginOptions) {
  const grabPlugin = useMemo(() => {
    const adapter = new RapierAdapter();
    return new GrabPlugin(adapter, options);
  }, []); // Empty deps - create once and reuse

  return grabPlugin;
}
