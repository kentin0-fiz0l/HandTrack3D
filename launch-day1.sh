#!/bin/bash
# Launch all tools needed for Day 1 beta testing setup

echo "🚀 Launching Day 1 Beta Testing Setup"
echo "======================================"
echo ""

# Check we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Run this from HandTrack3D root directory"
  exit 1
fi

# Open reference files in editor
echo "📝 Opening reference files..."
code SURVEY_QUESTIONS_READY.md
code DAY_1_CHECKLIST.md
code DAY_1_EXECUTION.md

sleep 1

# Open Google Forms in browser
echo "🌐 Opening Google Forms..."
open "https://forms.google.com"

sleep 1

# Open Vercel dashboard
echo "🌐 Opening Vercel dashboard..."
open "https://vercel.com/dashboard"

sleep 1

echo ""
echo "✅ All tools launched!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. CREATE GOOGLE FORM (20 min):"
echo "   - In browser: Google Forms → + Blank"
echo "   - In VS Code: Copy questions from SURVEY_QUESTIONS_READY.md"
echo "   - Get shortened link, save to DAY_1_CHECKLIST.md"
echo ""
echo "2. DEPLOY TO VERCEL (30 min):"
echo "   - Run in terminal: vercel login"
echo "   - Then run: vercel"
echo "   - Save staging URL to DAY_1_CHECKLIST.md"
echo ""
echo "3. TEST STAGING (10 min):"
echo "   - Open staging URL in browser"
echo "   - Use DAY_1_CHECKLIST.md testing section"
echo ""
echo "4. CREATE DEMO (30 min):"
echo "   - Open QuickTime Player"
echo "   - File → New Screen Recording"
echo "   - Record 60 seconds, then:"
echo "     mkdir -p public/demo"
echo "     mv ~/Downloads/handtrack3d-demo.mov public/demo/"
echo "     git add public/demo/ && git commit -m 'docs: add demo' && git push"
echo ""
echo "5. UPDATE TEMPLATES (5 min):"
echo "   - Run: ./update-beta-urls.sh"
echo "   - Enter your 3 URLs"
echo ""
echo "⏱️  Total time: ~1 hour"
echo ""
echo "🎯 Start with Task 1 (Google Forms) in your browser now!"
