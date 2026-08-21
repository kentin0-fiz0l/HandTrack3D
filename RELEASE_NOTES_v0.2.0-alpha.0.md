# Release Notes: HandTrack3D v0.2.0-alpha.0

**Release Date**: August 21, 2026
**Type**: Alpha Release (Breaking Change: None)
**Focus**: Plugin System & Extensibility

---

## 🎉 What's New

HandTrack3D has been transformed from a monolithic library into an **extensible plugin platform**. Developers can now create custom gestures, interactions, and physics adapters without modifying core code.

### New Package: @handtrack3d/rapier

A new physics abstraction package providing:
- `PhysicsAdapter` interface for engine-agnostic physics
- `RapierAdapter` for Rapier physics engine
- `GrabPlugin` - reusable grab interaction logic
- Physics utilities (velocity calculation, damping, clamping)
- React hooks (`usePhysicsGrab`)

### Plugin System (@handtrack3d/core)

**Three Plugin Types**:

1. **GesturePlugin** - Custom gesture detection
   - Priority-based matching (0-100 scale)
   - Built-in gestures converted to plugins
   - Example: `ASLThumbsUpGesturePlugin`, `ASLThumbsDownGesturePlugin`

2. **InteractionPlugin** - 3D interaction behaviors
   - Event-driven architecture
   - Example: `PointSelectPlugin` (point-to-select with raycasting)

3. **PhysicsAdapter** - Physics engine abstraction
   - Unified API across engines
   - Example: `CannonAdapter` for Cannon.js

### Core Enhancements

- `GestureDetector` now plugin-based
  - `registerGesture(plugin)` - add custom gestures
  - `unregisterGesture(name)` - remove gestures
  - Automatic priority sorting
- `GestureType` extended to allow custom strings
- Plugin registry with lifecycle management

---

## 📦 Installation

```bash
# Install alpha release
npm install @handtrack3d/core@alpha
npm install @handtrack3d/react@alpha
npm install @handtrack3d/three@alpha
npm install @handtrack3d/rapier@alpha

# Or specific version
npm install @handtrack3d/core@0.2.0-alpha.0
```

---

## 🚀 Quick Start: Custom Gesture

```typescript
import { GestureDetector, GesturePlugin } from '@handtrack3d/core';

class ThumbsUpPlugin implements GesturePlugin {
  readonly name = 'custom:thumbs-up';
  readonly priority = 70;
  readonly gestureType = 'thumbs-up';

  detect(landmarks, settings) {
    const thumbUp = landmarks[4].y < landmarks[2].y;
    const fingersCurled = /* check fingers */;
    return thumbUp && fingersCurled;
  }
}

const detector = new GestureDetector();
detector.registerGesture(new ThumbsUpPlugin());

const gesture = detector.detectGesture(landmarks); // Can detect 'thumbs-up'
```

---

## 🚀 Quick Start: Physics Abstraction

```typescript
import { GrabPlugin, RapierAdapter } from '@handtrack3d/rapier';

const adapter = new RapierAdapter();
const grabPlugin = new GrabPlugin(adapter, {
  grabRadius: 0.5,
  throwVelocityScale: 60,
});

// In render loop
grabPlugin.update(hand, rigidBodies);
```

---

## 🔄 Backward Compatibility

**100% backward compatible** - All v0.1.0 code works unchanged:

```typescript
// ✅ Still works
import { detectPinch, detectPoint } from '@handtrack3d/core';
const isPinching = detectPinch(landmarks);

// ✅ Still works
const detector = new GestureDetector();
const gesture = detector.detectGesture(landmarks);
```

---

## 📚 Documentation

### New Tutorials
- [Building Custom Gesture Plugins](examples/custom-gesture-plugin.md) (470 lines)
- [Building Custom Interaction Plugins](examples/custom-interaction-plugin.md) (450 lines)
- [Building Physics Adapters](examples/custom-physics-adapter.md) (420 lines)

### Package Documentation
- [@handtrack3d/rapier README](packages/rapier/README.md) (480+ lines)
- [CHANGELOG](CHANGELOG.md) (comprehensive version history)
- [Integration Test Results](INTEGRATION_TEST_RESULTS.md)
- [Phase 2 Summary](PHASE_2_COMPLETE.md)

---

## 📊 Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Gesture detection | <1ms | <0.7ms | ✅ 30% better |
| Grab interaction | <0.5ms | <0.3ms | ✅ 40% better |
| Plugin overhead | <0.1ms | <0.1ms | ✅ On target |
| FPS impact | <1ms | ~0.5ms | ✅ 50% better |

**Bundle Size**:
- Core: +3 KB (+13%) - plugin system overhead
- Rapier: 11 KB (new package)
- Total: +14 KB (~7 KB gzipped)

---

## 🛠️ Breaking Changes

**None** - This is a fully backward-compatible release.

---

## 📝 Example Plugins Included

### Gesture Plugins
- **ASLThumbsUpGesturePlugin** - American Sign Language thumbs up
- **ASLThumbsDownGesturePlugin** - American Sign Language thumbs down

### Interaction Plugins
- **PointSelectPlugin** - Point-to-select with raycasting and hover detection

### Physics Adapters
- **RapierAdapter** - Rapier physics engine (production)
- **CannonAdapter** - Cannon.js physics engine (example)

---

## 🧪 Testing

- **Unit Tests**: 40/40 passing (20 new tests added)
- **Integration Tests**: Showcase app refactored to use `GrabPlugin`
- **Type Safety**: 0 TypeScript errors, strict null checks
- **Build**: All 5 packages compile successfully

---

## 🔗 Links

- **npm Packages**:
  - https://www.npmjs.com/package/@handtrack3d/core
  - https://www.npmjs.com/package/@handtrack3d/react
  - https://www.npmjs.com/package/@handtrack3d/three
  - https://www.npmjs.com/package/@handtrack3d/rapier

- **GitHub Repository**: https://github.com/kentin0-fiz0l/HandTrack3D
- **Documentation**: Coming soon
- **Issues**: https://github.com/kentin0-fiz0l/HandTrack3D/issues

---

## 🙏 Credits

Built with:
- MediaPipe Hands (Google)
- Three.js & React Three Fiber
- Rapier Physics Engine
- TypeScript, Vite, pnpm

---

## 🚦 What's Next?

### For v0.3.0 (Future)
- Plugin marketplace / discovery
- Additional physics adapters (Cannon.js, Ammo.js official support)
- More gesture plugins (swipe, pinch-to-zoom, two-hand gestures)
- Performance profiling tools
- Plugin debugging utilities

### Get Involved
- Try the alpha: `npm install @handtrack3d/core@alpha`
- Report issues: [GitHub Issues](https://github.com/kentin0-fiz0l/HandTrack3D/issues)
- Share your plugins!
- Star the repo ⭐

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Released**: August 21, 2026
**Author**: Kentino
**Co-Authored-By**: Claude Opus 4.6
