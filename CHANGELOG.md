# Changelog

All notable changes to HandTrack3D will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0-alpha.0] - 2026-08-21

### Added - Plugin System (Phase 2)

#### Core Package (@handtrack3d/core)

**Plugin System Foundation**
- Added `BasePlugin`, `GesturePlugin`, and `InteractionPlugin` interfaces
- Added `PluginRegistry<T>` generic class with priority-based sorting
- Added `GesturePluginRegistry` specialized registry
- Extended `GestureType` to support custom gesture strings
- Added plugin lifecycle methods (initialize, dispose)

**Built-in Gesture Plugins**
- Converted built-in gestures to plugins:
  - `PinchGesturePlugin` (priority: 80)
  - `PointGesturePlugin` (priority: 80)
  - `FistGesturePlugin` (priority: 75)
  - `OpenHandGesturePlugin` (priority: 75)
- Maintained backward compatibility with standalone functions

**Example Gesture Plugins**
- Added `ASLThumbsUpGesturePlugin` demonstrating custom gestures
- Added `ASLThumbsDownGesturePlugin` for ASL sign language detection

**GestureDetector Enhancements**
- Added `registerGesture(plugin)` method for custom gestures
- Added `unregisterGesture(name)` method to remove plugins
- Added priority-based gesture detection with caching
- Maintained backward compatibility (all existing code works unchanged)

**Testing**
- Added 20+ new tests for plugin system
- Total test coverage: 40 tests passing
- Tests for priority ordering, plugin lifecycle, custom gestures

#### Rapier Package (@handtrack3d/rapier) - NEW

**Physics Adapter System**
- Added `PhysicsAdapter<TBody>` interface for engine abstraction
- Added `RapierAdapter` implementing PhysicsAdapter for Rapier physics
- Added `BodyType` enum (Dynamic, Kinematic, Static)
- Decoupled physics logic from specific engine implementation

**GrabPlugin**
- Extracted grab interaction logic into reusable plugin
- Features:
  - Proximity-based grab detection
  - Offset tracking for natural holding
  - Throw velocity calculation on release
  - Multi-hand support
- Configurable options (grabRadius, throwVelocityScale, etc.)
- Internal state management (no external store required)

**Physics Utilities**
- Added `calculateThrowVelocity()` for velocity from position history
- Added `applyDamping()` for velocity damping
- Added `clampMagnitude()` for vector magnitude clamping
- Added `isInGrabRange()` for proximity detection
- Added `calculateGrabOffset()` for hand-to-object offset

**React Integration**
- Added `usePhysicsGrab()` hook for memoized GrabPlugin instances
- Optimized for React Three Fiber workflows

**Example Adapters**
- Added `CannonAdapter` example for Cannon.js physics engine (250 lines)
- Demonstrates how to create adapters for other engines

#### Three Package (@handtrack3d/three)

**Example Interaction Plugins**
- Added `PointSelectPlugin` for point-to-select interactions
- Features:
  - Raycasting from index finger
  - Hover detection with configurable duration
  - Selection events (select, deselect, hover)
  - Visual feedback support

### Changed

#### Core Package
- Refactored `GestureDetector.detectGesture()` to use plugin registry
- Changed gesture detection to priority-based (high priority checked first)
- Improved performance with plugin list caching

#### Showcase App
- Refactored `InteractiveObject` component to use `GrabPlugin`
- Reduced component size: 165 lines → 145 lines (-12%)
- Removed 60 lines of embedded physics code
- Improved separation of concerns (physics in plugin, visuals in component)
- Maintained all existing visual feedback and interactions

### Deprecated

#### Showcase App (sceneStore)
- `grabObject()` - replaced by `GrabPlugin.update()`
- `releaseObject()` - replaced by `GrabPlugin.update()`
- `updateObjectPosition()` - replaced by `GrabPlugin.update()`
- `isObjectGrabbed()` - replaced by `GrabPlugin.isGrabbed()`

**Note**: These methods remain functional for backward compatibility but are no longer used internally. Will be removed in v1.0.0.

### Documentation

**Tutorials Added**
- `examples/custom-gesture-plugin.md` (470 lines) - Building custom gestures
- `examples/custom-interaction-plugin.md` (450 lines) - Building Three.js interactions
- `examples/custom-physics-adapter.md` (420 lines) - Implementing physics adapters
- `examples/README.md` (62 lines) - Examples overview

**Package Documentation**
- Added comprehensive `packages/rapier/README.md` (480+ lines)
- Updated API documentation for all plugin interfaces
- Added migration guide for Phase 2 (zero breaking changes)

### Performance

**Bundle Size**
- Core package: +3 KB (+13%) for plugin system
- New rapier package: 11 KB (physics abstraction)
- Total increase: ~14 KB (~64% increase from base)
- Gzipped impact: ~7 KB estimated

**Runtime Performance** (targets met)
- Gesture detection: <0.7ms per frame ✅ (target: <1ms)
- Grab interaction: <0.3ms per frame ✅ (target: <0.5ms)
- Plugin overhead: <0.1ms ✅

**Optimization**
- Plugin list caching for priority-based detection
- Lazy plugin initialization
- Memoized plugin instances in React hooks

### Developer Experience

**Type Safety**
- Full TypeScript support for all plugin interfaces
- Generic type parameters for PhysicsAdapter<TBody>
- Strict null checks throughout
- Comprehensive JSDoc comments

**Extensibility**
- Three plugin types: GesturePlugin, InteractionPlugin, PhysicsAdapter
- Priority-based gesture detection (0-100 scale)
- Event-driven interaction system
- Hot-swappable physics engines

**Backward Compatibility**
- ✅ Zero breaking changes
- ✅ All existing APIs work unchanged
- ✅ Standalone gesture functions still available
- ✅ Opt-in plugin system (progressive enhancement)

### Testing

**Test Coverage**
- Core package: 40 tests passing (20 new tests added)
- Rapier package: Tests for GrabPlugin, adapters, utilities
- Integration tests: Showcase app with refactored component
- Performance tests: FPS impact monitoring

**CI/CD**
- All packages build successfully
- TypeScript compilation: 0 errors
- Linting: 0 errors
- Test suite: 100% passing

## [0.1.0-alpha.0] - 2026-08-20

### Added

Initial alpha release with three packages:

#### @handtrack3d/core
- MediaPipe hand tracking integration
- Gesture detection (pinch, point, fist, open hand)
- Hand landmark processing and utilities
- TypeScript support with full type definitions

#### @handtrack3d/react
- React hooks for hand tracking
- Component wrappers for MediaPipe
- State management with Zustand
- TypeScript support

#### @handtrack3d/three
- Three.js integration utilities
- Hand cursor visualization (3D sphere, skeleton)
- Coordinate mapping utilities (landmark to 3D space)
- Interaction helpers (grab, point)

#### Showcase App
- Interactive 3D scene with hand tracking
- Grab and throw physics with Rapier
- Hand gesture recognition
- Real-time webcam tracking

#### Documentation
- VitePress documentation site
- Getting started guide
- API reference
- Example code snippets

### Features

**Hand Tracking**
- Real-time hand detection via webcam
- 21 landmark points per hand
- Multi-hand support (up to 2 hands)
- Gesture recognition system

**3D Interaction**
- Grab objects with pinch gesture
- Throw objects with velocity
- Point interaction with raycasting
- Physics simulation with Rapier

**Developer Experience**
- TypeScript throughout
- React hooks and components
- Framework-agnostic core
- Comprehensive documentation

---

## Version History

- **0.2.0-alpha.0** (2026-08-21): Plugin System - Extensibility through GesturePlugin, InteractionPlugin, PhysicsAdapter
- **0.1.0-alpha.0** (2026-08-20): Initial Release - Core hand tracking, React bindings, Three.js integration

## Upgrade Guide

### From 0.1.0-alpha.0 to 0.2.0-alpha.0

**No Breaking Changes** - All existing code works unchanged.

#### Optional: Migrate to Plugin System

**Before (0.1.0-alpha.0)**:
```typescript
import { detectPinch, detectPoint } from '@handtrack3d/core';

const isPinch = detectPinch(landmarks);
const isPoint = detectPoint(landmarks);
```

**After (0.2.0-alpha.0)** - Optional, for custom gestures:
```typescript
import { GestureDetector, ASLThumbsUpGesturePlugin } from '@handtrack3d/core';

const detector = new GestureDetector();
detector.registerGesture(new ASLThumbsUpGesturePlugin());

const gesture = detector.detectGesture(landmarks); // Can detect "thumbs-up"
```

#### Optional: Migrate to GrabPlugin

**Before (0.1.0-alpha.0)** - Manual physics in component:
```typescript
// 60 lines of embedded grab/release/throw logic
```

**After (0.2.0-alpha.0)** - Use GrabPlugin:
```typescript
import { GrabPlugin, RapierAdapter } from '@handtrack3d/rapier';

const grabPlugin = new GrabPlugin(new RapierAdapter());
grabPlugin.update(hand, rigidBodies);
```

See `INTEGRATION_TEST_RESULTS.md` for detailed migration guide.

## Links

- [Documentation](https://handtrack3d.dev)
- [GitHub Repository](https://github.com/username/HandTrack3D)
- [npm - @handtrack3d/core](https://www.npmjs.com/package/@handtrack3d/core)
- [npm - @handtrack3d/react](https://www.npmjs.com/package/@handtrack3d/react)
- [npm - @handtrack3d/three](https://www.npmjs.com/package/@handtrack3d/three)
- [npm - @handtrack3d/rapier](https://www.npmjs.com/package/@handtrack3d/rapier)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.
