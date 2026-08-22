# HandTrack3D Phase 3+ Roadmap

## Completed: Option A - Debug & Validation ✅

**Status**: Implemented (2026-08-21)
**Effort**: 1 day
**Documentation**: See `DEBUG_FEATURES.md`

### What Was Delivered
- ✅ Pose skeleton overlay (Press `P`)
- ✅ Depth breakdown debug panel (Press `D`)
- ✅ Keyboard shortcuts for debug toggles
- ✅ Visual confidence indicators
- ✅ Settings integration

### Validation Results
Ready for testing:
1. Open http://localhost:5178
2. Press `W` to show webcam
3. Press `P` to show pose skeleton
4. Press `D` to show depth breakdown
5. Verify MoveNet is detecting poses (green skeleton)
6. Verify arm extension affects depth

---

## Option B: UX Improvements (Phase 3 Original Plan)

**Priority**: HIGH
**Estimated Effort**: 6-7 weeks
**Impact**: Transform from "demo" to "polished app"

### Phase 3A: Core UX Foundations (Weeks 1-3)

#### 1. Real-Time Gesture Status Widget
**Effort**: 2 days | **Status**: ⏳ Planned

**What**: Persistent floating widget showing live gesture state per hand

**Features**:
- Hand icon (left/right, color-coded)
- Current gesture name with emoji
- Confidence bar (0-100%, color-coded)
- Compact mode toggle
- Auto-hide after 3s when no hands

**Files to Create**:
- `src/components/GestureStatusWidget/GestureStatusWidget.tsx`
- `src/components/GestureStatusWidget/HandGestureCard.tsx`
- `src/utils/gestureConfidence.ts`

**Success Criteria**:
- Users can see gesture detection confidence in real-time
- Widget shows when gestures are "almost detected"
- Helps users learn optimal hand positions

---

#### 2. Settings Presets System
**Effort**: 1 day | **Status**: ⏳ Planned

**What**: One-click preset buttons (Responsive, Balanced, Precise)

**Presets**:
- **Responsive**: Low thresholds, fast detection (pinchThreshold: 0.03)
- **Balanced**: Current defaults (default)
- **Precise**: High thresholds, stable detection (pinchThreshold: 0.07)

**Files to Create**:
- `src/data/settingsPresets.ts`

**Files to Modify**:
- `src/components/SettingsPanel/SettingsPanel.tsx` (preset UI)
- `src/stores/settingsStore.ts` (applyPreset method)

**Success Criteria**:
- Users can switch between 3 presets with 1 click
- Current preset indicator shows
- Switching to custom when manually adjusted

---

#### 3. Grab Range Visualization
**Effort**: 2 days | **Status**: ⏳ Planned

**What**: Render semi-transparent spheres around hand cursors showing grab radius

**Visual States**:
- Blue sphere (opacity 0.08): No objects in range
- Green sphere (opacity 0.15, pulsing): Objects grabbable
- Orange sphere (opacity 0.2): Object currently grabbed

**Files to Modify**:
- `src/components/HandTrackingCanvas/HandMesh.tsx` (add sphere)
- `src/stores/sceneStore.ts` (getNearObjects method)
- `src/stores/settingsStore.ts` (showGrabRange toggle)

**Success Criteria**:
- Users see when objects are in grab range
- Performance: <0.5ms per frame for 2 hands
- Toggle-able via settings

---

#### 4. Interactive Tutorial Mode
**Effort**: 3-4 days | **Status**: ⏳ Planned

**What**: 6-step interactive tutorial with progress tracking

**Tutorial Steps**:
1. Welcome screen
2. Allow webcam access
3. Show your hand (wait for detection)
4. Pinch gesture (wait for pinch near object)
5. Grab and move (wait for object grabbed)
6. Release the object

**Files to Create**:
- `src/components/Tutorial/TutorialOverlay.tsx` (~300 lines)
- `src/components/Tutorial/Spotlight.tsx` (highlight effect)
- `src/components/Tutorial/ProgressBar.tsx`
- `src/data/tutorialSteps.ts`
- `src/stores/tutorialStore.ts`
- `public/tutorial/hand-position.png` (help images)

**Success Criteria**:
- 70%+ of new users complete full tutorial
- Time to first successful grab < 30 seconds (down from ~60s)
- Tutorial can be dismissed and replayed from Settings

---

### Phase 3B: Creative Tools (Weeks 4-5)

#### 5. Drag-to-Place Build Mode
**Effort**: 3-4 days | **Status**: ⏳ Planned

**What**: "Build Mode" toggle for mouse-based drag-to-place object creation

**Features**:
- Ghost object preview with transparency
- Snap to 0.5 unit grid
- Mouse-driven placement
- Keyboard shortcut (`B`)

**Files to Create**:
- `src/components/BuildMode/BuildMode.tsx` (~250 lines)
- `src/components/BuildMode/GhostObject.tsx`
- `src/stores/buildModeStore.ts`

**Success Criteria**:
- Users can precisely place objects with mouse
- Grid snapping works smoothly
- No interference with hand tracking

---

#### 6. First-Time User Hints System
**Effort**: 2 days | **Status**: ⏳ Planned

**What**: Smart contextual hints that appear once based on user behavior

**Hint Triggers**:
- Timer-based (e.g., "Press H to toggle status panel" after 10s)
- Event-based (e.g., "Right-click + drag to pan" after 3 camera rotations)
- Gesture count (e.g., "Try swipe gesture" after 5 pinches)
- Object count (e.g., "Explore scene templates" after 3 objects spawned)

**Files to Create**:
- `src/components/Hints/HintTooltip.tsx`
- `src/data/hints.ts`
- `src/stores/hintsStore.ts`

**Success Criteria**:
- Users discover hidden features (keyboard shortcuts, swipes, etc.)
- Hints shown once per user (localStorage tracking)
- Auto-hide after 8 seconds

---

### Phase 3C: Advanced Customization (Weeks 6-7)

#### 7. Per-Object Property Editor
**Effort**: 3-4 days | **Status**: ⏳ Planned

**What**: Right-click context menu to edit per-object properties

**Editable Properties**:
- Scale (0.5 - 3.0)
- Color (color picker)
- Mass (0.5 - 5.0)
- Lock position (static/dynamic)

**Files to Create**:
- `src/components/ObjectPropertyPanel/ObjectPropertyPanel.tsx` (~300 lines)

**Files to Modify**:
- `src/stores/sceneStore.ts` (add objectProperties map - MAJOR REFACTOR)
- `src/components/HandTrackingCanvas/InteractiveObject.tsx` (use per-object props)

**Success Criteria**:
- Each object can have unique properties
- Changes apply immediately to physics
- Delete object button works
- Reset to defaults button works

---

## Option C: Performance & Algorithm Optimization

**Priority**: MEDIUM
**Estimated Effort**: 2-3 weeks
**Impact**: Make it rock-solid before UX polish

### C1: Depth Estimation Algorithm Improvements (Week 1)

#### 1.1 Adaptive Weighting
**Current**: Fixed 20/50/30 weighting
**Problem**: All sources weighted equally regardless of confidence

**Solution**: Confidence-based dynamic weighting
```typescript
// Current
const rawZ = 0.2 * mediaPipeZ + 0.5 * handSizeZ + 0.3 * armExtensionZ;

// Proposed
const weights = calculateAdaptiveWeights({
  mediaPipeConfidence: hand.score,
  poseConfidence: pose?.score || 0,
  handSizeReliability: isHandFullyVisible(hand)
});

const rawZ =
  weights.mediaP pipe * mediaPipeZ +
  weights.handSize * handSizeZ +
  weights.armExtension * armExtensionZ;
```

**Benefits**:
- More accurate when hand partially occluded
- Graceful fallback when pose not available
- Better handling of edge cases

**Effort**: 2 days

---

#### 1.2 Improved Smoothing
**Current**: Single EMA (α=0.3)
**Problem**: Too aggressive for large movements, too slow for small movements

**Solution**: Multi-stage smoothing
```typescript
// Detect movement magnitude
const movementDelta = currentPos.distanceTo(prevPos);

// Apply different smoothing based on movement
if (movementDelta < 0.1) {
  // Small movement: smooth heavily (reduce jitter)
  smoothingFactor = 0.2;
} else if (movementDelta > 0.5) {
  // Large movement: smooth lightly (preserve responsiveness)
  smoothingFactor = 0.5;
} else {
  // Medium movement: balanced
  smoothingFactor = 0.3;
}
```

**Alternative**: Implement Kalman filter for prediction-based smoothing

**Benefits**:
- Less jitter during small movements
- More responsive during large movements
- Better handling of sudden direction changes

**Effort**: 2 days

---

#### 1.3 Arm Extension Calculation Improvements
**Current**: Simple shoulder-wrist distance ratio
**Problem**: Doesn't account for camera angle, elbow bend variations

**Solution**: Enhanced arm extension with angle detection
```typescript
// Calculate elbow angle
const upperArmVector = elbowPos.clone().sub(shoulderPos);
const forearmVector = wristPos.clone().sub(elbowPos);
const elbowAngle = upperArmVector.angleTo(forearmVector);

// Extension based on both distance and angle
const distanceRatio = shoulderToWrist / bentArmLength;
const angleRatio = (180 - elbowAngle) / 180; // Straight arm = 180°

const extensionRatio = (distanceRatio * 0.6) + (angleRatio * 0.4);
```

**Benefits**:
- More accurate arm extension detection
- Better handling of camera angles
- Less false positives from side views

**Effort**: 1 day

---

### C2: Performance Optimization (Week 2)

#### 2.1 Pose Tracking FPS Decoupling
**Current**: MoveNet runs every frame (30 FPS)
**Problem**: Expensive, arm position changes slowly

**Solution**: Run pose at lower FPS
```typescript
// Hands: 30 FPS (critical for responsiveness)
// Pose: 10 FPS (arm position changes slowly)

let poseFrameCounter = 0;
const POSE_FPS_DIVISOR = 3; // 30 / 3 = 10 FPS

if (poseFrameCounter % POSE_FPS_DIVISOR === 0) {
  // Run pose detection
  const poses = await detectorRef.current.estimatePoses(videoElement);
  updatePose(poses);
}
poseFrameCounter++;
```

**Benefits**:
- ~15% CPU reduction
- No noticeable quality degradation
- More headroom for other features

**Effort**: 1 day

---

#### 2.2 Memory Optimization
**Current**: Full pose skeleton (17 keypoints) stored every frame
**Problem**: Only need 6 keypoints (shoulders, elbows, wrists)

**Solution**: Filter keypoints before storing
```typescript
const relevantKeypoints = [
  PoseLandmarks.LEFT_SHOULDER,
  PoseLandmarks.LEFT_ELBOW,
  PoseLandmarks.LEFT_WRIST,
  PoseLandmarks.RIGHT_SHOULDER,
  PoseLandmarks.RIGHT_ELBOW,
  PoseLandmarks.RIGHT_WRIST,
];

const filteredLandmarks = pose.keypoints
  .filter((kp, idx) => relevantKeypoints.includes(idx));
```

**Benefits**:
- ~60% memory reduction in pose store
- Faster serialization for localStorage/debug
- Cleaner debug panel

**Effort**: 0.5 days

---

#### 2.3 Batch State Updates
**Current**: Individual store updates for each data point
**Problem**: Triggers multiple re-renders

**Solution**: Batch updates with `zustand` shallow merging
```typescript
// Before (3 separate updates)
setPose(newPose);
setIsTracking(true);
setConfidence(0.85);

// After (1 batched update)
usePoseTrackingStore.setState({
  pose: newPose,
  isTracking: true,
  confidence: 0.85,
});
```

**Benefits**:
- Fewer re-renders
- Smoother 60 FPS in 3D canvas
- Better perceived performance

**Effort**: 1 day

---

### C3: Error Handling & Reliability (Week 3)

#### 3.1 Graceful Degradation Chain
**Current**: If MoveNet fails, depth estimation gets stuck
**Problem**: Silent failures, no user feedback

**Solution**: Multi-tier fallback system
```typescript
// Tier 1: Full tracking (Hands + Pose)
if (handsDetected && poseDetected) {
  depth = hybridDepth(mediaPipe, handSize, armExtension);
  status = 'optimal';
}

// Tier 2: Hands only (Pose failed)
else if (handsDetected && !poseDetected) {
  depth = hybridDepth(mediaPipe, handSize, neutralArm);
  status = 'degraded';
  showToast('Pose tracking unavailable - move back for better depth');
}

// Tier 3: Hands lost
else {
  depth = null;
  status = 'lost';
  showToast('Show your hand to the camera');
}
```

**Benefits**:
- App never "breaks"
- Users understand what's wrong
- Clear path to recovery

**Effort**: 2 days

---

#### 3.2 Model Loading with Progress
**Current**: MoveNet loads silently, user doesn't know if it's ready
**Problem**: Perceived lag during initialization

**Solution**: Loading progress indicator
```typescript
// Show loading toast
const loadingToast = showToast('Loading pose tracking model...', {
  type: 'loading',
  persistent: true
});

// Track download progress
const detector = await poseDetection.createDetector(
  poseDetection.SupportedModels.MoveNet,
  {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    onProgress: (progress) => {
      updateToast(loadingToast, `Loading: ${progress.toFixed(0)}%`);
    }
  }
);

// Dismiss toast when ready
dismissToast(loadingToast);
showToast('Pose tracking ready!', { type: 'success', duration: 2000 });
```

**Benefits**:
- Users know app is working
- No confusion during initialization
- Better first-run experience

**Effort**: 1 day

---

#### 3.3 Comprehensive Error Recovery
**Current**: Errors logged to console only
**Problem**: Users don't see errors, can't fix issues

**Solution**: User-friendly error states
```typescript
// Camera permission denied
if (error === 'NotAllowedError') {
  showPersistentError(
    'Camera access denied',
    'Please allow camera access in your browser settings'
  );
}

// MoveNet initialization failed
if (error === 'BackendError') {
  showPersistentError(
    'Pose tracking unavailable',
    'Your device may not support WebGL. Hand tracking still works!',
    { canDismiss: true }
  );
}

// Network error (model download failed)
if (error === 'NetworkError') {
  showRetryableError(
    'Failed to load pose model',
    'Check your internet connection and try again',
    { onRetry: () => initializeMoveNet() }
  );
}
```

**Benefits**:
- Users can fix issues themselves
- Reduced confusion/frustration
- Better error reporting for debugging

**Effort**: 2 days

---

## Roadmap Timeline

### Immediate (Completed)
- ✅ **Option A**: Debug & Validation (1 day)

### Short-term (Next 2-3 weeks)
- 🎯 **Option C1**: Depth Algorithm Improvements (1 week)
  - Adaptive weighting
  - Improved smoothing
  - Arm extension enhancements

### Medium-term (Weeks 4-6)
- 🎯 **Option C2 + C3**: Performance & Reliability (2 weeks)
  - FPS decoupling
  - Memory optimization
  - Error handling

### Long-term (Weeks 7-13)
- 🎯 **Option B**: UX Improvements (6-7 weeks)
  - Phase 3A: Core foundations (weeks 7-9)
  - Phase 3B: Creative tools (weeks 10-11)
  - Phase 3C: Advanced features (weeks 12-13)

## Recommended Execution Order

### Path 1: Algorithm-First (Recommended)
**Rationale**: Fix the core before polishing UX

1. ✅ Option A (Debug) - 1 day
2. Option C1 (Algorithm) - 1 week
3. Test & validate improvements with debug tools
4. Option C2+C3 (Performance) - 2 weeks
5. Option B (UX) - 6-7 weeks

**Total**: ~10 weeks to production-ready

---

### Path 2: UX-First (Alternative)
**Rationale**: Get user feedback early

1. ✅ Option A (Debug) - 1 day
2. Option B (UX) - 6-7 weeks
3. User testing & feedback collection
4. Option C (Performance + Algorithm) - 3 weeks based on feedback

**Total**: ~10 weeks, but UX available sooner

---

## Success Metrics

### Option B (UX)
- Tutorial completion rate: **70%+**
- Time to first grab: **<30 seconds**
- Feature discovery (build mode): **50%+ within first session**
- Settings preset usage: **30%+ try at least one**

### Option C (Performance)
- Frame time: **<18ms** (maintain 60 FPS)
- Depth accuracy: **±0.3m** at 2m distance
- Pose tracking CPU: **<20%** on modern hardware
- Error recovery: **<5 second** time to recovery

### Overall Phase 3+
- First-time UX score: **80%+** (up from 30%)
- Crash-free sessions: **99%+**
- Performance budget: **60 FPS 3D, 30 FPS tracking**

---

## Dependencies Between Options

```
Option A (Debug)
    ├─> Option C1 (Algorithm) - Uses debug tools to validate
    └─> Option B (UX) - Debug helps identify pain points

Option C1 (Algorithm)
    └─> Option C2 (Performance) - Algorithm changes before optimization

Option C2+C3 (Performance)
    └─> Option B (UX) - Stable foundation before UX features

Option B (UX)
    └─> User Testing - Polished app ready for feedback
```

## Next Steps

1. **Validate Option A** (this week)
   - Test pose skeleton overlay
   - Test depth breakdown panel
   - Confirm MoveNet is working
   - Document findings in GitHub issue

2. **Choose execution path** (next week)
   - Review roadmap with stakeholders
   - Decide: Algorithm-first vs UX-first
   - Set sprint schedule

3. **Begin chosen option** (week after)
   - Start with top priority from chosen path
   - Use debug tools to validate progress
   - Iterate based on feedback

---

## Files & Documentation

- `DEBUG_FEATURES.md` - Option A implementation details
- `PHASE_2_COMPLETE.md` - Plugin system completion (v0.2.0-alpha.0)
- `INTEGRATION_TEST_RESULTS.md` - Phase 2 test results
- `CHANGELOG.md` - Release history

## Version Targets

- **v0.2.1-alpha.0**: Option A (Debug) ✅
- **v0.3.0-alpha.0**: Option C (Performance + Algorithm)
- **v0.4.0-beta.0**: Option B (UX Improvements)
- **v1.0.0**: Production release (all options complete + user testing)
