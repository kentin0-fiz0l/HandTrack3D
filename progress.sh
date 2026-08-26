#!/bin/bash
# Real-time Day 1 progress tracker

clear
echo "╔════════════════════════════════════════════════════╗"
echo "║     HandTrack3D - Day 1 Progress Tracker          ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Calculate progress
TOTAL_TASKS=7
COMPLETED=4  # Phase 3A, Planning, Beta materials, Helper tools

# Check URLs.txt
HAS_STAGING=false
HAS_SURVEY=false
HAS_DEMO=false

if [ -f "URLS.txt" ]; then
  if grep -q "STAGING_URL=http" URLS.txt 2>/dev/null; then
    HAS_STAGING=true
    COMPLETED=$((COMPLETED + 1))
  fi

  if grep -q "SURVEY_URL=http" URLS.txt 2>/dev/null; then
    HAS_SURVEY=true
    COMPLETED=$((COMPLETED + 1))
  fi

  if grep -q "DEMO_VIDEO=http" URLS.txt 2>/dev/null; then
    HAS_DEMO=true
    COMPLETED=$((COMPLETED + 1))
  fi
fi

# Calculate percentage
PERCENT=$((COMPLETED * 100 / TOTAL_TASKS))

# Progress bar
FILLED=$((PERCENT / 5))
EMPTY=$((20 - FILLED))

echo "Progress: [$PERCENT%]"
printf "["
for ((i=0; i<$FILLED; i++)); do printf "█"; done
for ((i=0; i<$EMPTY; i++)); do printf "░"; done
printf "]\n"
echo ""

# Task checklist
echo "Tasks:"
echo "  ✅ Phase 3A Release (v0.3.0-alpha.0)"
echo "  ✅ Planning Documents (8 files)"
echo "  ✅ Beta Materials Templates"
echo "  ✅ Helper Tools & Scripts"

if [ "$HAS_STAGING" = true ]; then
  STAGING_URL=$(grep "STAGING_URL=" URLS.txt | cut -d'=' -f2)
  echo "  ✅ Staging Deployment: $STAGING_URL"
else
  echo "  ⏳ Staging Deployment (Digital Ocean building...)"
fi

if [ "$HAS_SURVEY" = true ]; then
  SURVEY_URL=$(grep "SURVEY_URL=" URLS.txt | cut -d'=' -f2)
  echo "  ✅ Survey Form: $SURVEY_URL"
else
  echo "  ⏳ Survey Form (Google Forms - in progress)"
fi

if [ "$HAS_DEMO" = true ]; then
  echo "  ✅ Demo Video"
else
  echo "  ⏳ Demo Video (record after deployment ready)"
fi

echo ""
echo "────────────────────────────────────────────────────"
echo ""

# Current focus
if [ "$HAS_SURVEY" = false ]; then
  echo "🎯 Current Focus: Complete Google Forms survey"
  echo ""
  echo "   📝 Copy questions from SURVEY_QUICK.txt"
  echo "   ⚙️  Configure settings (1 response, collect emails)"
  echo "   📊 Create response spreadsheet"
  echo "   🔗 Get shortened link"
  echo ""
  echo "   When done:"
  echo "   echo \"SURVEY_URL=https://forms.gle/xxxxx\" >> URLS.txt"

elif [ "$HAS_STAGING" = false ]; then
  echo "🎯 Current Focus: Check Digital Ocean deployment"
  echo ""
  echo "   1. Open: https://cloud.digitalocean.com/apps"
  echo "   2. Check build status"
  echo "   3. Copy staging URL when ready"
  echo ""
  echo "   When ready:"
  echo "   ./test-deployment.sh https://your-url.ondigitalocean.app"
  echo "   echo \"STAGING_URL=https://...\" >> URLS.txt"

elif [ "$HAS_DEMO" = false ]; then
  echo "🎯 Current Focus: Record demo video"
  echo ""
  echo "   1. Open: DEMO_VIDEO_SCRIPT.md"
  echo "   2. QuickTime → New Screen Recording"
  echo "   3. Open staging URL, record 60 seconds"
  echo "   4. Export as 1080p"
  echo ""
  echo "   Then run:"
  echo "   mkdir -p public/demo"
  echo "   mv ~/Downloads/handtrack3d-demo.mov public/demo/"
  echo "   git add public/demo/ && git commit -m \"docs: add demo\" && git push"
  echo "   echo \"DEMO_VIDEO=https://github.com/.../demo.mov\" >> URLS.txt"

else
  echo "🎉 All tasks complete! Finalizing Day 1..."
  echo ""
  echo "   Run: ./finish-day1.sh"
  echo ""
  echo "   This will:"
  echo "   - Update all beta materials with URLs"
  echo "   - Commit changes"
  echo "   - Prepare for Day 2"
fi

echo ""
echo "────────────────────────────────────────────────────"
echo ""

# Time estimate
if [ "$PERCENT" -lt 100 ]; then
  REMAINING_TASKS=$((TOTAL_TASKS - COMPLETED))
  EST_TIME=$((REMAINING_TASKS * 15))
  echo "📊 Status: $COMPLETED/$TOTAL_TASKS tasks complete"
  echo "⏱️  Estimated time remaining: ~$EST_TIME minutes"
else
  echo "📊 Status: All tasks complete! 🎉"
fi

echo ""

# Quick commands
echo "Quick Commands:"
echo "  ./progress.sh          - Show this progress (run anytime)"
echo "  ./check-day1-complete.sh - Validate completion"
echo "  ./finish-day1.sh       - Finalize Day 1 (when all URLs ready)"
echo ""
