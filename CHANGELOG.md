# HandTrack3D Changelog

All notable changes to the HandTrack3D monorepo will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0-alpha.2] - 2026-08-21

### 🎉 Major Release: Multi-Hand Gesture Detection

This release introduces a comprehensive multi-hand gesture detection system, enabling applications to detect gestures that require coordination between two or more hands (scale, rotate, clap).

### Packages Released

- `@handtrack3d/core@0.2.0-alpha.2`
- `@handtrack3d/react@0.2.0-alpha.2`
- `@handtrack3d/three@0.2.0-alpha.2`
- `@handtrack3d/rapier@0.2.0-alpha.2`

### ✨ New Features

#### @handtrack3d/core

**Multi-Hand Gesture System**
- `MultiHandGestureDetector` - Detect gestures requiring 2+ hands
- `MultiHandGesturePlugin` interface for custom multi-hand gestures
- Priority-based plugin system (0-100, higher = checked first)
- Detailed detection results with metadata

**Built-in Multi-Hand Gestures**
1. **Two-Hand Scale** (priority 70) - Pinch zoom with both hands
2. **Two-Hand Rotate** (priority 70) - Rotation with both hands gripping
3. **Clap** (priority 80) - Rapid hand approach detection

**Swipe Gesture Plugins** - Left, Right, Up, Down with velocity-based detection

#### @handtrack3d/rapier

**Example Physics Adapters**
- `CannonAdapter` - Cannon.js physics adapter validating multi-engine support

### 📚 Documentation (1,430 lines added)

- `examples/two-hand-gestures.md` - Complete multi-hand API reference
- `examples/swipe-gesture-detection.md` - Swipe gesture guide
- `examples/cannon-physics-adapter.md` - Physics engine migration guide

### 🧪 Testing

- 95 tests passing (58 new tests added)
- Full integration test coverage
- Zero breaking changes verified

### ✅ Backward Compatibility

- All v0.2.0-alpha.0 features unchanged
- Zero migration required

---

## [0.2.0-alpha.0] - 2026-08-21

### Added
- Plugin system architecture
- Built-in gesture plugins (Pinch, Point, Fist, Open)
- Physics adapter system
- GrabPlugin for Rapier

---

## [0.1.0-alpha.0] - 2026-08-20

### Added
- Initial package release
- Core hand tracking with MediaPipe
- React hooks and components
- Three.js integration
