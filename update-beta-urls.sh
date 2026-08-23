#!/bin/bash
# Script to update beta materials with real URLs

set -e

echo "🔗 HandTrack3D Beta URL Updater"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Run this script from the HandTrack3D root directory"
  exit 1
fi

# Prompt for URLs
echo "Enter your URLs (or press Enter to skip):"
echo ""

read -p "Staging URL (https://handtrack3d-beta-xxxx.vercel.app): " STAGING_URL
read -p "Survey URL (https://forms.gle/xxxxx): " SURVEY_URL
read -p "Demo Video URL (https://github.com/.../demo.mov): " DEMO_VIDEO

# Validate at least one URL provided
if [ -z "$STAGING_URL" ] && [ -z "$SURVEY_URL" ] && [ -z "$DEMO_VIDEO" ]; then
  echo ""
  echo "❌ No URLs provided. Exiting."
  exit 1
fi

echo ""
echo "📝 Updating files..."

# Update beta-invitation-email.md
if [ -n "$STAGING_URL" ]; then
  sed -i '' "s|\[STAGING_URL_HERE\]|$STAGING_URL|g" beta-materials/beta-invitation-email.md
  echo "  ✅ Updated beta-invitation-email.md with staging URL"
fi

if [ -n "$SURVEY_URL" ]; then
  sed -i '' "s|\[SURVEY_URL_HERE\]|$SURVEY_URL|g" beta-materials/beta-invitation-email.md
  echo "  ✅ Updated beta-invitation-email.md with survey URL"
fi

if [ -n "$DEMO_VIDEO" ]; then
  sed -i '' "s|\[DEMO_VIDEO_URL_HERE\]|$DEMO_VIDEO|g" beta-materials/beta-invitation-email.md
  echo "  ✅ Updated beta-invitation-email.md with demo video URL"
fi

# Update social-media-posts.md
if [ -n "$STAGING_URL" ]; then
  sed -i '' "s|\[STAGING_URL\]|$STAGING_URL|g" beta-materials/social-media-posts.md
  echo "  ✅ Updated social-media-posts.md with staging URL"
fi

if [ -n "$SURVEY_URL" ]; then
  sed -i '' "s|\[SURVEY_URL\]|$SURVEY_URL|g" beta-materials/social-media-posts.md
  echo "  ✅ Updated social-media-posts.md with survey URL"
fi

if [ -n "$DEMO_VIDEO" ]; then
  sed -i '' "s|\[DEMO_VIDEO\]|$DEMO_VIDEO|g" beta-materials/social-media-posts.md
  echo "  ✅ Updated social-media-posts.md with demo video URL"
fi

# Update README.md URLs section
if [ -n "$STAGING_URL" ]; then
  sed -i '' "s|Staging URL:  https://_____________________.vercel.app|Staging URL:  $STAGING_URL|g" beta-materials/README.md
  echo "  ✅ Updated beta-materials/README.md with staging URL"
fi

if [ -n "$SURVEY_URL" ]; then
  sed -i '' "s|Survey URL:   https://forms.gle/_____________________|Survey URL:   $SURVEY_URL|g" beta-materials/README.md
  echo "  ✅ Updated beta-materials/README.md with survey URL"
fi

if [ -n "$DEMO_VIDEO" ]; then
  sed -i '' "s|Demo Video:   https://_____________________ or GitHub|Demo Video:   $DEMO_VIDEO|g" beta-materials/README.md
  echo "  ✅ Updated beta-materials/README.md with demo video URL"
fi

echo ""
echo "✅ All files updated!"
echo ""
echo "📋 Summary:"
echo "  Staging URL: ${STAGING_URL:-[Not provided]}"
echo "  Survey URL:  ${SURVEY_URL:-[Not provided]}"
echo "  Demo Video:  ${DEMO_VIDEO:-[Not provided]}"
echo ""

# Offer to commit changes
read -p "Commit these changes? (y/n): " COMMIT_CHOICE

if [ "$COMMIT_CHOICE" = "y" ] || [ "$COMMIT_CHOICE" = "Y" ]; then
  git add beta-materials/
  git commit -m "docs: update beta materials with live URLs

- Add Vercel staging URL: ${STAGING_URL:-N/A}
- Add Google Forms survey link: ${SURVEY_URL:-N/A}
- Add demo video URL: ${DEMO_VIDEO:-N/A}

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

  echo ""
  echo "✅ Changes committed!"
  echo ""

  read -p "Push to GitHub? (y/n): " PUSH_CHOICE

  if [ "$PUSH_CHOICE" = "y" ] || [ "$PUSH_CHOICE" = "Y" ]; then
    git push
    echo ""
    echo "✅ Changes pushed to GitHub!"
  fi
fi

echo ""
echo "🎯 Next Steps:"
echo "  1. Test your staging deployment: $STAGING_URL"
echo "  2. Test your survey form: $SURVEY_URL"
echo "  3. Review beta-materials/beta-invitation-email.md"
echo "  4. Start Day 2: Identify 10-15 beta testers"
echo ""
echo "🚀 Ready to recruit!"
