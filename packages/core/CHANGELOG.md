# @handtrack3d/core Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0-alpha.2] - 2026-08-21

### Added

#### Multi-Hand Gesture Detection System
- `MultiHandGestureDetector` - New detector for gestures requiring 2+ hands
- `MultiHandGesturePlugin` interface for custom multi-hand gestures
- `MultiHandGestureResult` type for detailed detection results
- `MultiHandGesturePluginRegistry` with priority-based sorting
- `detectGestureDetailed()` method returns gesture metadata

#### Built-in Multi-Hand Gesture Plugins
- `TwoHandScaleGesturePlugin` (priority 70)
  * Detects pinch zoom with both hands
  * Tracks distance changes over time
  * Returns scale delta (positive = zoom in, negative = zoom out)
  * Configurable: `minDistance`, `distanceThreshold`, `maxDuration`, `historySamples`

- `TwoHandRotateGesturePlugin` (priority 70)
  * Detects rotation when both hands are gripping
  * Tracks angle changes with wrapping (-π to π)
  * Returns rotation delta in radians
  * Configurable: `angleThreshold`, `maxDuration`, `historySamples`

- `ClapGesturePlugin` (priority 80)
  * Detects rapid hand approach (clapping motion)
  * Velocity-based detection with cooldown period
  * Prevents rapid re-triggering
  * Configurable: `clapDistance`, `clapVelocity`, `cooldownMs`, `maxDuration`

#### Swipe Gesture Plugins
- `SwipeLeftGesturePlugin` - Horizontal swipe left detection
- `SwipeRightGesturePlugin` - Horizontal swipe right detection
- `SwipeUpGesturePlugin` - Vertical swipe up detection
- `SwipeDownGesturePlugin` - Vertical swipe down detection
- Velocity-based with configurable thresholds and directional sensitivity

#### Example Gesture Plugins
- `ASLThumbsUpGesturePlugin` - American Sign Language thumbs-up
- `ASLThumbsDownGesturePlugin` - American Sign Language thumbs-down

### Documentation
- Complete guide: `examples/two-hand-gestures.md` (570 lines)
- Real-world examples: 3D model viewer, image gallery, clap game
- Swipe gesture guide: `examples/swipe-gesture-detection.md` (380 lines)
- Cannon.js physics adapter guide: `examples/cannon-physics-adapter.md` (480 lines)
- API reference and TypeScript usage
- Performance tips and troubleshooting

### Testing
- 30 tests for MultiHandGestureDetector
- 24 tests for multi-hand gesture plugins (Scale, Rotate, Clap)
- 12 tests for swipe gesture plugins
- 25 tests for Cannon.js physics adapter
- Total: 95 tests passing

### Changed
- Package version bumped to 0.2.0-alpha.2
- Enhanced plugin system to support multi-hand detection
- Improved type definitions for custom gesture types

### Backward Compatibility
- ✅ All v0.2.0-alpha.0 features still work
- ✅ Single-hand GestureDetector unchanged
- ✅ No breaking changes
- ✅ Additive API only

## [0.2.0-alpha.0] - 2026-08-21

### Added

#### Plugin System
- `BasePlugin` interface for all plugins
- `GesturePlugin` interface for custom gesture detection
- `InteractionPlugin` interface for 3D interactions
- `PluginRegistry<T>` generic registry class
- `GesturePluginRegistry` with priority-based sorting
- Plugin lifecycle methods: `initialize()`, `dispose()`

#### Built-in Gesture Plugins
- `PinchGesturePlugin` (priority 80)
- `PointGesturePlugin` (priority 60)
- `FistGesturePlugin` (priority 40)
- `OpenHandGesturePlugin` (priority 40)

#### GestureDetector Enhancements
- `registerGesture(plugin)` - Register custom gestures
- `unregisterGesture(name)` - Remove gestures
- `getGesturePlugins()` - List all registered gestures
- `hasGesture(name)` - Check if gesture is registered
- Option to disable built-in gestures: `new GestureDetector({}, { registerBuiltins: false })`

#### Type System
- `GestureType` now allows custom gesture strings
- `InteractionEvent<T>` and `InteractionEventType` for plugin events
- `EventListener<T>` callback type

### Changed
- `GestureDetector` now uses plugin-based detection internally
- Gesture detection order determined by plugin priority (higher first)
- Package version bumped to 0.2.0-alpha.0

### Backward Compatibility
- ✅ All standalone functions still work (`detectPinch`, `detectOpenHand`, etc.)
- ✅ `GestureDetector` API unchanged (auto-registers built-in gestures)
- ✅ Zero breaking changes for existing code

## [0.1.0-alpha.0] - 2026-08-20

### Added
- Core hand tracking with MediaPipe Hands
- Built-in gesture detection (pinch, open, fist, point)
- `GestureDetector` class for stateful recognition
- Coordinate mapping utilities
- Collision detection utilities
- TypeScript definitions
- Comprehensive test suite
