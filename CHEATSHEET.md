# Day 1 Cheat Sheet - Essential Commands Only

## 🎯 Current Task: Google Forms Survey

**Copy questions from**: TextEdit window (SURVEY_QUICK.txt)
**Paste into**: Google Forms (browser)

**After Q22**:
1. Settings → ✓ Limit to 1 response, ✓ Collect emails, ✓ Progress bar
2. Responses → Green spreadsheet icon → Create new
3. Send → Link → Shorten URL → Copy

**Save URL**:
```bash
echo "SURVEY_URL=https://forms.gle/xxxxx" >> ~/Projects/Active/HandTrack3D/URLS.txt
```

---

## 🚀 Next: Check Deployment

**Open**: https://cloud.digitalocean.com/apps

**When build complete**, copy URL, then:
```bash
cd ~/Projects/Active/HandTrack3D
./test-deployment.sh https://handtrack3d-beta-xxxxx.ondigitalocean.app
echo "STAGING_URL=https://handtrack3d-beta-xxxxx.ondigitalocean.app" >> URLS.txt
```

---

## 🎥 Next: Demo Video

**Open**: `DEMO_VIDEO_SCRIPT.md`

**Record**:
1. QuickTime → File → New Screen Recording
2. Open staging URL in browser
3. Record 60 seconds (follow script)
4. Export as 1080p

**Upload**:
```bash
mkdir -p public/demo
mv ~/Downloads/handtrack3d-demo.mov public/demo/
git add public/demo/
git commit -m "docs: add beta demo video

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push
echo "DEMO_VIDEO=https://github.com/kentin0-fiz0l/HandTrack3D/raw/master/public/demo/handtrack3d-demo.mov" >> URLS.txt
```

---

## ✅ Finish Day 1

**When all 3 URLs in URLS.txt**:
```bash
./finish-day1.sh
```

Done! 🎉

---

## 🆘 Quick Help

**Check progress**: `./progress.sh`
**Validate completion**: `./check-day1-complete.sh`
**Test deployment**: `./test-deployment.sh <url>`

**Full guides**:
- Survey: `SURVEY_QUICK.txt` (open in TextEdit)
- Deployment: `DIGITALOCEAN_DEPLOYMENT.md`
- Demo: `DEMO_VIDEO_SCRIPT.md`
- Status: `STATUS.md`

---

**Time remaining**: ~45 minutes
**Current progress**: 57% (4/7 tasks complete)

Keep copying those survey questions! 🚀
