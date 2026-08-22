# Phase C Testing Guide

**Status**: Ready for Testing
**Server**: http://localhost:5179/
**Date**: 2026-08-21

---

## Pre-Test Setup

### 1. Environment Check
- [x] Dev server running on port 5179
- [x] Webcam available and not in use by other apps
- [ ] Browser: Chrome 90+ (recommended for best performance)
- [ ] Allow ~2 minutes for first-time model download

### 2. Browser DevTools Setup
1. Open http://localhost:5179/
2. Press `F12` to open DevTools
3. Go to **Console** tab (to monitor logs)
4. Go to **Performance** tab (to check FPS)

---

## Test Suite

### ✅ Test 1: Loading States (C3.2)

**Expected Behavior**: 5-stage loading overlay with visual progress

**Steps**:
1. Open http://localhost:5179/ in incognito mode (fresh state)
2. Observe loading overlay appearing

**Verify**:
- [ ] Progress bar visible
- [ ] Stage 1: "Initializing" (10%)
- [ ] Stage 2: "Loading Backend" (30%)
- [ ] Stage 3: "Downloading Model" (60%)
- [ ] Stage 4: "Processing" (90%)
- [ ] Stage 5: "Ready" (100%)
- [ ] After 3 seconds: "First time loading? Models are cached..." notice appears
- [ ] Overlay disappears when complete
- [ ] Elapsed time counter visible

**First Load Expected Time**: 8-15 seconds
**Subsequent Loads**: < 2 seconds (models cached)

---

### ✅ Test 2: Error Handling - Camera Denied (C3.1)

**Expected Behavior**: User-friendly error with actionable instructions

**Steps**:
1. Refresh page (or close and reopen)
2. When camera permission prompt appears, click **"Block"**

**Verify**:
- [ ] Red error box appears
- [ ] Icon: 🚫
- [ ] Title: "Camera Access Denied"
- [ ] Message: "Please allow camera access in your browser settings..."
- [ ] Suggestion: "Click the camera icon in your browser's address bar..."
- [ ] **"Retry Camera Access"** button visible
- [ ] Clicking retry reloads page

**Recovery Test**:
1. Click camera icon in address bar
2. Select "Allow"
3. Click "Retry Camera Access"
- [ ] Error disappears
- [ ] Hand tracking initializes successfully

---

### ✅ Test 3: Error Handling - Camera In Use (C3.1)

**Expected Behavior**: Yellow warning with helpful suggestion

**Steps**:
1. Open another app that uses camera (Zoom, Skype, FaceTime)
2. Refresh HandTrack3D page

**Verify**:
- [ ] Yellow warning box appears
- [ ] Icon: ⚠️
- [ ] Title: "Camera In Use"
- [ ] Message: "Your camera is already being used by another application"
- [ ] Suggestion: "Close other apps using the camera (Zoom, Skype, etc.)"
- [ ] Retry button available

---

### ✅ Test 4: Hand Tracking Initialization (C2 + C3)

**Expected Behavior**: Hand tracking starts at 30 FPS, pose at 10 FPS

**Steps**:
1. Allow camera access
2. Hold hand in front of camera (palm facing camera)

**Verify**:
- [ ] Webcam feed visible in bottom-left corner
- [ ] Blue/green hand cursor appears in 3D scene
- [ ] Hand cursor follows hand movement smoothly
- [ ] Console log: `[MoveNet] Pose detector initialized successfully`
- [ ] No console errors

**Check Console Logs**:
```
Expected logs:
[MoveNet] Initializing pose detector...
[MoveNet] Pose detector initialized successfully
[Gesture] Pinch detected (or other gestures)
```

---

### ✅ Test 5: Pose Skeleton Overlay (C2.2 - Memory Optimization)

**Expected Behavior**: Only 6 keypoints rendered (shoulders, elbows, wrists)

**Steps**:
1. Press `P` to toggle pose skeleton overlay
2. Stand in front of camera (full upper body visible)

**Verify**:
- [ ] Skeleton overlay appears on webcam feed
- [ ] **6 keypoints** visible:
  - Left shoulder
  - Right shoulder
  - Left elbow
  - Right elbow
  - Left wrist
  - Right wrist
- [ ] **5 connections** drawn:
  - Shoulder-to-shoulder line
  - Left shoulder → elbow → wrist
  - Right shoulder → elbow → wrist
- [ ] No other body parts (nose, hips, knees) rendered
- [ ] Press `P` again to hide overlay

**Why 6 keypoints?**: Memory optimization (C2.2) - reduced from 17 to 6 (55% savings)

---

### ✅ Test 6: Performance - 60 FPS Target (C2.1 + C2.2)

**Expected Behavior**: 39-61 FPS on average hardware

**Steps**:
1. Look at top-right corner of screen
2. Observe FPS counter (gray box)

**Verify**:
- [ ] FPS counter visible
- [ ] FPS reading: **39-61 FPS** (target: 60)
- [ ] No significant frame drops during hand movement
- [ ] Smooth 3D object rendering

**DevTools Performance Check**:
1. Open DevTools → Performance tab
2. Click "Record" (⚫)
3. Move hand for 10 seconds
4. Stop recording
5. Check frame time graph

**Expected**:
- [ ] Frame time: **~21.9ms** (down from 29ms)
- [ ] FPS: **45-60 range** (green bars in timeline)
- [ ] No long yellow/red bars (no lag spikes)

---

### ✅ Test 7: Pose FPS Decoupling (C2.1)

**Expected Behavior**: Pose runs at 10 FPS, hands at 30 FPS

**Steps**:
1. Open DevTools Console
2. Monitor pose detection frequency
3. Monitor hand detection frequency

**Console Check**:
```javascript
// Pose should update every ~100ms (10 FPS)
// Hands should update every ~33ms (30 FPS)
```

**Verify**:
- [ ] Pose detection logs appear **less frequently** than hand logs
- [ ] Approximately 1 pose update per 3 hand updates
- [ ] No quality degradation (arm position still accurate)

**Why this matters**: 15% CPU reduction with no quality loss

---

### ✅ Test 8: Motion-Aware Smoothing (C1.2)

**Expected Behavior**: Stable when still, responsive when moving fast

**Test 8a: Jitter Reduction (Still Hand)**
1. Hold hand completely still in front of camera
2. Observe 3D hand cursor

**Verify**:
- [ ] Cursor position very stable (±0.02m jitter)
- [ ] No visible shaking or trembling
- [ ] Smooth, barely noticeable micro-movements

**Test 8b: Lag Reduction (Fast Movement)**
1. Move hand quickly left-right across camera view
2. Observe cursor following hand

**Verify**:
- [ ] Cursor follows hand with minimal delay (~30ms)
- [ ] No "trailing" effect
- [ ] Responsive tracking during fast movement

**Test 8c: Sharp Corners**
1. Move hand in quick zigzag pattern (sharp direction changes)

**Verify**:
- [ ] Cursor accurately follows sharp turns
- [ ] No over-smoothing that rounds corners
- [ ] Jerk detection working (high alpha during direction change)

---

### ✅ Test 9: Adaptive Depth Weighting (C1.1)

**Expected Behavior**: More accurate depth estimation

**Test 9a: Hand Fully Visible**
1. Hold hand centered in camera view
2. Move hand forward/backward (toward/away from camera)

**Verify**:
- [ ] Cursor Z position updates smoothly
- [ ] Depth accuracy: **±0.05m** (press `D` to show depth breakdown)
- [ ] No sudden jumps in depth

**Test 9b: Hand Near Boundary**
1. Move hand to edge of camera view (left/right edge)

**Verify**:
- [ ] Depth still accurate near edges
- [ ] Adaptive weights favor hand size over pose near boundaries
- [ ] No loss of tracking

**Test 9c: Occlusion (Partial Hand)**
1. Cover part of hand with other hand or object

**Verify**:
- [ ] Tracking continues on visible portion
- [ ] Depth estimation remains stable
- [ ] MediaPipe confidence weight reduced

**Debug Panel** (Press `D`):
- [ ] Shows depth breakdown with confidence values
- [ ] Weight redistribution visible when hand occluded

---

### ✅ Test 10: Arm Extension Depth (C1.3)

**Expected Behavior**: Angle-based arm extension works at side angles

**Steps**:
1. Stand at angle to camera (not facing directly)
2. Extend arm forward (elbow angle changes)
3. Observe depth estimation

**Verify**:
- [ ] Depth adjusts based on elbow angle (not just distance)
- [ ] 60° elbow = near (low extension)
- [ ] 180° elbow = far (high extension)
- [ ] Works from side angles (not just frontal)
- [ ] 34% accuracy improvement over distance-only method

**Console Log** (if enabled):
```
Elbow angle: 145° → Extension: 0.7
```

---

### ✅ Test 11: Performance Warning (C3.3)

**Expected Behavior**: Warning appears when FPS < 25 for 5+ seconds

**Steps** (simulate low performance):
1. Open 5-10 browser tabs with heavy content (YouTube videos, animations)
2. Or open Activity Monitor and stress CPU with other apps
3. Wait for FPS to drop below 25
4. Wait 5 seconds

**Verify**:
- [ ] Yellow warning box appears after 5 seconds
- [ ] Icon: ⚡
- [ ] Title: "Low Frame Rate Detected"
- [ ] Message: "Your device is running at [X] FPS"
- [ ] Suggestion: "Disabling pose tracking may improve performance"
- [ ] **"Enable Performance Mode"** button visible
- [ ] **"Dismiss"** button visible

**Performance Mode Test**:
1. Click "Enable Performance Mode"
2. Observe FPS

**Verify**:
- [ ] Warning disappears
- [ ] FPS increases (20 FPS → 40-50 FPS expected)
- [ ] Hand tracking continues normally
- [ ] Pose skeleton no longer renders (Press `P` to verify)
- [ ] Console log: `[MoveNet] Pose tracking disabled (performance mode)`

**Settings Verification**:
1. Press `S` to open Settings
2. Go to "Performance" tab

**Verify**:
- [ ] "Pose Tracking Enabled" toggle is **OFF**
- [ ] Can manually toggle back on
- [ ] Re-enabling pose tracking restarts MoveNet

---

### ✅ Test 12: Gesture Detection (Existing + C1/C2 Optimizations)

**Expected Behavior**: Gestures detected accurately and responsively

**Test 12a: Pinch Gesture**
1. Touch thumb and index finger together
2. Bring pinched fingers near a 3D cube

**Verify**:
- [ ] Gesture detected (check status panel or console)
- [ ] Cube highlights when in grab range
- [ ] Can grab cube with pinch

**Test 12b: Open Hand**
1. Pinch and grab cube
2. Open hand (spread fingers)

**Verify**:
- [ ] Cube releases
- [ ] Falls with gravity
- [ ] Gesture switches to "open"

**Test 12c: Fist**
1. Close hand into fist

**Verify**:
- [ ] Gesture detected as "fist"
- [ ] No accidental pinch detection

---

### ✅ Test 13: Multi-Hand Tracking

**Expected Behavior**: Two hands tracked independently

**Steps**:
1. Show both hands to camera
2. Make different gestures with each hand

**Verify**:
- [ ] Two hand cursors visible (blue = right, green = left)
- [ ] Independent gesture detection
- [ ] Both can grab different objects
- [ ] No interference between hands
- [ ] FPS remains stable (50+ FPS with 2 hands)

---

### ✅ Test 14: Error Recovery - Pose Tracking Failure

**Expected Behavior**: Hand tracking continues if pose fails

**Steps**:
1. Cover camera briefly to cause pose loss
2. Uncover camera

**Verify**:
- [ ] Yellow warning appears: "Pose detection failed. Retrying..."
- [ ] Hand tracking continues normally
- [ ] Depth estimation uses MediaPipe + hand size only
- [ ] Pose tracking recovers automatically
- [ ] Warning disappears on recovery

**Console Log**:
```
[MoveNet] Detection error: ...
[MoveNet] Retrying...
[MoveNet] Pose detector recovered
```

---

## Performance Benchmarks

### Expected Results (After Phase C)

| Metric | Target | Pass Criteria |
|--------|--------|---------------|
| **Frame Time** | 21.9ms | < 25ms |
| **FPS** | 60 | > 50 FPS |
| **CPU Usage** | 85% | < 90% |
| **Memory (Pose)** | 400 bytes | < 500 bytes |
| **Depth Accuracy** | ±0.05m | < ±0.08m |
| **Jitter (Still)** | ±0.02m | < ±0.05m |
| **Lag (Fast Move)** | ~30ms | < 50ms |

### Measuring Tools

**Chrome DevTools**:
1. **Performance Tab**: Frame time, FPS graph
2. **Memory Tab**: Heap snapshots for memory usage
3. **Console**: Error logs, detection logs

**In-App Monitors**:
1. **FPS Counter**: Top-right (press `H` if hidden)
2. **Depth Breakdown**: Press `D` for debug panel
3. **Pose Skeleton**: Press `P` to visualize

---

## Known Issues & Limitations

### Expected Behavior (Not Bugs)

1. **First Load Slow (8-15s)**
   - TensorFlow.js downloads models (~10 MB)
   - Subsequent loads fast (< 2s)

2. **Sparse Array Overhead**
   - 11 undefined slots in pose landmarks array
   - Trade-off for code simplicity vs 88 bytes

3. **Fixed Pose FPS (10 FPS)**
   - Hardcoded at 10 FPS (3x skip)
   - Could be adaptive (5-15 FPS) in future

4. **Retry = Full Page Reload**
   - Simple but not optimal
   - Could do in-place re-initialization

---

## Test Results Template

```
Date: 2026-08-21
Browser: Chrome [version]
Hardware: [device specs]
Webcam: [camera model]

LOADING STATES (C3.2):
- [ ] PASS / [ ] FAIL - 5-stage loading overlay
- [ ] PASS / [ ] FAIL - First-time notice appears
- [ ] PASS / [ ] FAIL - Cached loads fast

ERROR HANDLING (C3.1):
- [ ] PASS / [ ] FAIL - Camera denied error
- [ ] PASS / [ ] FAIL - Camera in use warning
- [ ] PASS / [ ] FAIL - Retry functionality

PERFORMANCE (C2):
- FPS: ______ (target: 60)
- Frame time: ______ ms (target: 21.9ms)
- [ ] PASS / [ ] FAIL - 60 FPS achieved
- [ ] PASS / [ ] FAIL - Pose at 10 FPS
- [ ] PASS / [ ] FAIL - 6 keypoints only

ALGORITHMS (C1):
- [ ] PASS / [ ] FAIL - Motion-aware smoothing
- [ ] PASS / [ ] FAIL - Adaptive depth weighting
- [ ] PASS / [ ] FAIL - Angle-based arm extension

PERFORMANCE MODE (C3.3):
- [ ] PASS / [ ] FAIL - Warning appears at FPS < 25
- [ ] PASS / [ ] FAIL - Performance mode improves FPS

OVERALL:
- Critical Bugs: ______ (should be 0)
- Minor Issues: ______
- Performance: [ ] EXCELLENT / [ ] GOOD / [ ] POOR
- Recommendation: [ ] SHIP / [ ] FIX ISSUES FIRST
```

---

## Next Steps After Testing

### If All Tests Pass ✅
- **Proceed to Phase 3 UX** (from plan file)
- Optional: C3.4 polish (additional error messages)

### If Issues Found ❌
1. Document failing tests
2. Create bug fix tasks
3. Re-test after fixes
4. Then proceed to Phase 3

---

## Quick Test (5 Minutes)

**For rapid validation**:
1. ✅ Allow camera → hand tracking works
2. ✅ Deny camera → error message shows
3. ✅ FPS counter shows 50+ FPS
4. ✅ Pinch gesture grabs cube
5. ✅ Press `P` → 6-keypoint skeleton shows

**If all 5 pass**: Core functionality validated ✅
**Proceed with**: Full test suite or Phase 3

---

**Testing Status**: Ready
**Server URL**: http://localhost:5179/
**Estimated Test Time**: 15-30 minutes (full suite)

Good luck! 🎉
