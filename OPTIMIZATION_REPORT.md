# Scene3D Store Subscription Optimization Report

## Summary

Optimized Scene3D component to reduce unnecessary re-renders by converting whole-store subscriptions to fine-grained selectors with shallow equality checking.

## Changes Made

### 1. Scene3D.tsx (`/Users/kentino/Projects/Active/HandTrack3D/src/components/HandTrackingCanvas/Scene3D.tsx`)

#### Before
```typescript
const objects = useSceneStore((state) => state.objects);
const buildMode = useSceneStore((state) => state.buildMode);
const grabbedObjects = useSceneStore((state) => state.grabbedObjects);
const getNearObjects = useSceneStore((state) => state.getNearObjects);
```

**Problem**: Each selector creates a separate subscription. `getNearObjects` is a function that doesn't change, but subscribing to it causes re-renders on every store update.

#### After
```typescript
// Combined subscription with shallow equality
const { objects, buildMode, grabbedObjects } = useSceneStore(
  (state) => ({
    objects: state.objects,
    buildMode: state.buildMode,
    grabbedObjects: state.grabbedObjects,
  }),
  shallow
);

// Function access via getState() - no subscription
const getNearObjects = useCallback(() => {
  return useSceneStore.getState().getNearObjects;
}, []);

// Usage: getNearObjects()(position, range)
```

**Benefits**:
- Reduced subscriptions from 4 to 1
- Shallow equality prevents re-renders when object references don't change
- Function access via `getState()` eliminates subscription overhead

### 2. GrabRangeSphere.tsx (`/Users/kentino/Projects/Active/HandTrack3D/src/components/HandTrackingCanvas/GrabRangeSphere.tsx`)

#### Before
```typescript
const getNearObjects = useSceneStore((state) => state.getNearObjects);
```

#### After
```typescript
const getNearObjects = useCallback(() => {
  return useSceneStore.getState().getNearObjects;
}, []);

// Usage in useMemo:
const nearObjects = getNearObjects()(position, grabRange);
```

**Benefits**:
- Eliminates unnecessary subscription to a stable function
- Reduces re-render cascade from parent to child

### 3. Performance Instrumentation

Added React Profiler and render counting:

```typescript
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration, ...) => {
  if (phase === 'update' && actualDuration > 16) {
    console.log(`[Scene3D Profiler] ${phase}: ${actualDuration.toFixed(2)}ms`);
  }
};

// Wrapped component in Profiler
<Profiler id="Scene3D" onRender={onRenderCallback}>
  {/* Scene contents */}
</Profiler>

// Development render counter
const renderCountRef = useRef(0);
useEffect(() => {
  renderCountRef.current += 1;
  if (renderCountRef.current % 10 === 0) {
    console.log(`[Scene3D] Rendered ${renderCountRef.current} times`);
  }
});
```

## Expected Performance Improvements

### Before Optimization
- **Estimated re-renders per state change**: 6+ (one per subscription + cascades)
- **Re-render triggers**: Any store update, even unrelated state

### After Optimization
- **Target re-renders per meaningful change**: 1-2
- **Re-render triggers**: Only when `objects`, `buildMode`, or `grabbedObjects` change (shallow comparison)
- **Function subscriptions eliminated**: `getNearObjects` no longer triggers re-renders

## Testing Checklist

1. **Build Verification**
   - [x] TypeScript compilation passes
   - [x] No linting errors
   - [ ] Production build successful

2. **Functional Testing**
   - [ ] Hand tracking works at 58-60fps with 2 hands
   - [ ] Object grabbing/releasing works correctly
   - [ ] Build mode ghost preview works
   - [ ] Tutorial state tracking works
   - [ ] Gesture detection works

3. **Performance Verification**
   - [ ] Check browser console for render count logs
   - [ ] Use React DevTools Profiler to measure actual render count
   - [ ] Verify renders stay under 16ms per frame
   - [ ] Monitor FPS with PerformanceMonitor component

4. **Regression Testing**
   - [ ] No memory leaks in long sessions
   - [ ] No visual glitches
   - [ ] State remains consistent

## Monitoring

### Console Logs to Watch

1. **Render counting** (every 10 renders):
   ```
   [Scene3D] Rendered 10 times
   [Scene3D] Rendered 20 times
   ```

2. **Slow renders** (>16ms):
   ```
   [Scene3D Profiler] update: 18.45ms
   ```

### How to Measure Success

1. Open browser DevTools Console
2. Enable React DevTools Profiler
3. Start recording
4. Interact with scene (grab objects, toggle build mode, move hands)
5. Stop recording
6. Verify:
   - Render count increases by 1-2 per state change (not 6+)
   - No >16ms renders during normal interaction
   - FPS stays at 58-60 with 2 hands

## Additional Optimization Opportunities

If further optimization is needed, consider:

1. **Memoize expensive computations**:
   - `handSkeletons` mapping (already memoized)
   - Tutorial state calculations

2. **Split Scene3D into smaller components**:
   - Separate physics/lighting setup
   - Isolate tutorial tracking logic

3. **Optimize other store subscribers**:
   - `ObjectPropertyEditor.tsx` (7 subscriptions)
   - `InteractiveObject.tsx` (4 subscriptions)
   - `BuildModeController.tsx` (3 subscriptions)

4. **Use Zustand middleware**:
   - Add `devtools` for debugging
   - Add `persist` for state hydration (already planned in Task #2)

## Related Tasks

- Task #6: Optimize Scene3D store subscriptions (this task)
- Task #2: Add property persistence to saved scenes
- Task #5: Add Zustand persistence middleware

## Files Modified

1. `/Users/kentino/Projects/Active/HandTrack3D/src/components/HandTrackingCanvas/Scene3D.tsx`
2. `/Users/kentino/Projects/Active/HandTrack3D/src/components/HandTrackingCanvas/GrabRangeSphere.tsx`

## Dependencies Added

None - `zustand/shallow` is already available in zustand 5.0.15.
