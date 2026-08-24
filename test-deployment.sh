#!/bin/bash
# Quick deployment validation script

set -e

echo "🧪 HandTrack3D Deployment Tester"
echo "================================="
echo ""

# Check if URL provided
if [ -z "$1" ]; then
  echo "Usage: ./test-deployment.sh <staging-url>"
  echo ""
  echo "Example:"
  echo "  ./test-deployment.sh https://handtrack3d-beta-xxxxx.ondigitalocean.app"
  exit 1
fi

STAGING_URL="$1"

echo "📍 Testing: $STAGING_URL"
echo ""

# Test 1: HTTP Status
echo "Test 1: HTTP Status..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$STAGING_URL")

if [ "$HTTP_STATUS" = "200" ]; then
  echo "  ✅ Status: $HTTP_STATUS (OK)"
else
  echo "  ❌ Status: $HTTP_STATUS (Expected 200)"
  exit 1
fi

# Test 2: Page Title
echo "Test 2: Page Title..."
PAGE_TITLE=$(curl -s "$STAGING_URL" | grep -o '<title>[^<]*' | sed 's/<title>//')

if [[ "$PAGE_TITLE" == *"HandTrack3D"* ]]; then
  echo "  ✅ Title: $PAGE_TITLE"
else
  echo "  ⚠️  Title: $PAGE_TITLE (Expected 'HandTrack3D')"
fi

# Test 3: JavaScript Bundle
echo "Test 3: JavaScript Bundle..."
JS_BUNDLE=$(curl -s "$STAGING_URL" | grep -o 'src="/assets/index-[^"]*\.js"' | head -1)

if [ -n "$JS_BUNDLE" ]; then
  echo "  ✅ JS Bundle: Found"
else
  echo "  ❌ JS Bundle: Not found"
  exit 1
fi

# Test 4: CSS Bundle
echo "Test 4: CSS Bundle..."
CSS_BUNDLE=$(curl -s "$STAGING_URL" | grep -o 'href="/assets/index-[^"]*\.css"' | head -1)

if [ -n "$CSS_BUNDLE" ]; then
  echo "  ✅ CSS Bundle: Found"
else
  echo "  ❌ CSS Bundle: Not found"
  exit 1
fi

# Test 5: Security Headers
echo "Test 5: Security (HTTPS)..."
if [[ "$STAGING_URL" == https://* ]]; then
  echo "  ✅ HTTPS: Enabled"
else
  echo "  ⚠️  HTTPS: Not detected (some features may not work)"
fi

# Test 6: Response Time
echo "Test 6: Response Time..."
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$STAGING_URL")
echo "  ⏱️  Time: ${RESPONSE_TIME}s"

if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
  echo "  ✅ Performance: Good"
else
  echo "  ⚠️  Performance: Slow (> 2s)"
fi

echo ""
echo "✅ Automated Tests Complete!"
echo ""
echo "📋 Manual Tests Required:"
echo "  1. Open in browser: $STAGING_URL"
echo "  2. Allow webcam permission"
echo "  3. Test hand tracking"
echo "  4. Complete tutorial"
echo "  5. Test grab & throw"
echo "  6. Test build mode (Press B)"
echo "  7. Test settings (Press S)"
echo ""
echo "Use DAY_1_CHECKLIST.md for full testing checklist"
echo ""

# Save URL to URLS.txt if not already there
if ! grep -q "STAGING_URL=" URLS.txt 2>/dev/null; then
  echo "STAGING_URL=$STAGING_URL" >> URLS.txt
  echo "✅ Saved URL to URLS.txt"
fi
