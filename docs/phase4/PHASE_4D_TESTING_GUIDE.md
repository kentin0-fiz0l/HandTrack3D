# Phase 4D: IMU Integration - Testing Guide

**Status**: Ready for Testing
**Build**: ✅ Passed
**Type Check**: ✅ Passed
**Dev Server**: ✅ Starts without errors

---

## Quick Start

```bash
cd /Users/kentino/Projects/Active/HandTrack3D
pnpm dev
# Opens http://localhost:5173 (or 5174 if 5173 in use)
```

---

## Desktop Testing (Local Development)

### Test 1: Basic Compilation

**Objective**: Verify all files compile without errors

```bash
pnpm run build
```

**Expected**:
- ✅ Build succeeds
- ✅ No TypeScript errors
- ✅ All 5 packages build successfully

**Status**: ✅ Passed

---

### Test 2: IMU Hook Initialization

**Objective**: Verify `useIMUOrientation` initializes correctly on desktop

**Steps**:
1. Open http://localhost:5173
2. Open browser DevTools → Console
3. Look for IMU-related log messages

**Expected Console Output**:
```
[IMU] DeviceOrientationEvent not supported (likely desktop browser)
[Sensor Fusion] Camera pose updated: pos=(0.00, 0.00, 0.00) ±2.50m, orientation=identity
```

**Key Indicators**:
- ✅ No JavaScript errors
- ✅ IMU hook recognizes desktop environment
- ✅ Falls back to identity quaternion
- ✅ Sensor fusion service operates normally

---

### Test 3: Debug Panel Display

**Objective**: Verify debug panel shows IMU status correctly

**Steps**:
1. Open http://localhost:5173
2. Enable WiFi positioning (if not auto-enabled)
3. Set positioning mode to "Fusion"
4. Look for "Sensor Fusion" debug panel (bottom-left)

**Expected Display**:
```
Sensor Fusion              [●] Active
─────────────────────────────────
Active Filters:            0
Camera Pose:               Available
Avg Uncertainty:           ±0.000m
─────────────────────────────────
IMU Orientation:           Unavailable
```

**Key Indicators**:
- ✅ "IMU Orientation: Unavailable" (gray text)
- ✅ No Euler angles displayed (no IMU data)
- ✅ No iOS permission button (desktop browser)

---

### Test 4: Simulator Activation (Optional)

**Objective**: Test IMU simulator keyboard controls

**Steps**:
1. Modify `useIMUOrientation.ts` to force simulator activation:
   ```typescript
   // Add at end of useIMUOrientation():
   useEffect(() => {
     if (import.meta.env.DEV) {
       const simulator = autoStartSimulator();
       if (simulator) {
         simulator.addEventListener('deviceorientation', handleOrientation as any);
       }
     }
   }, []);
   ```

2. Reload app
3. Press keyboard keys: ↑↓←→QER

**Expected Console Output**:
```
[IMU Simulator] Started - keyboard controls enabled
[IMU Simulator] α=0.0° β=5.0° γ=0.0°  (after pressing ↑)
[IMU Simulator] α=5.0° β=5.0° γ=0.0°  (after pressing →)
[Sensor Fusion] Camera pose updated: orientation=IMU
```

**Expected Debug Panel**:
```
IMU Orientation:           Active
α (yaw):                   5.0°
β (pitch):                 5.0°
γ (roll):                  0.0°
```

**Key Indicators**:
- ✅ Keyboard controls change Euler angles
- ✅ Debug panel shows real-time angle updates
- ✅ Sensor fusion logs "orientation=IMU"

---

## Mobile Testing (iOS)

### Prerequisites

1. **HTTPS Required**: DeviceOrientationEvent only works over HTTPS
   ```bash
   # Deploy to Vercel, Netlify, or use ngrok
   pnpm build
   # Deploy via your preferred method
   ```

2. **iOS 13+**: Required for permission API

---

### Test 5: Permission Prompt Flow

**Objective**: Verify iOS permission prompt appears and works

**Steps**:
1. Open app on iOS device (HTTPS)
2. Wait for permission modal to appear

**Expected**:
- ✅ Modal appears with title "Enable Camera Orientation"
- ✅ Clear explanation of why IMU access is needed
- ✅ Two buttons: "Not Now" and "Allow"

**Test 5a: Grant Permission**

**Steps**:
1. Click "Allow" button
2. Grant permission in iOS system prompt

**Expected**:
- ✅ Modal dismisses
- ✅ Debug panel shows "IMU Orientation: Active" (green)
- ✅ Euler angles appear in debug panel
- ✅ Console logs: `[IMU] Permission granted (iOS)`

**Test 5b: Deny Permission**

**Steps**:
1. Click "Not Now" or deny in system prompt

**Expected**:
- ✅ Modal dismisses
- ✅ Debug panel shows "IMU Orientation: Unavailable" (gray)
- ✅ No Euler angles displayed
- ✅ Hand tracking still works (identity quaternion fallback)

---

### Test 6: Physical Rotation

**Objective**: Verify IMU tracks device rotation accurately

**Prerequisites**: Permission granted

**Steps**:
1. Hold device level (0° pitch, 0° roll)
2. Note initial Euler angles in debug panel
3. Tilt device forward (pitch up) → note beta increases
4. Tilt device backward (pitch down) → note beta decreases
5. Rotate device left (yaw) → note alpha decreases
6. Rotate device right (yaw) → note alpha increases
7. Tilt device left (roll) → note gamma decreases
8. Tilt device right (roll) → note gamma increases

**Expected**:
- ✅ Euler angles update in real-time (~60Hz)
- ✅ Angle changes match physical rotation
- ✅ Values stay within valid ranges:
  - α (alpha): 0-360°
  - β (beta): -180 to 180°
  - γ (gamma): -90 to 90°

---

### Test 7: Hand Tracking with Rotation

**Objective**: Verify hand tracking accuracy during device rotation

**Prerequisites**:
- Permission granted
- WiFi positioning active (fusion mode)
- Room position calibrated

**Steps**:
1. Enable webcam and MediaPipe hand tracking
2. Hold hand in front of camera
3. Grab virtual object (pinch gesture)
4. Slowly rotate device while holding object
5. Observe object position stability

**Expected**:
- ✅ Hand cursor follows physical hand
- ✅ Virtual object stays attached during rotation
- ✅ Room-relative position remains stable (±1-2cm)
- ✅ No drift or coordinate system jumps
- ✅ FPS stays 58-60fps (no performance degradation)

**Console Verification**:
```
[Sensor Fusion] Camera pose updated: orientation=IMU
[Sensor Fusion] Hand tracking updated: roomPos=(1.23, 2.34, 3.45)
```

---

### Test 8: Performance Validation

**Objective**: Measure performance impact of IMU integration

**Prerequisites**: Permission granted, hand tracking active

**Steps**:
1. Open Performance Monitor (in app)
2. Track hand for 30 seconds with device rotation
3. Note FPS, frame time, memory usage

**Expected Metrics**:
- ✅ FPS: 58-60fps (3D rendering)
- ✅ Frame Time: <18ms (within budget)
- ✅ Hand Tracking: 30 Hz (no degradation)
- ✅ IMU Updates: ~60 Hz (passive)
- ✅ Memory: Stable (no leaks)

**Console Verification**:
```
[Performance] FPS: 60, Frame: 16.7ms
[IMU] α=45.0° β=10.0° γ=0.0°
[Sensor Fusion] Uncertainty: ±0.015m
```

---

## Mobile Testing (Android)

### Test 9: Auto-Granted Permissions

**Objective**: Verify Android auto-grants DeviceOrientation permission

**Steps**:
1. Open app on Android device (HTTPS)
2. Check for permission prompt

**Expected**:
- ✅ No permission prompt appears
- ✅ Debug panel immediately shows "IMU Orientation: Active"
- ✅ Euler angles display immediately
- ✅ Console logs: `[IMU] Starting orientation listener (auto-granted)`

**Follow-up**: Run Tests 6-8 (Physical Rotation, Hand Tracking, Performance)

---

## Edge Case Testing

### Test 10: No Gyroscope

**Objective**: Verify graceful fallback when device lacks sensors

**Steps**:
1. Test on device without gyroscope (e.g., older phone)
2. Grant permission (if iOS)
3. Wait 2 seconds

**Expected**:
- ✅ Debug panel shows "IMU Orientation: Unavailable"
- ✅ Console logs: `[IMU] No orientation data received after 2s`
- ✅ Hand tracking still works (identity quaternion)
- ✅ No JavaScript errors

---

### Test 11: Background/Foreground Transitions

**Objective**: Verify IMU re-subscribes after app backgrounding

**Steps**:
1. Grant IMU permission
2. Verify Euler angles updating
3. Background app (home button or switch apps)
4. Wait 10 seconds
5. Foreground app

**Expected**:
- ✅ Euler angles resume updating
- ✅ No need to re-grant permission
- ✅ No console errors

---

### Test 12: Permission Persistence

**Objective**: Verify permission persists across page reloads

**Steps**:
1. Grant IMU permission
2. Reload page (hard refresh)
3. Check IMU status

**Expected**:
- ✅ No permission prompt appears
- ✅ IMU immediately active
- ✅ Euler angles display immediately

---

## Troubleshooting

### Issue: "IMU Orientation: Unavailable" on Mobile

**Possible Causes**:
1. Not served over HTTPS
2. Permission denied
3. Device lacks gyroscope
4. DeviceOrientationEvent not supported (very old browser)

**Solution**:
- Verify HTTPS connection
- Check browser console for permission errors
- Try different browser (Chrome, Safari, Firefox)

---

### Issue: Euler Angles Not Updating

**Possible Causes**:
1. Device sensors disabled in settings
2. Browser doesn't support DeviceOrientationEvent
3. JavaScript error in orientation handler

**Solution**:
- Check device Settings → Privacy → Motion & Orientation
- Open DevTools → Console, look for errors
- Try hard refresh (Ctrl+Shift+R)

---

### Issue: Hand Tracking Jumps During Rotation

**Possible Causes**:
1. Coordinate system conversion incorrect
2. Quaternion not normalized
3. Sensor fusion not applying rotation

**Solution**:
- Check console for `[Sensor Fusion] orientation=IMU`
- Verify coordinate transform in `SensorFusionService.ts:216-226`
- Test with simulator first (desktop)

---

## Test Checklist

### Desktop
- [ ] Build passes
- [ ] Type check passes
- [ ] Dev server starts without errors
- [ ] Debug panel shows "IMU Orientation: Unavailable"
- [ ] No console errors
- [ ] Hand tracking works normally (identity quaternion)

### iOS
- [ ] Permission prompt appears
- [ ] "Allow" grants permission
- [ ] "Not Now" dismisses without errors
- [ ] Euler angles update on rotation
- [ ] Hand tracking accurate during rotation
- [ ] Performance: 60fps maintained
- [ ] Permission persists across reloads

### Android
- [ ] No permission prompt (auto-granted)
- [ ] IMU immediately active
- [ ] Euler angles update on rotation
- [ ] Hand tracking accurate during rotation
- [ ] Performance: 60fps maintained

### Edge Cases
- [ ] No gyroscope → graceful fallback
- [ ] Background/foreground → IMU resumes
- [ ] Permission denied → identity quaternion
- [ ] HTTPS only → error on HTTP

---

## Next Steps After Testing

1. **Document Results**: Update PHASE_4D_SUMMARY.md with test results
2. **Fix Issues**: Address any bugs found during testing
3. **Performance Tuning**: Optimize if FPS drops below 58fps
4. **User Feedback**: Collect feedback on permission prompt UX
5. **Phase 4E**: Begin adaptive Kalman filtering implementation

---

## Contact

If you encounter issues during testing:
1. Check browser console for errors
2. Verify HTTPS deployment (required for mobile)
3. Test on multiple devices (iOS + Android)
4. Document reproduction steps
5. Check `docs/phase4/PHASE_4D_SUMMARY.md` for known limitations
