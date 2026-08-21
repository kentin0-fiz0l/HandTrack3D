# @handtrack3d/rapier Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0-alpha.0] - 2026-08-21

### Added

#### Physics Adapter System
- `PhysicsAdapter<TBody>` interface for physics engine abstraction
- `BodyType` enum (Dynamic, Kinematic, Static)
- `RapierAdapter` class implementing `PhysicsAdapter` for Rapier physics

#### Interaction Plugins
- `GrabPlugin` class for grab-hold-throw mechanics
  - Automatic grab detection (proximity + pinch gesture)
  - Offset tracking for natural grab feel
  - Throw velocity calculation
  - Multi-hand support
  - Query methods: `isGrabbed()`, `isGrabbedBy()`, `getGrabbedObject()`
- `HandState` interface for hand tracking data

#### Utilities
- `calculateThrowVelocity()` - Compute velocity from position history
- `applyDamping()` - Apply exponential damping to velocity
- `calculateSmoothedVelocity()` - Smoothed velocity with noise reduction
- `clampMagnitude()` - Limit vector magnitude
- `isWithinBounds()` - Check if position is within bounds

#### React Hooks
- `usePhysicsGrab()` - Memoized GrabPlugin hook for React Three Fiber

#### Documentation
- Comprehensive README with API reference
- Migration guide from embedded physics
- Code examples for common use cases
- CHANGELOG

### Changed
- Package version bumped to 0.2.0-alpha.0
- Updated exports to include utilities and hooks

## [0.1.0-alpha.0] - 2026-08-20

### Added
- Initial package structure
- Placeholder exports for future Rapier integration
- Package configuration and build setup
- TypeScript definitions

---

## Release Notes

### v0.2.0-alpha.0 - Plugin System Release

This release transforms the rapier package from a placeholder into a fully functional physics adapter system. The key innovation is the `PhysicsAdapter` interface, which decouples HandTrack3D from specific physics engines.

**Highlights:**
- **Zero Breaking Changes** - Existing code continues to work
- **Physics Agnostic** - Support for Rapier, Cannon.js, Ammo.js, etc.
- **Production Ready** - Used in HandTrack3D showcase app
- **Well Documented** - Comprehensive API reference and examples

**Migration:**
Users upgrading from embedded physics (InteractiveObject v0.1.x) can reduce ~50 lines of manual physics code to 4 lines using `usePhysicsGrab()`.

**Next Steps:**
- v0.3.0 will add example adapters for Cannon.js and Ammo.js
- v0.4.0 will add advanced interaction plugins (point-select, two-handed grab)
