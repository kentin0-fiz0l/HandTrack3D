# npm Publishing Setup - Summary

This document provides a quick overview of the npm publishing setup for HandTrack3D.

## Package Structure

```
@handtrack3d/
├── core     - Framework-agnostic hand tracking
├── react    - React hooks and components
└── three    - Three.js integration
```

## Current Status

- ✅ Package names available on npm
- ✅ package.json files created for all packages
- ✅ README.md files created for all packages
- ✅ CHANGELOG.md templates created
- ✅ GitHub Actions workflow configured
- ✅ Publishing guide (PUBLISHING.md) created
- ✅ npm setup guide (NPM_SETUP.md) created
- ✅ Version bump script created
- ✅ LICENSE files added
- ✅ pnpm workspace configured
- ⏳ npm organization not yet created (waiting for manual setup)
- ⏳ NPM_TOKEN not yet added to GitHub secrets

## Quick Start Commands

```bash
# Check if @handtrack3d is available
npm view @handtrack3d/core

# Create npm organization
# Visit: https://www.npmjs.com/org/create

# Generate npm token
# Visit: https://www.npmjs.com/settings/~/tokens

# Add token to GitHub
# Visit: https://github.com/kentino/handtrack3d/settings/secrets/actions

# Bump version
./scripts/bump-version.sh 0.1.0-alpha.1

# Dry-run publish
cd packages/core && npm publish --dry-run

# Create release
git tag v0.1.0-alpha.1
git push origin v0.1.0-alpha.1
```

## Files Created

### Package Files
- `packages/core/package.json` - Core package config
- `packages/core/README.md` - Core package docs
- `packages/core/CHANGELOG.md` - Core changelog
- `packages/react/package.json` - React package config
- `packages/react/README.md` - React package docs
- `packages/react/CHANGELOG.md` - React changelog
- `packages/three/package.json` - Three.js package config
- `packages/three/README.md` - Three.js package docs
- `packages/three/CHANGELOG.md` - Three.js changelog

### Workflow Files
- `.github/workflows/publish.yml` - GitHub Actions publishing workflow

### Documentation
- `PUBLISHING.md` - Complete publishing guide
- `NPM_SETUP.md` - npm organization setup guide
- `packages/PUBLISHING_SUMMARY.md` - This file

### Scripts
- `scripts/bump-version.sh` - Automated version bumping

### Configuration
- `pnpm-workspace.yaml` - pnpm monorepo config
- `LICENSE` - MIT license (root + all packages)

## Package Dependencies

### @handtrack3d/core
- No internal dependencies
- Depends on: @mediapipe/tasks-vision

### @handtrack3d/react
- Depends on: @handtrack3d/core
- Peer dependencies: react, react-dom

### @handtrack3d/three
- Depends on: @handtrack3d/core, @handtrack3d/react
- Peer dependencies: three, @react-three/fiber, react, react-dom

## Publishing Order

Due to dependencies, packages must be published in this order:

1. **@handtrack3d/core** (no internal deps)
2. **@handtrack3d/react** (depends on core)
3. **@handtrack3d/three** (depends on core + react)

The GitHub Actions workflow handles this automatically using a matrix strategy.

## Pre-publish Checklist

Before first publish:

1. [ ] Create npm organization: `@handtrack3d`
2. [ ] Generate npm automation token
3. [ ] Add `NPM_TOKEN` to GitHub secrets
4. [ ] Extract code into packages (tasks #2, #3, #4)
5. [ ] Create package entry points (index.ts files)
6. [ ] Run tests: `pnpm test`
7. [ ] Build packages: `pnpm run build`
8. [ ] Dry-run publish: `npm publish --dry-run`
9. [ ] Update CHANGELOG.md files
10. [ ] Bump versions: `./scripts/bump-version.sh 0.1.0-alpha.0`

## Next Steps

1. **Complete monorepo extraction** (Tasks #2, #3, #4)
   - Move core code to `packages/core/src/`
   - Move React code to `packages/react/src/`
   - Move Three.js code to `packages/three/src/`

2. **Set up npm organization** (Use NPM_SETUP.md guide)
   - Create @handtrack3d org
   - Generate token
   - Add to GitHub

3. **Test build and publish**
   - Build all packages
   - Dry-run publish
   - Fix any issues

4. **First alpha release**
   - Tag v0.1.0-alpha.0
   - Push to GitHub
   - Verify workflow
   - Check packages on npm

## Resources

- [PUBLISHING.md](../PUBLISHING.md) - Complete publishing guide
- [NPM_SETUP.md](../NPM_SETUP.md) - Organization setup guide
- [npm Organizations](https://docs.npmjs.com/organizations)
- [Semantic Versioning](https://semver.org/)

## Support

If you encounter issues:
1. Check troubleshooting in PUBLISHING.md
2. Review npm documentation
3. Check GitHub Actions logs
4. Open an issue on GitHub
