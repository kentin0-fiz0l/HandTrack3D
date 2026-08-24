# Demo Video Recording Script

**Goal**: Create 60-second demo video for beta recruitment
**Time**: 20-30 minutes (recording + editing)
**Output**: `public/demo/handtrack3d-demo.mov`

---

## Recording Setup (5 minutes)

### Before You Start

1. **Close unnecessary apps** - Free up screen space
2. **Good lighting** - Hand tracking works best in good light
3. **Clean background** - Professional browser window
4. **Test webcam** - Make sure it works
5. **Clear browser cache** - Fresh first-time experience

### QuickTime Setup

```bash
# Open QuickTime Player
open -a "QuickTime Player"
```

1. **File** → **New Screen Recording**
2. **Options** dropdown:
   - Microphone: None (silent demo is fine)
   - Quality: Maximum
   - Show Mouse Clicks: ✅ (helpful for viewers)
3. Click **Record** button
4. Select region: **Click and drag** around browser window (not full screen)
5. Click **Start Recording**

---

## Recording Script (60 seconds)

### Scene 1: Loading & Tutorial Start (0:00-0:10)

**Action**:
1. Open staging URL in browser
2. Allow webcam permission (click Allow)
3. Tutorial overlay appears

**What viewers see**:
- Clean browser with HandTrack3D loading
- Webcam permission prompt
- Tutorial Step 1: "Welcome to HandTrack3D"

**Timing**: 10 seconds

---

### Scene 2: Hand Detection (0:10-0:20)

**Action**:
1. Show your hand to camera
2. Blue/green cursor appears following hand
3. Gesture widget shows "open" or "none"

**What viewers see**:
- Hand enters frame
- 3D cursor materializes
- Smooth hand tracking
- Gesture widget updating

**Timing**: 10 seconds

---

### Scene 3: Grab & Throw (0:20-0:35)

**Action**:
1. Move hand near a cube
2. Pinch (thumb + index finger together)
3. Move hand around with object grabbed
4. Open hand to throw/release
5. Object falls with physics

**What viewers see**:
- Hand approaching object
- Grab range indicator (if enabled)
- Object attached to hand cursor
- Object flying when released
- Realistic physics

**Timing**: 15 seconds

---

### Scene 4: Build Mode (0:35-0:45)

**Action**:
1. Press **B** key (Build Mode)
2. Move mouse cursor around
3. Click to place a new object
4. Ghost preview appears before placement
5. Object snaps to grid

**What viewers see**:
- "Build Mode ON" indicator
- Ghost object preview following cursor
- Grid snapping
- New object placed

**Timing**: 10 seconds

---

### Scene 5: Settings & Features (0:45-0:55)

**Action**:
1. Press **S** key (Settings panel)
2. Show Settings Presets tabs
3. Click "Responsive" preset
4. Settings panel updates
5. Close panel (Press S again)

**What viewers see**:
- Settings panel sliding in
- Multiple preset options
- Instant configuration change
- Clean UI

**Timing**: 10 seconds

---

### Scene 6: Final Demo (0:55-1:00)

**Action**:
1. Quick grab and throw of another object
2. Show multiple objects interacting
3. End with hand waving or gesture

**What viewers see**:
- Confident, smooth interaction
- Physics working nicely
- Professional finish

**Timing**: 5 seconds

---

## Post-Recording (10 minutes)

### Stop Recording

1. Click **Stop Recording** button (menu bar)
2. Video appears in QuickTime Player

### Trim & Edit

1. **Edit** → **Trim**
2. Drag yellow handles to:
   - Remove pre-recording setup
   - Remove post-recording cleanup
   - Keep exactly 60 seconds (or less)
3. Click **Trim**

### Export

1. **File** → **Export As** → **1080p**
2. Save as: `handtrack3d-demo.mov`
3. Location: `~/Downloads/`

### Upload to GitHub

```bash
cd ~/Projects/Active/HandTrack3D

# Create demo directory
mkdir -p public/demo

# Move video
mv ~/Downloads/handtrack3d-demo.mov public/demo/

# Commit
git add public/demo/handtrack3d-demo.mov
git commit -m "docs: add beta demo video (60s)

- Shows: hand detection → tutorial → grab → build mode → settings
- 1080p screen recording
- 60 seconds, ~15MB file size

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

git push
```

### Get Video URL

Your video will be available at:
```
https://raw.githubusercontent.com/kentin0-fiz0l/HandTrack3D/master/public/demo/handtrack3d-demo.mov
```

Or use GitHub's CDN:
```
https://github.com/kentin0-fiz0l/HandTrack3D/raw/master/public/demo/handtrack3d-demo.mov
```

---

## Alternative: Screenshots Only (5 minutes)

If video recording is too complex, take 5 key screenshots:

### Screenshot 1: Tutorial Overlay
```bash
# Cmd + Shift + 4, select area
# Save as: ~/Desktop/screenshot-1-tutorial.png
```
**Shows**: Tutorial Step 3 with hand detection prompt

### Screenshot 2: Hand Tracking
**Shows**: Hand cursor visible, gesture widget showing "pinch"

### Screenshot 3: Grabbing Object
**Shows**: Object attached to hand, mid-air

### Screenshot 4: Build Mode
**Shows**: Grid overlay, ghost object preview

### Screenshot 5: Settings Panel
**Shows**: Presets visible, clean UI

### Upload Screenshots
```bash
mkdir -p public/demo
mv ~/Desktop/screenshot-*.png public/demo/

git add public/demo/
git commit -m "docs: add beta demo screenshots

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push
```

---

## Pro Tips

### Lighting
- ✅ Face a window (natural light)
- ✅ Turn on room lights
- ❌ Avoid backlighting (window behind you)

### Hand Position
- Keep hand 1-2 feet from camera
- Show palm to camera (fingers facing up)
- Avoid fast movements (looks jittery)

### Browser
- Use Chrome (best MediaPipe performance)
- Hide bookmarks bar (View → Hide Bookmarks Bar)
- Hide browser chrome if possible (F11 fullscreen)
- Zoom to 100% (Cmd+0)

### Recording Quality
- Close all other apps (CPU intensive)
- Disable notifications (Focus mode)
- Restart browser before recording (clean slate)

### Common Mistakes
- ❌ Recording entire screen (too much UI)
- ❌ Recording in dim lighting (tracking fails)
- ❌ Too fast (viewers can't follow)
- ❌ No clear narrative (random actions)
- ✅ Focus on browser window only
- ✅ Good lighting + slow movements
- ✅ Follow the 6-scene script above

---

## Checklist

**Before Recording**:
- [ ] Staging deployment works
- [ ] Webcam works in good lighting
- [ ] Browser clean (no clutter)
- [ ] QuickTime ready

**During Recording** (60 seconds):
- [ ] Scene 1: Tutorial appears (0:00-0:10)
- [ ] Scene 2: Hand detection works (0:10-0:20)
- [ ] Scene 3: Grab and throw object (0:20-0:35)
- [ ] Scene 4: Build mode demo (0:35-0:45)
- [ ] Scene 5: Settings presets (0:45-0:55)
- [ ] Scene 6: Final smooth demo (0:55-1:00)

**After Recording**:
- [ ] Trimmed to 60 seconds
- [ ] Exported as 1080p
- [ ] Uploaded to GitHub
- [ ] URL saved to URLS.txt

---

## What If Recording Fails?

### Hand Tracking Not Working
- Check lighting (face window/lights)
- Test webcam in Photo Booth first
- Try different browser (Chrome recommended)
- Increase detection confidence in Settings

### Video Too Large
- Export as 720p instead of 1080p
- Use shorter duration (45 seconds)
- Compress with HandBrake (free)

### QuickTime Not Available
**macOS Alternative**: Screenshot.app (Cmd + Shift + 5)
**Cross-platform**: OBS Studio (free, more powerful)

---

**Status**: Ready to Record
**Next**: Open staging URL, start QuickTime, follow script
**Expected Output**: 60-second demo video (~10-20MB)
