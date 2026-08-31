# Demo Recording Guide

This guide helps you create professional demo videos and GIFs showcasing HandTrack3D's features.

## Prerequisites

### Software
- **Screen Recorder**: QuickTime (macOS), OBS Studio (cross-platform), or similar
- **GIF Converter**: ffmpeg, ezgif.com, or Gifski
- **Video Editor** (optional): iMovie, DaVinci Resolve, or ScreenFlow

### Hardware
- Webcam (720p or better)
- Good lighting on your hands
- Plain background recommended
- WiFi router info (for Phase 4 demos)

---

## Recording Setup

### Display Settings
1. Set browser to **1920x1080** or **1280x720** resolution
2. Zoom to **100%** (no browser zoom)
3. Hide browser toolbars (press **F11** for fullscreen)
4. Disable desktop notifications

### Lighting
- Position light **in front** of you (not behind)
- Avoid harsh shadows on hands
- Use natural light or soft white LED

### Camera Position
- **Distance**: 1.5-2 feet from webcam
- **Height**: Camera at eye level
- **Framing**: Hands visible in center of frame

---

## Demo Scenarios

### 1. Quick Start (30 seconds)
**Purpose**: Show first-time user experience
**Duration**: 30 seconds
**File**: `demo-quickstart.mp4` or `demo-quickstart.gif`

**Script**:
1. Load https://kentin0-fiz0l.github.io/HandTrack3D/
2. Allow webcam permission
3. Interactive tutorial auto-starts
4. Follow tutorial: show hand → pinch → grab → release
5. Success! Object falls

**Recording Tips**:
- Keep hands in frame throughout
- Move slowly and deliberately
- Pause 1 second after each action

---

### 2. Gesture Detection (15 seconds)
**Purpose**: Show real-time gesture recognition
**Duration**: 15 seconds
**File**: `demo-gestures.gif`

**Script**:
1. Gesture widget visible (top-left)
2. Perform gestures in sequence:
   - Open hand (5 fingers extended)
   - Fist (all fingers curled)
   - Point (index finger extended)
   - Pinch (thumb + index touch)
3. Watch confidence bars update

**GIF Settings**:
- Resolution: 800x600
- FPS: 15
- Loop: Yes
- Duration: 15 seconds

---

### 3. Build Mode (20 seconds)
**Purpose**: Show drag-to-place object creation
**Duration**: 20 seconds
**File**: `demo-buildmode.mp4`

**Script**:
1. Press **B** to enter build mode
2. Click anywhere in 3D scene
3. Ghost object preview appears
4. Click to place object (snaps to grid)
5. Press **B** to exit build mode
6. Object falls with gravity

**Annotations** (add in video editor):
- "Press B for Build Mode" (overlay text)
- "Click to place" arrow pointing to cursor

---

### 4. Settings Presets (10 seconds)
**Purpose**: Show one-click configuration
**Duration**: 10 seconds
**File**: `demo-presets.gif`

**Script**:
1. Open Settings (press **S**)
2. Click "Responsive" preset
3. All settings update instantly
4. Show gesture detection is faster
5. Click "Precise" preset
6. Show gesture detection is more stable

**Callouts**:
- Highlight preset cards
- Show settings sliders updating

---

### 5. WiFi Positioning Setup (60 seconds)
**Purpose**: Show room-scale positioning setup
**Duration**: 60 seconds
**File**: `demo-wifi-setup.mp4`

**Script**:
1. Terminal: `cd tools/wifi-companion && npm start`
2. WiFi companion app starts (WebSocket server on :8080)
3. Browser: Open Settings → Positioning tab
4. Toggle "Enable Positioning" ON
5. Click "Calibrate Routers"
6. Calibration wizard opens (4 steps)
7. Select WiFi network from scan
8. Enter router 1: Name="Living Room", Position=(0, 0, 0)
9. Add router 2: Name="Bedroom", Position=(5, 0, 3)
10. Add router 3: Name="Kitchen", Position=(0, 0, 5)
11. Finish calibration
12. Positioning status widget shows "Connected, 3 routers"

**Annotations**:
- Split screen: terminal + browser
- Highlight WiFi status widget

---

### 6. Sensor Fusion in Action (30 seconds)
**Purpose**: Show real-time sensor fusion
**Duration**: 30 seconds
**File**: `demo-sensor-fusion.mp4`

**Script**:
1. Positioning enabled, mode = "Sensor Fusion"
2. Room origin marker visible (XYZ axes at 0,0,0)
3. Show hand moving in 3D space
4. Fusion debug panel (bottom-left) shows:
   - Active filters: 2
   - Camera pose: Available
   - Avg uncertainty: ±0.015m
5. Hand positions update in room coordinates
6. Move camera → hand positions stay in room coords (not camera-relative!)

**Callouts**:
- Highlight room origin marker
- Zoom into fusion debug panel
- Text overlay: "±1-2cm accuracy in room coordinates"

---

### 7. Per-Object Customization (25 seconds)
**Purpose**: Show property editor
**Duration**: 25 seconds
**File**: `demo-property-editor.mp4`

**Script**:
1. Right-click an object
2. Property panel opens
3. Adjust Mass slider (1.0 → 5.0)
4. Object becomes heavier (falls faster)
5. Toggle "Lock Position (Static)"
6. Object freezes in place (ignore gravity)
7. Change color to red
8. Click "Reset to Defaults"

**Annotations**:
- Arrow pointing to right-click
- Highlight property changes

---

## Recording Workflow

### Step 1: Record Raw Footage
```bash
# Option A: QuickTime (macOS)
# File → New Screen Recording → Select area → Record

# Option B: OBS Studio
# Sources → Display Capture → Start Recording
```

**Recording Settings**:
- Resolution: 1920x1080 or 1280x720
- FPS: 30 or 60
- Format: MP4 (H.264)

### Step 2: Trim & Edit
```bash
# Option A: QuickTime
# Edit → Trim → Drag handles → Done

# Option B: ffmpeg
ffmpeg -i raw.mp4 -ss 00:00:05 -t 00:00:30 -c copy trimmed.mp4
```

### Step 3: Convert to GIF (Optional)
```bash
# High-quality GIF with ffmpeg
ffmpeg -i demo.mp4 -vf "fps=15,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" demo.gif

# Or use online tool: https://ezgif.com/video-to-gif
```

**GIF Settings**:
- Resolution: 800x600 or 1024x768
- FPS: 10-15 (lower = smaller file)
- Colors: 256
- Dithering: None or Sierra
- Loop: Forever

### Step 4: Optimize
```bash
# Reduce GIF file size
gifsicle -O3 --colors 128 demo.gif -o demo-optimized.gif

# Target: < 5MB for social media
```

---

## Publishing Locations

### README.md
Add to top of README:
```markdown
## Demo Videos

### Quick Start
![Quick Start Demo](./docs/demos/demo-quickstart.gif)

### Sensor Fusion
[![Sensor Fusion Demo](./docs/demos/demo-sensor-fusion-thumb.png)](./docs/demos/demo-sensor-fusion.mp4)
```

### GitHub Release
Attach to release:
1. Go to https://github.com/kentin0-fiz0l/HandTrack3D/releases/tag/v0.4.0-alpha.0
2. Click "Edit release"
3. Drag & drop video files
4. Update description with embedded videos

### Social Media

**Twitter/X**:
- Max: 2:20 (140 seconds)
- Recommended: 30-45 seconds
- Format: MP4, 1280x720, 30fps
- Captions: Auto-generated or manual

**YouTube**:
- Upload full demos (1-3 minutes each)
- Create playlist: "HandTrack3D Features"
- Title format: "HandTrack3D - [Feature Name] Demo"

**Reddit** (r/webdev, r/computervision):
- Upload to Imgur or v.redd.it
- Post with description + link to GitHub

---

## Demo Checklist

Before recording:
- [ ] Browser at 100% zoom
- [ ] Webcam permissions granted
- [ ] Good lighting on hands
- [ ] Plain background
- [ ] Notifications disabled
- [ ] Screen recorder ready
- [ ] Script reviewed

During recording:
- [ ] Speak slowly and clearly (if narrating)
- [ ] Move hands deliberately
- [ ] Pause between actions
- [ ] Keep UI elements in frame
- [ ] Check lighting/framing

After recording:
- [ ] Trim dead space at start/end
- [ ] Check audio levels (if narrated)
- [ ] Add callouts/annotations
- [ ] Test playback on different devices
- [ ] Optimize file size (< 5MB for GIFs)

---

## Sample File Structure

```
docs/
└── demos/
    ├── demo-quickstart.gif          (< 3MB)
    ├── demo-gestures.gif            (< 2MB)
    ├── demo-buildmode.mp4           (< 10MB)
    ├── demo-presets.gif             (< 2MB)
    ├── demo-wifi-setup.mp4          (< 15MB)
    ├── demo-sensor-fusion.mp4       (< 10MB)
    ├── demo-property-editor.mp4     (< 8MB)
    └── thumbnails/
        ├── quickstart-thumb.png
        ├── sensor-fusion-thumb.png
        └── ...
```

---

## Tips for High-Quality Demos

### Smooth Motion
- Use trackpad/mouse smoothly (no jerky movements)
- Practice gestures before recording
- Record multiple takes, keep the best

### Clear Focus
- One feature per demo (don't combine scenarios)
- Show feature → explain benefit → show result
- Keep demos under 30 seconds for GIFs

### Professional Polish
- Add subtle background music (optional, royalty-free)
- Use consistent color scheme in callouts
- Brand with HandTrack3D logo in corner

### Accessibility
- Add captions/subtitles for narrated videos
- Use high-contrast callout text
- Provide text alternative descriptions

---

## Quick Commands Reference

```bash
# Record with OBS
obs --startrecording

# Trim video
ffmpeg -i input.mp4 -ss START -t DURATION -c copy output.mp4

# Convert to GIF
ffmpeg -i input.mp4 -vf "fps=15,scale=800:-1" output.gif

# Optimize GIF
gifsicle -O3 --colors 128 input.gif -o output.gif

# Create thumbnail
ffmpeg -i input.mp4 -ss 00:00:05 -vframes 1 thumbnail.png

# Compress video
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:v 2000k output.mp4
```

---

## Next Steps

1. **Record core demos** (quickstart, gestures, sensor fusion)
2. **Upload to GitHub** (in `docs/demos/` folder)
3. **Update README** with embedded demos
4. **Share on social media** (Twitter, Reddit, YouTube)
5. **Add to release notes** (v0.4.0-alpha.0)

Happy recording! 🎥
