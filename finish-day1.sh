#!/bin/bash
# Complete Day 1 setup after getting URLs

echo "🎯 Finishing Day 1 Setup"
echo "========================"
echo ""

# Check if URLS.txt has all required URLs
if [ ! -f "URLS.txt" ]; then
  echo "❌ Error: URLS.txt not found"
  echo ""
  echo "Create it with:"
  echo "  echo 'STAGING_URL=https://your-url' > URLS.txt"
  echo "  echo 'SURVEY_URL=https://forms.gle/xxx' >> URLS.txt"
  echo "  echo 'DEMO_VIDEO=https://github.com/.../demo.mov' >> URLS.txt"
  exit 1
fi

# Source URLs
source URLS.txt

# Validate URLs
if [ -z "$STAGING_URL" ]; then
  echo "❌ STAGING_URL not set in URLS.txt"
  exit 1
fi

if [ -z "$SURVEY_URL" ]; then
  echo "⚠️  SURVEY_URL not set (recommended)"
fi

if [ -z "$DEMO_VIDEO" ]; then
  echo "⚠️  DEMO_VIDEO not set (optional)"
fi

echo "📋 Found URLs:"
echo "  Staging: $STAGING_URL"
echo "  Survey: ${SURVEY_URL:-[Not set]}"
echo "  Demo: ${DEMO_VIDEO:-[Not set]}"
echo ""

# Step 1: Test deployment
echo "Step 1: Testing deployment..."
if command -v curl &> /dev/null; then
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$STAGING_URL")
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "  ✅ Deployment accessible (HTTP $HTTP_STATUS)"
  else
    echo "  ⚠️  Deployment returned HTTP $HTTP_STATUS"
  fi
else
  echo "  ⏭️  Skipping (curl not available)"
fi

# Step 2: Update beta materials
echo ""
echo "Step 2: Updating beta materials..."

if ./update-beta-urls.sh <<EOF
$STAGING_URL
$SURVEY_URL
$DEMO_VIDEO
n
EOF
then
  echo "  ✅ Templates updated"
else
  echo "  ⚠️  Template update had issues"
fi

# Step 3: Commit changes
echo ""
echo "Step 3: Committing updated materials..."

git add beta-materials/ URLS.txt

if git diff --cached --quiet; then
  echo "  ℹ️  No changes to commit"
else
  git commit -m "docs: update beta materials with live URLs

- Staging: $STAGING_URL
- Survey: ${SURVEY_URL:-N/A}
- Demo: ${DEMO_VIDEO:-N/A}

Day 1 complete - ready for beta recruitment.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

  git push
  echo "  ✅ Changes committed and pushed"
fi

# Step 4: Final checklist
echo ""
echo "================================"
echo "✅ Day 1 Setup Complete!"
echo "================================"
echo ""

# Run completion checker
./check-day1-complete.sh

echo ""
echo "🚀 Ready for Day 2!"
echo ""
echo "Next steps:"
echo "  1. Review: beta-materials/beta-invitation-email.md"
echo "  2. Identify 10-15 beta testers"
echo "  3. See BETA_TASKS.md for Day 2 checklist"
echo ""
