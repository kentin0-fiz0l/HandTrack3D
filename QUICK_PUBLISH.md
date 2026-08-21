# Quick Publish Reference

Fast reference for publishing HandTrack3D packages.

## First Time Setup

```bash
# 1. Create npm org
open https://www.npmjs.com/org/create

# 2. Generate token
open https://www.npmjs.com/settings/~/tokens

# 3. Add to GitHub
open https://github.com/kentino/handtrack3d/settings/secrets/actions
# Add secret: NPM_TOKEN = your_token_here
```

## Publishing a New Version

```bash
# 1. Update version
./scripts/bump-version.sh 0.1.0-alpha.1

# 2. Update CHANGELOG.md files
# Edit packages/core/CHANGELOG.md
# Edit packages/react/CHANGELOG.md
# Edit packages/three/CHANGELOG.md

# 3. Build and test
pnpm install
pnpm run build
pnpm test

# 4. Dry-run (test first)
cd packages/core && npm publish --dry-run
cd ../react && npm publish --dry-run
cd ../three && npm publish --dry-run

# 5. Commit and tag
git add .
git commit -m "chore: release v0.1.0-alpha.1"
git tag v0.1.0-alpha.1
git push origin main --tags

# 6. Watch GitHub Actions
open https://github.com/kentino/handtrack3d/actions
```

## Verify Published

```bash
# Check packages
npm view @handtrack3d/core
npm view @handtrack3d/react
npm view @handtrack3d/three

# Test install
npm install @handtrack3d/core
```

## Common Tasks

### Check Current Versions
```bash
grep '"version"' packages/*/package.json
```

### Build All Packages
```bash
cd packages/core && pnpm run build
cd ../react && pnpm run build
cd ../three && pnpm run build
```

### Test All Packages
```bash
pnpm test --filter '@handtrack3d/*'
```

### List Published Versions
```bash
npm view @handtrack3d/core versions
```

### Deprecate Version
```bash
npm deprecate @handtrack3d/core@0.1.0 "use 0.1.1 instead"
```

## Version Types

- **Alpha**: `0.1.0-alpha.0` - Early testing
- **Beta**: `0.1.0-beta.0` - Feature complete
- **RC**: `0.1.0-rc.0` - Release candidate
- **Stable**: `0.1.0` - Production ready

## Emergency Rollback

```bash
# Deprecate bad version
npm deprecate @handtrack3d/core@X.Y.Z "broken - use X.Y.Z+1"

# Publish fix
./scripts/bump-version.sh X.Y.Z+1
git commit -am "fix: emergency patch"
git tag vX.Y.Z+1
git push origin main --tags
```

## Full Guides

- [PUBLISHING.md](./PUBLISHING.md) - Complete guide
- [NPM_SETUP.md](./NPM_SETUP.md) - Organization setup
- [.github/PUBLISHING_CHECKLIST.md](./.github/PUBLISHING_CHECKLIST.md) - Release checklist
