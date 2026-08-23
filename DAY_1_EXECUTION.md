# Day 1 Execution Guide - RIGHT NOW

**Status**: Ready to Execute ⚡
**Time Required**: ~1 hour total
**Current Time**: 2026-08-23

---

## ✅ Completed

- [x] All planning documents created
- [x] Beta materials templates ready
- [x] Phase 3A tagged as v0.3.0-alpha.0

---

## 🎯 Task 1: Create Google Form Survey (20 minutes)

### Step 1: Open Google Forms
1. Go to https://forms.google.com
2. Click **+ Blank** (top-left, purple plus icon)
3. Title: `HandTrack3D Beta Testing Feedback`

### Step 2: Add Description
Click "Form description" and paste:
```
Thank you for testing HandTrack3D v0.3.0-alpha.0! Your feedback will directly shape the beta release. This survey takes ~5 minutes.
```

### Step 3: Copy Questions from Template

Open `/Users/kentino/Projects/Active/HandTrack3D/BETA_SURVEY_TEMPLATE.md` and copy questions 1-22 into the form.

**Quick Copy Method**:
```bash
# Open template in your editor
code /Users/kentino/Projects/Active/HandTrack3D/BETA_SURVEY_TEMPLATE.md

# Copy sections 1-5 (22 questions total)
# Paste into Google Forms one by one
```

### Step 4: Configure Form Settings
1. Click **Settings** (gear icon, top-right)
2. **Responses** tab:
   - ✅ Limit to 1 response (requires sign-in)
   - ✅ Collect email addresses
   - ✅ Response receipts: "Respondents can request"
3. **Presentation** tab:
   - ✅ Show progress bar
   - Confirmation message: "Thank you! Your feedback is incredibly valuable. 🙏"
4. Click **Save**

### Step 5: Create Response Spreadsheet
1. Click **Responses** tab (in form editor)
2. Click green spreadsheet icon (top-right)
3. Select **Create a new spreadsheet**
4. Name: `HandTrack3D Beta Responses`
5. Click **Create**

### Step 6: Get Shareable Link
1. Click **Send** button (top-right)
2. Click **Link** icon (chain link)
3. Click **Shorten URL**
4. Click **COPY**
5. Save this URL → You'll use it for `[SURVEY_URL]`

**Result**: You now have your survey URL (looks like `https://forms.gle/xxxxx`)

---

## 🎯 Task 2: Deploy to Vercel Staging (30 minutes)

### Prerequisites Check
```bash
cd ~/Projects/Active/HandTrack3D

# Check build works locally
npx vite build

# Expected: "dist" folder created with index.html and assets/
ls -la dist/
```

### Step 1: Install Vercel CLI (if not installed)
```bash
npm install -g vercel

# Verify
vercel --version
# Should show: Vercel CLI 33.x.x or higher
```

### Step 2: Login to Vercel
```bash
vercel login
# Follow prompts:
# 1. Choose email authentication
# 2. Check your email
# 3. Click verification link
```

### Step 3: Deploy
```bash
cd ~/Projects/Active/HandTrack3D
vercel
```

**Prompts and Answers**:
```
? Set up and deploy "~/Projects/Active/HandTrack3D"?
→ Y (Yes)

? Which scope do you want to deploy to?
→ [Your Username] (personal account)

? Link to existing project?
→ N (No)

? What's your project's name?
→ handtrack3d-beta

? In which directory is your code located?
→ ./ (press Enter)

? Auto-detected Project Settings (Vite):
  - Build Command: vite build
  - Output Directory: dist
  - Development Command: vite dev --port $PORT
  ? Want to override settings?
→ N (No - defaults are correct)
```

**Deployment Process** (~2 minutes):
```
🔗  Linked to username/handtrack3d-beta (created .vercel)
🔍  Inspect: https://vercel.com/username/handtrack3d-beta/XXXXXXX
✅  Production: https://handtrack3d-beta-xxxx.vercel.app [2m 15s]
```

### Step 4: Save Staging URL
Copy the URL from output (looks like `https://handtrack3d-beta-xxxx.vercel.app`)

**Result**: You now have your staging URL for `[STAGING_URL]`

---

## 🎯 Task 3: Test Staging Deployment (10 minutes)

### Open Deployment
```bash
# Open staging URL in browser
open https://handtrack3d-beta-xxxx.vercel.app  # Replace with YOUR URL
```

### Testing Checklist
Go through this checklist in the browser:

**Page Load**:
- [ ] Page loads without errors
- [ ] No console errors (open DevTools → Console)

**Webcam & Tutorial**:
- [ ] Webcam permission prompt appears
- [ ] Tutorial overlay appears on first visit
- [ ] Can complete Step 1 (Welcome)
- [ ] Can complete Step 2 (Webcam)
- [ ] Can complete Step 3 (Show hand)

**Hand Tracking**:
- [ ] Hand cursor appears (green or blue sphere)
- [ ] Cursor follows hand movement
- [ ] Gesture widget shows current gesture (top-left)

**Interactions**:
- [ ] Can grab object (pinch near cube)
- [ ] Can throw object (open hand while holding)
- [ ] Build mode works (Press B)
- [ ] Settings panel works (Press S)

**Performance**:
- [ ] 3D rendering: 55-60 FPS
- [ ] Hand tracking: 28-30 FPS
- [ ] No lag or stuttering

### If Any Issues Found
```bash
# Check deployment logs
vercel logs

# Redeploy if needed
vercel --force
```

**Result**: Staging deployment verified working ✅

---

## 🎯 Task 4: Create Demo Assets (30 minutes)

### Option A: Screen Recording (Recommended)

**macOS QuickTime Method**:
1. Open QuickTime Player
2. File → New Screen Recording
3. Click record, select browser window
4. Record 30-60 seconds showing:
   - Hand appears → Cursor visible
   - Tutorial step completion
   - Grab and throw object
   - Build mode (Press B)
   - Settings presets (Press S)
5. Stop recording
6. File → Export As → 1080p
7. Save as `handtrack3d-demo.mov`

**Upload to GitHub**:
```bash
cd ~/Projects/Active/HandTrack3D

# Create demo folder
mkdir -p public/demo

# Move video
mv ~/Downloads/handtrack3d-demo.mov public/demo/

# Commit
git add public/demo/handtrack3d-demo.mov
git commit -m "docs: add beta demo video

- 60-second demo showing tutorial, grab, build mode
- 1080p screen recording for beta recruitment

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push
```

### Option B: Screenshots (5 minutes)

Take 5 screenshots (Cmd+Shift+4):
1. Tutorial overlay (Step 3)
2. Gesture widget showing "pinch"
3. Build mode with grid
4. Settings presets panel
5. Property editor

**Save screenshots**:
```bash
mkdir -p public/demo
# Move screenshots to public/demo/
mv ~/Desktop/screenshot-*.png public/demo/

git add public/demo/*.png
git commit -m "docs: add beta demo screenshots"
git push
```

**Get URLs**:
After pushing, your URLs will be:
- Video: `https://raw.githubusercontent.com/kentin0-fiz0l/HandTrack3D/master/public/demo/handtrack3d-demo.mov`
- Screenshots: `https://raw.githubusercontent.com/kentin0-fiz0l/HandTrack3D/master/public/demo/screenshot-1.png`

**Result**: You now have your demo URL for `[DEMO_VIDEO]`

---

## 🎯 Task 5: Update Templates with Real URLs (10 minutes)

Now that you have all 3 URLs, update the templates:

### Update Files
```bash
cd ~/Projects/Active/HandTrack3D/beta-materials

# 1. Update beta-invitation-email.md
code beta-invitation-email.md
# Replace:
# [STAGING_URL_HERE] → https://handtrack3d-beta-xxxx.vercel.app
# [SURVEY_URL_HERE] → https://forms.gle/xxxxx
# [DEMO_VIDEO_URL_HERE] → https://raw.githubusercontent.com/.../demo.mov

# 2. Update social-media-posts.md
code social-media-posts.md
# Replace all instances of:
# [STAGING_URL] → https://handtrack3d-beta-xxxx.vercel.app
# [SURVEY_URL] → https://forms.gle/xxxxx
# [DEMO_VIDEO] → https://raw.githubusercontent.com/.../demo.mov

# 3. Commit changes
git add beta-materials/
git commit -m "docs: update beta materials with live URLs

- Add Vercel staging URL
- Add Google Forms survey link
- Add demo video URL

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push
```

**Result**: All templates ready to use ✅

---

## ✅ Day 1 Complete!

You now have:
- ✅ Google Forms survey live and collecting responses
- ✅ Vercel staging deployment tested and working
- ✅ Demo video/screenshots ready to share
- ✅ All beta materials updated with real URLs

**Next Session**: Day 2 tasks (identify 10-15 testers, finalize email)

---

## 📋 Quick Reference

**URLs to Track**:
```
Staging URL:  https://_____________________.vercel.app
Survey URL:   https://forms.gle/_____________________
Demo Video:   https://github.com/kentin0-fiz0l/HandTrack3D/raw/master/public/demo/...
GitHub Repo:  https://github.com/kentin0-fiz0l/HandTrack3D
```

**Commands Used**:
```bash
# Survey: Manual (Google Forms UI)
# Deploy: vercel
# Test: open <staging-url>
# Demo: QuickTime screen recording
# Update: git add/commit/push
```

---

**Status**: Day 1 Ready to Execute 🚀
**Expected Completion**: ~1 hour
**Next**: Start with Task 1 (Google Forms)
