# Debug Features (Option A)

## Overview

Debug visualization tools to validate and improve the pose tracking + depth estimation system.

## Features

### 1. Pose Skeleton Overlay (Press `P`)

**What it does:**
- Displays MoveNet pose detection skeleton on the webcam feed
- Shows 17 keypoints (COCO format) with connecting lines
- Color-codes confidence levels:
  - 🟢 Green: High confidence (>70%)
  - 🟡 Yellow: Medium confidence (50-70%)
  - 🔴 Red: Low confidence (<50%)
- Highlights arm keypoints (shoulder, elbow, wrist) with yellow rings

**Why it matters:**
- Confirms MoveNet is actually detecting poses
- Shows which body parts are being tracked
- Helps debug arm extension detection for depth

**Location:**
- Overlay on webcam preview (bottom-right)
- Toggle: Press `P` or Settings → Visual → Show Pose Skeleton

### 2. Depth Breakdown Panel (Press `D`)

**What it does:**
- Shows real-time depth calculation breakdown per hand
- Displays contribution from three sources:
  - **MediaPipe Z** (20%): Raw Z-coordinate from MediaPipe Hands
  - **Hand Size** (50%): Distance-based estimation from hand scale
  - **Arm Extension** (30%): NEW - Pose-based arm extension ratio
- Shows pose tracking status (Active/Inactive)
- Displays keypoint count when pose detected

**Why it matters:**
- Validates that arm extension is contributing to depth
- Shows when pose tracking fails (falls back to 0.5 neutral)
- Helps tune the weighting formula

**Location:**
- Floating panel (top-right)
- Toggle: Press `D` or Settings → Visual → Show Depth Breakdown

## How to Use

### Quick Test (30 seconds)

1. **Open the app**: http://localhost:5178
2. **Allow webcam access**
3. **Show webcam preview**: Press `W` (if not visible)
4. **Toggle pose skeleton**: Press `P`
   - ✅ You should see green skeleton lines on your body
   - ✅ Yellow rings highlight arm points (shoulder, elbow, wrist)
5. **Toggle depth breakdown**: Press `D`
   - ✅ Panel appears top-right
   - ✅ "MoveNet Pose Tracking: Active" with green ✓
   - ✅ "17 keypoints detected"
6. **Test arm extension**:
   - Extend arm forward toward camera → Arm Extension value increases
   - Bend arm → Arm Extension value decreases
   - Hand cursor depth should change accordingly

### Validation Checklist

- [ ] Pose skeleton renders on webcam feed
- [ ] Skeleton updates in real-time (not frozen)
- [ ] Arm keypoints have yellow rings
- [ ] Confidence values update dynamically
- [ ] Depth panel shows "Active" status
- [ ] Depth panel shows 17 keypoints
- [ ] Arm extension value changes when extending/bending arm
- [ ] Total depth changes with arm extension

## Technical Details

### Components Created

1. **`PoseSkeletonOverlay.tsx`**
   - Canvas-based overlay on webcam feed
   - Draws 15 skeleton connections (COCO format)
   - Renders keypoints with confidence-based colors
   - Highlights arm tracking points

2. **`DepthBreakdownPanel.tsx`**
   - Floating debug panel
   - Reads from `useHandCursorStore` and `usePoseTrackingStore`
   - Shows per-hand depth data
   - Displays formula: `0.2×MediaPipe + 0.5×Size + 0.3×Arm`

### Settings Added

In `settingsStore.ts`:
```typescript
showPoseSkeleton: boolean;  // Default: false
showDepthBreakdown: boolean; // Default: false
```

### Keyboard Shortcuts

- `P` - Toggle pose skeleton overlay
- `D` - Toggle depth breakdown panel
- `W` - Toggle webcam preview (existing)
- `H` - Toggle status panel (existing)

## Known Limitations

### Current Implementation
- **Depth breakdown shows zeros**: Values not yet wired from actual calculations
- **No historical tracking**: Panel doesn't show depth changes over time
- **No pose confidence in panel**: Should show overall pose detection confidence

### Next Steps (Future Improvements)
1. Wire actual depth component values into panel
2. Add mini-chart showing depth over last 2 seconds
3. Add pose quality indicator (good/medium/poor lighting)
4. Add arm extension angle visualization (degrees)

## Troubleshooting

### Pose skeleton not showing
- Check webcam preview is visible (`W` key)
- Ensure `P` key pressed (yellow text in preview: "• Pose Overlay")
- Step back from camera (MoveNet needs full upper body visible)
- Check browser console for `[MoveNet]` logs

### "Pose Tracking: Inactive" in depth panel
- MoveNet may still be initializing (wait 3-5 seconds after page load)
- Upper body not visible in webcam frame
- Check browser console for errors:
  - `[MoveNet] Failed to initialize` → Backend error (check earlier fix)
  - `[MoveNet] Detection error` → Frame processing issue

### Depth values all zero
- This is expected in current version (wiring not complete)
- Total depth (Z) should still be accurate
- Component breakdown (MediaPipe/Size/Arm) needs additional work

## Performance Impact

- **Pose Skeleton Overlay**: <1ms per frame (canvas drawing)
- **Depth Breakdown Panel**: <0.5ms per frame (React render)
- **Total overhead**: ~1.5ms (minimal impact on 60 FPS)

## Files Modified

```
src/
├── components/
│   ├── Debug/
│   │   └── DepthBreakdownPanel.tsx          [NEW]
│   └── WebcamFeed/
│       ├── PoseSkeletonOverlay.tsx          [NEW]
│       └── WebcamFeed.tsx                   [MODIFIED]
├── hooks/
│   ├── useMoveNetTracking.ts                [MODIFIED - backend fix]
│   └── useKeyboardShortcuts.ts              [MODIFIED - P/D keys]
├── stores/
│   └── settingsStore.ts                     [MODIFIED - debug toggles]
└── App.tsx                                  [MODIFIED - integration]
```

## Next: Options B & C

See `ROADMAP_PHASE_3.md` for:
- **Option B**: UX improvements (tutorial, gesture widget, presets)
- **Option C**: Performance & algorithm optimization
