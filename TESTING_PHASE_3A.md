# Phase 3A Testing Guide

**Version**: v0.3.0-alpha.0
**Date**: 2026-08-22
**Duration**: 15-20 minutes

This guide helps you validate all 7 Phase 3A features are working correctly.

---

## Prerequisites

1. **Clean Browser State** (recommended for tutorial testing)
   - Open in **Incognito/Private mode** for first-time experience
   - Or clear localStorage: Open DevTools → Application → Local Storage → Clear All

2. **Hardware Requirements**
   - Webcam (built-in or external)
   - Modern browser (Chrome/Edge recommended)

3. **Start the App**
   ```bash
   cd ~/Projects/Active/HandTrack3D
   pnpm dev
   # Navigate to http://localhost:5173
   ```

---

## Quick Validation (5 minutes)

### 1. First-Time Experience
**Expected**: Tutorial overlay appears automatically

- [ ] Tutorial overlay displays "Welcome to HandTrack3D"
- [ ] Click "Continue" → Step 2: "Allow Webcam Access"
- [ ] Allow webcam → Step 3: "Show Your Hand" (auto-advances when hand detected)
- [ ] Show hand → Step 4: "Pinch Gesture" (auto-advances on pinch near object)
- [ ] Pinch near cube → Step 5: "Grab and Move" (auto-advances when grabbed)
- [ ] Move object → Step 6: "Release the Object" (auto-advances on open hand)
- [ ] Open hand → Tutorial completes, overlay disappears
- [ ] Refresh page → Tutorial does NOT appear again (localStorage flag)

**If tutorial doesn't appear**: Check DevTools Console for errors, verify localStorage is empty.

---

### 2. Gesture Status Widget
**Expected**: Widget appears top-left when hands detected

- [ ] Show hand → Widget appears with hand icon (blue for right, green for left)
- [ ] Make pinch gesture → Widget shows "Pinch" with 🤏 emoji
- [ ] Confidence bar is green (>70% confidence)
- [ ] Hide hands → Widget disappears after 3 seconds
- [ ] Press **G** key → Widget switches to compact mode (icon + gesture name only)

---

### 3. Settings Presets
**Expected**: One-click preset switching

- [ ] Press **S** to open Settings
- [ ] Click "Responsive" preset → All settings update instantly
- [ ] Notice "Custom" badge appears if you manually adjust a slider
- [ ] Click "Balanced" preset → Settings reset to defaults
- [ ] Click "Precise" preset → Higher thresholds applied

**Verify presets affect behavior**:
- Responsive: Gestures trigger faster, more sensitive
- Precise: Requires clearer gestures, less false positives

---

### 4. Build Mode
**Expected**: Click-to-place objects with grid snapping

- [ ] Press **B** key → Build mode banner appears at top
- [ ] Click anywhere in 3D scene → Ghost preview appears
- [ ] Ghost object snaps to 0.5-unit grid (not arbitrary positions)
- [ ] Click to confirm placement → Object spawns at that location
- [ ] Press **B** again → Build mode exits

---

### 5. First-Time Hints
**Expected**: Hints appear based on triggers

**Hint 1 - Timer (10s)**:
- [ ] Wait 10 seconds → "Press H to toggle the status panel" appears top-right
- [ ] Hint auto-dismisses after 8 seconds
- [ ] Refresh page → This hint does NOT appear again

**Hint 2 - Gesture Count (5 pinches)**:
- [ ] Make pinch gesture 5 times → "Try a swipe gesture!" hint appears
- [ ] Hint shows once, then never again

**Hint 3 - Objects Spawned (3 objects)**:
- [ ] Spawn 3 objects (via ObjectSpawner or Build Mode)
- [ ] "Press B to toggle Build Mode" hint appears bottom-right
- [ ] Already in build mode? Hint may not appear (condition already met)

**Hint 4 - Camera Rotation (3 rotations)**:
- [ ] Rotate camera 3 times (left-click + drag)
- [ ] "Right-click + drag to pan the camera" hint appears bottom-center

**Hint 5 - Timer (30s)**:
- [ ] Wait 30 seconds → "Tip: Try the Settings Presets" hint appears top-center

**Hint 6 - Session Count (2 sessions)**:
- [ ] Close browser, reopen app → Session count increments
- [ ] On 2nd session → "The gesture widget shows real-time detection" hint appears

---

### 6. Per-Object Property Editor
**Expected**: Right-click opens property panel

- [ ] Spawn an object (any type)
- [ ] Right-click the object → Property panel opens top-right
- [ ] Object highlights in pink when selected

**Physics Properties**:
- [ ] Adjust Mass slider (0.1 - 10.0) → Object feels heavier/lighter when thrown
- [ ] Adjust Bounciness (0 - 1.0) → Object bounces more/less on ground
- [ ] Adjust Friction (0 - 1.0) → Object slides more/less

**Visual Properties**:
- [ ] Change Color → Object color updates immediately
- [ ] Adjust Emissive intensity → Object glows
- [ ] Adjust Metalness → Metallic appearance
- [ ] Adjust Roughness → Shiny vs matte

**Interaction Properties**:
- [ ] Toggle "Locked" → Object cannot be grabbed
- [ ] Toggle "Visible" → Object disappears/reappears

**Actions**:
- [ ] Click "Reset" → All properties return to defaults
- [ ] Click "Delete" → Confirmation dialog, object removed from scene

---

### 7. Grab Range Visualization
**Expected**: Semi-transparent sphere around hand cursors

**Note**: This feature may be toggled off by default in Performance settings.

- [ ] Open Settings → Visual Settings
- [ ] Enable "Show Grab Range" if disabled
- [ ] Show hand → Blue/green semi-transparent sphere around cursor
- [ ] Move hand near object → Sphere turns green (object in range)
- [ ] Grab object (pinch) → Sphere turns orange (object grabbed)

---

## Full Feature Test (15-20 minutes)

### Scenario 1: New User Onboarding
1. **Clean localStorage** (DevTools → Application → Clear All)
2. **Refresh page** → Tutorial starts automatically
3. **Complete tutorial** following all 6 steps
4. **Verify** tutorial completion flag in localStorage:
   - DevTools → Application → Local Storage
   - Key: `tutorial_completed` → Value: `"true"`
5. **Refresh page** → Tutorial does NOT appear (checks persistence)

### Scenario 2: Gesture Confidence Feedback
1. **Show hand** → Gesture widget appears
2. **Make unclear pinch** (fingers far apart) → Confidence bar is red/yellow (<70%)
3. **Make clear pinch** (fingers touching) → Confidence bar is green (>70%)
4. **Switch to fist** → Widget updates to ✊ "Fist" immediately
5. **Try point gesture** (index finger extended) → Widget shows 👆 "Point"
6. **Open hand** (all fingers spread) → Widget shows 🖐️ "Open"

### Scenario 3: Settings Preset Comparison
1. **Open Settings** (Press S)
2. **Select "Responsive" preset**
   - Try pinch → Triggers with less precision
   - Grab range is larger (can grab from farther)
3. **Select "Precise" preset**
   - Try pinch → Requires clearer gesture
   - Grab range is smaller (must be close)
4. **Select "Balanced" preset** → Default behavior restored

### Scenario 4: Build Mode Workflow
1. **Press B** → Build mode ON
2. **Select different object type** (ObjectSpawner panel → Sphere)
3. **Select color** (change to red)
4. **Click in scene** → Red sphere ghost preview appears
5. **Move mouse** → Ghost snaps to grid
6. **Click to confirm** → Red sphere spawns
7. **Repeat** for 2 more objects (different types/colors)
8. **Press B** → Build mode OFF

### Scenario 5: Smart Hints Flow
1. **Wait 10s** → Status panel hint appears
2. **Pinch 5 times** → Swipe gesture hint appears
3. **Spawn 3 objects** → Build mode hint appears
4. **Rotate camera 3 times** → Camera pan hint appears
5. **Wait 30s** → Settings presets hint appears
6. **Verify** all hints shown in localStorage:
   - DevTools → Application → Local Storage
   - Key: `hints_shown` → Value: JSON array with hint IDs

### Scenario 6: Per-Object Customization
1. **Spawn 3 objects** (box, sphere, torus)
2. **Right-click box** → Open property editor
3. **Set mass to 0.1** (very light) → Close panel
4. **Right-click sphere** → Set mass to 10.0 (very heavy)
5. **Grab both objects** (one at a time) and throw
   - Box flies far (light)
   - Sphere drops quickly (heavy)
6. **Right-click torus** → Set bounciness to 1.0 (full bounce)
7. **Drop torus** → Bounces repeatedly on ground
8. **Right-click box** → Click "Delete" → Confirm → Box removed

### Scenario 7: Multi-Feature Integration
1. **Start with gesture widget visible** (top-left)
2. **Tutorial complete** (or dismissed)
3. **Settings preset** = "Balanced"
4. **Build mode** OFF
5. **Spawn 5 different objects** with varied properties:
   - Object 1: Default (no customization)
   - Object 2: High mass (5.0), high friction (0.9)
   - Object 3: Low mass (0.2), high bounciness (0.9)
   - Object 4: Custom color (purple), emissive (0.8)
   - Object 5: Locked (cannot grab)
6. **Interact with all objects** → Verify behavior matches properties
7. **Press H** → Toggle status panel (verify hint worked if you saw it)
8. **Press G** → Toggle gesture widget compact mode
9. **Press B** → Enter build mode, place one more object
10. **Press S** → Open settings, switch to "Precise" preset
11. **Try grabbing** → Notice increased precision required

---

## Performance Validation

### Frame Rate Check
1. **Open DevTools** → Console tab
2. **Show status panel** (Press H) → Check FPS counter
3. **Expected**:
   - 3D rendering: 58-60 FPS
   - Hand tracking: 28-30 FPS
4. **Spawn 10+ objects** → FPS should NOT drop below 55 FPS

### Memory Check
1. **DevTools** → Performance Monitor (Shift+Cmd+P → "Show Performance Monitor")
2. **Monitor for 2-3 minutes** of interaction
3. **Expected**:
   - No memory leaks (stable or slight growth, not continuous)
   - CPU usage spikes only during hand tracking (when hands visible)

### Console Check
1. **DevTools** → Console tab
2. **Expected**: No errors or warnings
3. **Acceptable warnings**: TensorFlow.js optimization warnings (normal)

---

## Common Issues & Solutions

### Tutorial Doesn't Appear
- **Cause**: localStorage already has `tutorial_completed` flag
- **Fix**: DevTools → Application → Local Storage → Delete `tutorial_completed` key
- **Or**: Open in Incognito/Private mode

### Gesture Widget Not Showing
- **Cause**: Setting disabled
- **Fix**: Press S → Visual Settings → Enable "Show Gesture Widget"

### Hints Not Appearing
- **Cause**: Already shown (localStorage flag)
- **Fix**: DevTools → Application → Local Storage → Delete `hints_shown` key
- **Or**: Open in Incognito/Private mode

### Build Mode Ghost Not Visible
- **Cause**: Build mode OFF or wrong camera angle
- **Fix**: Press B to ensure ON, move camera to see ground plane

### Property Editor Not Opening
- **Cause**: Right-click not hitting object mesh
- **Fix**: Ensure you're clicking directly on the object (not empty space)

### Camera Controls Not Working
- **Cause**: Build mode may capture clicks
- **Fix**: Press B to exit build mode, then try camera controls

---

## Regression Testing (Ensure No Breaking Changes)

### Core Features Still Work
- [ ] Hand tracking still accurate (30 FPS)
- [ ] Gesture detection still works (pinch, open, fist, point)
- [ ] Physics simulation still realistic (gravity, collisions)
- [ ] Object spawner still creates objects
- [ ] Grab/drag/throw still works smoothly
- [ ] Multi-hand support (2 hands) still works

### Existing Settings Still Work
- [ ] Gravity toggle (Settings → Physics → Gravity Enabled)
- [ ] Hand tracking confidence slider
- [ ] Visual settings (trails, webcam, skeleton)
- [ ] Performance mode toggles

---

## Expected Test Results

### Pass Criteria
- ✅ All 7 features functional
- ✅ No console errors (except TensorFlow warnings)
- ✅ Performance maintained (60 FPS 3D, 30 FPS tracking)
- ✅ Tutorial completes successfully
- ✅ All hints appear when triggered
- ✅ Settings presets update all values
- ✅ Build mode places objects accurately
- ✅ Property editor modifies objects correctly
- ✅ No memory leaks over 5+ minutes

### Known Limitations
- Tutorial cannot be paused mid-step (only skip/complete)
- Hints show maximum once per user (by design)
- Build mode requires camera view of ground plane
- Property editor requires precise right-click on object
- Gesture widget may hide if no hands detected for 3s (by design)

---

## Reporting Issues

If you find any issues during testing:

1. **Check console** for error messages
2. **Note reproduction steps** (what you did before the issue)
3. **Check browser** (Chrome/Edge recommended)
4. **Try incognito mode** (eliminates localStorage issues)
5. **File issue** at: https://github.com/kentin0-fiz0l/HandTrack3D/issues

**Include**:
- Browser version
- Error messages (console logs)
- Steps to reproduce
- Expected vs actual behavior

---

## Post-Testing

After successful testing:
1. **Mark all checkboxes** above as complete
2. **Note any issues** found during testing
3. **Consider user feedback** for future improvements
4. **Celebrate** 🎉 - Phase 3A is complete!

---

**Happy Testing!** 🚀

**Phase 3A Status**: Ready for User Validation
**Version**: v0.3.0-alpha.0
**Date**: 2026-08-22
