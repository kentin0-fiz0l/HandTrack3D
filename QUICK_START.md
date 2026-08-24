# Quick Start - Beta Testing Setup

**Current Status**: Day 1 in progress
**Goal**: Get staging URL, survey URL, and demo video
**Time Remaining**: ~30-45 minutes

---

## 🎯 Where You Are Now

### ✅ Completed
- [x] All planning documents created (8 files)
- [x] Phase 3A complete (v0.3.0-alpha.0 tagged)
- [x] Beta materials templates ready
- [x] Helper tools created (launcher, URL updater, test script)
- [x] Digital Ocean App Platform opened in browser

### 🔄 In Progress
- [ ] **Digital Ocean Deployment** (you're doing this now)
- [ ] Google Forms Survey
- [ ] Demo Video Recording

---

## 📍 Current Task: Digital Ocean Deployment

You should see Digital Ocean App Platform in your browser.

### Complete These Steps:

1. **Choose Source** → GitHub
2. **Select Repository** → `kentin0-fiz0l/HandTrack3D`
3. **Branch** → `master`
4. **Build Settings**:
   - Build Command: `pnpm install --frozen-lockfile && npx vite build`
   - Output Directory: `dist`
5. **App Name** → `handtrack3d-beta`
6. **Plan** → Free Tier (Static Site)
7. **Create Resources** → Wait 3-5 minutes

### When Deployment Completes:

```bash
# Test your deployment
./test-deployment.sh https://handtrack3d-beta-xxxxx.ondigitalocean.app

# If tests pass, save URL
echo "STAGING_URL=https://handtrack3d-beta-xxxxx.ondigitalocean.app" >> URLS.txt
```

**Full Guide**: `DIGITALOCEAN_DEPLOYMENT.md`

---

## 📋 Next: Parallel Tasks

While you're working on deployment, you can also:

### Task A: Google Forms Survey (20 min)

1. Open: https://forms.google.com
2. Create **+ Blank** form
3. Title: `HandTrack3D Beta Testing Feedback`
4. Copy questions from: `SURVEY_QUESTIONS_READY.md`
5. Settings → Enable: 1 response limit, collect emails
6. Get shortened link
7. Save URL:
   ```bash
   echo "SURVEY_URL=https://forms.gle/xxxxx" >> URLS.txt
   ```

### Task B: Demo Video (30 min)

**After deployment is live**:

1. Open: `DEMO_VIDEO_SCRIPT.md`
2. Open QuickTime Player
3. File → New Screen Recording
4. Open staging URL in browser
5. Follow 60-second script:
   - 0:00-0:10: Tutorial start
   - 0:10-0:20: Hand detection
   - 0:20-0:35: Grab & throw
   - 0:35-0:45: Build mode
   - 0:45-0:55: Settings
   - 0:55-1:00: Final demo
6. Export as 1080p
7. Upload:
   ```bash
   mkdir -p public/demo
   mv ~/Downloads/handtrack3d-demo.mov public/demo/
   git add public/demo/ && git commit -m "docs: add demo video" && git push
   ```
8. Save URL:
   ```bash
   echo "DEMO_VIDEO=https://github.com/kentin0-fiz0l/HandTrack3D/raw/master/public/demo/handtrack3d-demo.mov" >> URLS.txt
   ```

---

## 🔗 When You Have All 3 URLs

```bash
# Verify you have all URLs
cat URLS.txt

# Should show:
# STAGING_URL=https://...ondigitalocean.app
# SURVEY_URL=https://forms.gle/...
# DEMO_VIDEO=https://github.com/.../demo.mov

# Update all templates automatically
./update-beta-urls.sh

# Commit updated templates
git add beta-materials/
git commit -m "docs: update beta materials with live URLs

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push
```

---

## ✅ Day 1 Complete Checklist

### Deployment
- [ ] Digital Ocean app created
- [ ] Build succeeded
- [ ] Staging URL works
- [ ] All features tested (use `DAY_1_CHECKLIST.md`)

### Survey
- [ ] Google Form created
- [ ] 22 questions added
- [ ] Settings configured
- [ ] Shortened URL obtained

### Demo
- [ ] Video recorded (60 seconds)
- [ ] Exported as 1080p
- [ ] Uploaded to GitHub
- [ ] URL accessible

### Templates
- [ ] All 3 URLs in `URLS.txt`
- [ ] `update-beta-urls.sh` run successfully
- [ ] Beta materials updated
- [ ] Changes committed and pushed

---

## 📁 Important Files Reference

| File | Purpose |
|------|---------|
| `DAY_1_EXECUTION.md` | Full day 1 guide |
| `DAY_1_CHECKLIST.md` | Testing checklist |
| `DIGITALOCEAN_DEPLOYMENT.md` | Deployment guide |
| `SURVEY_QUESTIONS_READY.md` | Copy/paste questions |
| `DEMO_VIDEO_SCRIPT.md` | Recording script |
| `test-deployment.sh` | Automated tests |
| `update-beta-urls.sh` | URL updater |
| `URLS.txt` | Track your URLs |

---

## 🚀 After Day 1

### Day 2 Tasks (Tomorrow):
1. Identify 10-15 beta testers
2. Finalize beta invitation email
3. Review social media posts
4. Prepare for launch

### Day 3 Tasks (Launch):
1. Send 5 personal invitations
2. Post to X/Twitter
3. Post to Reddit (r/webdev, r/threejs, r/reactjs)
4. Post to Discord communities
5. Monitor responses

**Full Plan**: `BETA_TESTING_PLAN.md`

---

## 💡 Quick Commands

```bash
# Check deployment status
./test-deployment.sh https://your-url.ondigitalocean.app

# Open all Day 1 files
code DAY_1_*.md DIGITALOCEAN_DEPLOYMENT.md

# Update templates with URLs
./update-beta-urls.sh

# View current progress
cat URLS.txt
```

---

## 🆘 Need Help?

### Deployment Issues
→ See `DIGITALOCEAN_DEPLOYMENT.md` → Troubleshooting section

### Survey Questions
→ See `SURVEY_QUESTIONS_READY.md` (all 22 formatted)

### Recording Problems
→ See `DEMO_VIDEO_SCRIPT.md` → "What If Recording Fails?"

### Testing Failures
→ Use `test-deployment.sh` for automated validation
→ Use `DAY_1_CHECKLIST.md` for manual testing

---

**Current Time Investment**: ~1 hour so far
**Remaining Time**: ~30-45 minutes
**Expected Completion**: Today (Day 1)

**Status**: On Track 🎯
