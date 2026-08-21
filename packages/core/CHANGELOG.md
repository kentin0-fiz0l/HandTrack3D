# @handtrack3d/core Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
