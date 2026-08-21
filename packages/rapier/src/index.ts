/**
 * @handtrack3d/rapier
 * Rapier physics adapter for hand tracking
 */

export const version = '0.2.0-alpha.0';

// Physics adapters
export type { PhysicsAdapter } from './adapters';
export { BodyType, RapierAdapter } from './adapters';

// Interaction plugins
export { GrabPlugin } from './interactions';
export type { GrabPluginOptions, HandState } from './interactions';

// Utilities
export {
  calculateThrowVelocity,
  applyDamping,
  calculateSmoothedVelocity,
  clampMagnitude,
  isWithinBounds,
} from './utils';

// React hooks
export { usePhysicsGrab } from './hooks';
