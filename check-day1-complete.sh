#!/bin/bash
# Day 1 completion checker

echo "📋 Day 1 Completion Checker"
echo "============================"
echo ""

COMPLETE=true

# Check URLs.txt exists
if [ ! -f "URLS.txt" ]; then
  echo "❌ URLS.txt not found"
  COMPLETE=false
else
  echo "✅ URLS.txt exists"
  echo ""

  # Check for staging URL
  if grep -q "STAGING_URL=" URLS.txt && grep "STAGING_URL=" URLS.txt | grep -v "^#" | grep -q "http"; then
    STAGING_URL=$(grep "STAGING_URL=" URLS.txt | grep -v "^#" | cut -d'=' -f2)
    echo "✅ Staging URL: $STAGING_URL"
  else
    echo "❌ Staging URL missing or empty"
    COMPLETE=false
  fi

  # Check for survey URL
  if grep -q "SURVEY_URL=" URLS.txt && grep "SURVEY_URL=" URLS.txt | grep -v "^#" | grep -q "http"; then
    SURVEY_URL=$(grep "SURVEY_URL=" URLS.txt | grep -v "^#" | cut -d'=' -f2)
    echo "✅ Survey URL: $SURVEY_URL"
  else
    echo "❌ Survey URL missing or empty"
    COMPLETE=false
  fi

  # Check for demo video URL
  if grep -q "DEMO_VIDEO=" URLS.txt && grep "DEMO_VIDEO=" URLS.txt | grep -v "^#" | grep -q "http"; then
    DEMO_VIDEO=$(grep "DEMO_VIDEO=" URLS.txt | grep -v "^#" | cut -d'=' -f2)
    echo "✅ Demo Video: $DEMO_VIDEO"
  else
    echo "⚠️  Demo Video missing (optional for now)"
  fi
fi

echo ""

# Check if beta materials updated
if [ -f "beta-materials/beta-invitation-email.md" ]; then
  if grep -q "\[STAGING_URL" beta-materials/beta-invitation-email.md; then
    echo "⚠️  Beta materials not updated (placeholders still present)"
    echo "   Run: ./update-beta-urls.sh"
  else
    echo "✅ Beta materials updated"
  fi
fi

echo ""
echo "================================"

if [ "$COMPLETE" = true ]; then
  echo "🎉 Day 1 Complete!"
  echo ""
  echo "✅ All required URLs collected"
  echo "✅ Ready for Day 2"
  echo ""
  echo "📋 Next Steps:"
  echo "  1. Review beta-materials/beta-invitation-email.md"
  echo "  2. Identify 10-15 beta testers (Day 2)"
  echo "  3. Launch recruitment (Day 3)"
  echo ""
  echo "See BETA_TASKS.md for Day 2 checklist"
else
  echo "⏳ Day 1 In Progress"
  echo ""
  echo "📋 Still Need:"
  [ -z "$STAGING_URL" ] && echo "  - Staging URL (Digital Ocean deployment)"
  [ -z "$SURVEY_URL" ] && echo "  - Survey URL (Google Forms)"
  [ -z "$DEMO_VIDEO" ] && echo "  - Demo Video (optional but recommended)"
  echo ""
  echo "See QUICK_START.md for current tasks"
fi

echo ""
