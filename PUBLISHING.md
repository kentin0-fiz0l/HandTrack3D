# Publishing Guide

This guide covers how to publish HandTrack3D packages to npm.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Publishing Workflow](#publishing-workflow)
- [Version Management](#version-management)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before publishing, ensure you have:

1. **npm account** with publishing permissions
2. **npm organization**: Create `@handtrack3d` org at https://www.npmjs.com/org/create
3. **npm token**: Create an automation token at https://www.npmjs.com/settings/~/tokens
4. **GitHub repository**: Set up at https://github.com/kentino/handtrack3d
5. **GitHub secret**: Add `NPM_TOKEN` to repo secrets

## Initial Setup

### 1. Create npm Organization

```bash
# Login to npm
npm login

# Create organization (if not exists)
# Visit: https://www.npmjs.com/org/create
# Organization name: handtrack3d
```

### 2. Add npm Token to GitHub

1. Go to https://www.npmjs.com/settings/~/tokens/create
2. Select "Automation" token type
3. Copy the token
4. Go to your GitHub repo → Settings → Secrets and variables → Actions
5. Click "New repository secret"
6. Name: `NPM_TOKEN`
7. Value: Paste your token

### 3. Verify Package Names

Check that package names are available:

```bash
npm view @handtrack3d/core  # Should return 404
npm view @handtrack3d/react # Should return 404
npm view @handtrack3d/three # Should return 404
```

## Publishing Workflow

### Pre-publish Checklist

Before publishing, complete these steps:

- [ ] All tests pass (`pnpm test`)
- [ ] Code is linted (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] CHANGELOG.md is updated for each package
- [ ] Version numbers are bumped
- [ ] README.md files are up to date
- [ ] No sensitive data in code
- [ ] All dependencies are correct
- [ ] Examples work as expected

### Dry-Run Test (Recommended First)

Test the publishing workflow without actually publishing:

```bash
# Option 1: Manual dry-run for each package
cd packages/core
npm publish --dry-run

cd ../react
npm publish --dry-run

cd ../three
npm publish --dry-run

# Option 2: GitHub Actions dry-run
# Go to: https://github.com/kentino/handtrack3d/actions/workflows/publish.yml
# Click "Run workflow" → Set dry_run to true
```

This will:
- Build all packages
- Run tests
- Show what would be published
- NOT actually publish to npm

### Publishing Methods

#### Method 1: GitHub Release (Recommended)

This is the recommended approach for production releases.

1. **Update versions** in all package.json files:
   ```bash
   # Edit packages/core/package.json
   # Edit packages/react/package.json
   # Edit packages/three/package.json
   # Change "version": "0.1.0-alpha.0" → "0.1.0-alpha.1"
   ```

2. **Update CHANGELOG.md** files:
   - Move items from "Unreleased" to the new version section
   - Add release date

3. **Commit changes**:
   ```bash
   git add .
   git commit -m "chore: bump version to 0.1.0-alpha.1"
   git push
   ```

4. **Create and push tag**:
   ```bash
   git tag v0.1.0-alpha.1
   git push origin v0.1.0-alpha.1
   ```

5. **Monitor GitHub Actions**:
   - Go to: https://github.com/kentino/handtrack3d/actions
   - Watch the "Publish to npm" workflow
   - Verify all packages published successfully

#### Method 2: Manual Publish

For testing or emergency releases only.

```bash
# Ensure you're logged in
npm whoami

# Build all packages
pnpm run build

# Publish each package
cd packages/core
npm publish --access public

cd ../react
npm publish --access public

cd ../three
npm publish --access public
```

### Post-publish Verification

After publishing, verify packages are live:

```bash
# Check packages are available
npm view @handtrack3d/core
npm view @handtrack3d/react
npm view @handtrack3d/three

# Try installing them
mkdir /tmp/test-install
cd /tmp/test-install
npm install @handtrack3d/core
npm install @handtrack3d/react
npm install @handtrack3d/three

# Verify package contents
ls node_modules/@handtrack3d/core/dist
ls node_modules/@handtrack3d/react/dist
ls node_modules/@handtrack3d/three/dist
```

## Version Management

We use [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features (backwards-compatible)
- **Patch** (0.0.1): Bug fixes
- **Pre-release** (0.1.0-alpha.0): Alpha/beta releases

### Version Bump Script

```bash
# Helper script to bump versions
# Save as: scripts/bump-version.sh

#!/bin/bash
NEW_VERSION=$1

if [ -z "$NEW_VERSION" ]; then
  echo "Usage: ./scripts/bump-version.sh <version>"
  echo "Example: ./scripts/bump-version.sh 0.1.0-alpha.1"
  exit 1
fi

# Update package.json files
sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" packages/core/package.json
sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" packages/react/package.json
sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" packages/three/package.json

echo "Version bumped to $NEW_VERSION"
echo "Don't forget to update CHANGELOG.md files!"
```

Usage:
```bash
chmod +x scripts/bump-version.sh
./scripts/bump-version.sh 0.1.0-alpha.1
```

### Changesets (Alternative)

For more advanced version management, consider using [changesets](https://github.com/changesets/changesets):

```bash
pnpm add -D -w @changesets/cli
pnpm changeset init

# Create a changeset
pnpm changeset

# Version packages
pnpm changeset version

# Publish packages
pnpm changeset publish
```

## Troubleshooting

### Package Not Found After Publishing

Wait 1-2 minutes for npm CDN propagation, then try again.

### 403 Forbidden Error

- Verify you're logged in: `npm whoami`
- Check you have access to @handtrack3d org: `npm org ls handtrack3d`
- Ensure NPM_TOKEN is valid in GitHub secrets

### Version Already Published

You cannot republish the same version. Bump the version and try again.

```bash
npm version patch  # 0.1.0 → 0.1.1
# or
npm version minor  # 0.1.0 → 0.2.0
# or
npm version major  # 0.1.0 → 1.0.0
```

### Build Fails

```bash
# Clean and rebuild
rm -rf packages/*/dist packages/*/node_modules
pnpm install
pnpm run build
```

### Tests Fail

Do not publish if tests fail. Fix the issues first:

```bash
pnpm test
# Fix failing tests
pnpm test  # Verify all pass
```

### Missing Files in Published Package

Check the `files` field in package.json. Only listed files/directories are included:

```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

Preview what will be published:
```bash
npm pack --dry-run
```

### Dependencies Not Resolving

For workspace dependencies (e.g., `@handtrack3d/core`), ensure they're published first.

Publishing order:
1. `@handtrack3d/core` (no internal deps)
2. `@handtrack3d/react` (depends on core)
3. `@handtrack3d/three` (depends on core + react)

## Release Checklist Template

Copy this checklist for each release:

```markdown
## Release v0.1.0-alpha.X

### Pre-release
- [ ] All tests passing
- [ ] All packages build successfully
- [ ] CHANGELOG updated for all packages
- [ ] Version bumped in all package.json
- [ ] README files reviewed
- [ ] Examples tested
- [ ] Breaking changes documented

### Release
- [ ] Git commit and push
- [ ] Create git tag (vX.Y.Z)
- [ ] Push tag to trigger GitHub Actions
- [ ] Monitor workflow execution
- [ ] Verify publish succeeded

### Post-release
- [ ] Packages available on npm
- [ ] Installation test passed
- [ ] Documentation updated
- [ ] Announcement posted (if applicable)
- [ ] Close relevant issues/PRs

### Rollback (if needed)
- [ ] Deprecate bad version: `npm deprecate @handtrack3d/core@X.Y.Z "reason"`
- [ ] Publish fixed version
```

## Quick Reference

```bash
# Check package availability
npm view @handtrack3d/core

# Dry-run publish
npm publish --dry-run

# Publish to npm
npm publish --access public

# List package files
npm pack --dry-run

# Verify installation
npm install @handtrack3d/core

# Check package info
npm info @handtrack3d/core

# Deprecate version
npm deprecate @handtrack3d/core@0.1.0 "use 0.1.1 instead"

# Unpublish (only within 72 hours)
npm unpublish @handtrack3d/core@0.1.0
```

## Support

If you encounter issues:

1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review npm documentation: https://docs.npmjs.com/
3. Check GitHub Actions logs
4. Open an issue: https://github.com/kentino/handtrack3d/issues
