#!/bin/bash

# HandTrack3D Version Bump Script
# Usage: ./scripts/bump-version.sh <version>
# Example: ./scripts/bump-version.sh 0.1.0-alpha.1

set -e

NEW_VERSION=$1

if [ -z "$NEW_VERSION" ]; then
  echo "Error: Version not specified"
  echo ""
  echo "Usage: ./scripts/bump-version.sh <version>"
  echo ""
  echo "Examples:"
  echo "  ./scripts/bump-version.sh 0.1.0-alpha.1"
  echo "  ./scripts/bump-version.sh 0.1.0-beta.0"
  echo "  ./scripts/bump-version.sh 0.1.0"
  echo "  ./scripts/bump-version.sh 1.0.0"
  exit 1
fi

# Validate semver format
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+\.[0-9]+)?$ ]]; then
  echo "Error: Invalid version format"
  echo "Expected: X.Y.Z or X.Y.Z-alpha.N"
  echo "Got: $NEW_VERSION"
  exit 1
fi

echo "📦 Bumping HandTrack3D packages to v$NEW_VERSION"
echo ""

# Update package.json files
PACKAGES=("core" "react" "three")

for pkg in "${PACKAGES[@]}"; do
  PKG_FILE="packages/$pkg/package.json"

  if [ ! -f "$PKG_FILE" ]; then
    echo "❌ Package file not found: $PKG_FILE"
    exit 1
  fi

  # Update version using sed (macOS compatible)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" "$PKG_FILE"
  else
    sed -i "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" "$PKG_FILE"
  fi

  echo "✅ Updated @handtrack3d/$pkg to $NEW_VERSION"
done

echo ""
echo "🎉 Version bump complete!"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git diff"
echo "  2. Update CHANGELOG.md for each package"
echo "  3. Commit: git add . && git commit -m 'chore: bump version to $NEW_VERSION'"
echo "  4. Tag: git tag v$NEW_VERSION"
echo "  5. Push: git push && git push --tags"
echo ""
echo "Or run a dry-run first:"
echo "  cd packages/core && npm publish --dry-run"
