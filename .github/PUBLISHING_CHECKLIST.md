# Publishing Checklist

Use this checklist when preparing to publish HandTrack3D packages to npm.

## One-Time Setup (Before First Publish)

- [ ] **npm Organization**
  - [ ] Create `@handtrack3d` org at https://www.npmjs.com/org/create
  - [ ] Verify ownership: `npm org ls handtrack3d`

- [ ] **npm Token**
  - [ ] Generate automation token at https://www.npmjs.com/settings/~/tokens
  - [ ] Save token securely (you won't see it again)

- [ ] **GitHub Secret**
  - [ ] Add `NPM_TOKEN` to GitHub repo secrets
  - [ ] Verify at: Settings → Secrets and variables → Actions

- [ ] **Package Extraction**
  - [ ] Complete Task #2 (@handtrack3d/core)
  - [ ] Complete Task #3 (@handtrack3d/react)
  - [ ] Complete Task #4 (@handtrack3d/three)

## Every Release

### 1. Pre-Release

- [ ] **Code Quality**
  - [ ] All tests passing: `pnpm test`
  - [ ] Linting passes: `pnpm lint`
  - [ ] Build succeeds: `pnpm run build`
  - [ ] No console errors in demo

- [ ] **Documentation**
  - [ ] README.md files updated
  - [ ] CHANGELOG.md updated for each package
  - [ ] Breaking changes documented
  - [ ] Examples tested and working

- [ ] **Version Management**
  - [ ] Version number decided (e.g., 0.1.0-alpha.1)
  - [ ] Follows semver (major.minor.patch-prerelease)
  - [ ] Version bumped: `./scripts/bump-version.sh X.Y.Z`

- [ ] **Security**
  - [ ] No hardcoded secrets or API keys
  - [ ] Dependencies up to date: `pnpm outdated`
  - [ ] No known vulnerabilities: `pnpm audit`

### 2. Dry-Run Testing

- [ ] **Local Build**
  ```bash
  cd packages/core && pnpm run build
  cd ../react && pnpm run build
  cd ../three && pnpm run build
  ```

- [ ] **Dry-Run Publish**
  ```bash
  cd packages/core && npm publish --dry-run
  cd ../react && npm publish --dry-run
  cd ../three && npm publish --dry-run
  ```

- [ ] **Check Package Contents**
  - [ ] dist/ files present
  - [ ] README.md included
  - [ ] LICENSE included
  - [ ] No unwanted files (node_modules, .env, etc.)

### 3. Git Operations

- [ ] **Commit Changes**
  ```bash
  git add .
  git commit -m "chore: release v0.1.0-alpha.X"
  ```

- [ ] **Create Tag**
  ```bash
  git tag v0.1.0-alpha.X
  ```

- [ ] **Push (this triggers publishing)**
  ```bash
  git push origin main
  git push origin v0.1.0-alpha.X
  ```

### 4. Monitor Workflow

- [ ] **GitHub Actions**
  - [ ] Go to: https://github.com/kentino/handtrack3d/actions
  - [ ] Watch "Publish to npm" workflow
  - [ ] Check all jobs pass (core, react, three)
  - [ ] Review logs for any warnings

- [ ] **Fix if Failed**
  - [ ] Review error logs
  - [ ] Delete tag if needed: `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`
  - [ ] Fix issue and try again

### 5. Verify Published

- [ ] **npm Registry**
  ```bash
  # Wait 1-2 minutes for CDN propagation
  npm view @handtrack3d/core
  npm view @handtrack3d/react
  npm view @handtrack3d/three
  ```

- [ ] **Installation Test**
  ```bash
  mkdir /tmp/test-handtrack3d
  cd /tmp/test-handtrack3d
  npm init -y
  npm install @handtrack3d/core @handtrack3d/react @handtrack3d/three
  ls node_modules/@handtrack3d/
  ```

- [ ] **Package Pages**
  - [ ] Check: https://www.npmjs.com/package/@handtrack3d/core
  - [ ] Check: https://www.npmjs.com/package/@handtrack3d/react
  - [ ] Check: https://www.npmjs.com/package/@handtrack3d/three
  - [ ] Verify README renders correctly
  - [ ] Verify version is correct

### 6. Post-Release

- [ ] **GitHub Release**
  - [ ] Verify release created automatically
  - [ ] Add release notes if needed
  - [ ] Mark as pre-release if alpha/beta

- [ ] **Documentation**
  - [ ] Update main README if needed
  - [ ] Update documentation site
  - [ ] Close related issues

- [ ] **Announcement** (optional for alpha)
  - [ ] Twitter/X post
  - [ ] Discord announcement
  - [ ] Blog post (for major releases)

## Emergency Rollback

If something goes wrong after publishing:

- [ ] **Deprecate Bad Version**
  ```bash
  npm deprecate @handtrack3d/core@X.Y.Z "Issue description - use X.Y.Z+1 instead"
  npm deprecate @handtrack3d/react@X.Y.Z "Issue description - use X.Y.Z+1 instead"
  npm deprecate @handtrack3d/three@X.Y.Z "Issue description - use X.Y.Z+1 instead"
  ```

- [ ] **Publish Fixed Version**
  - [ ] Fix the issue
  - [ ] Bump patch version
  - [ ] Publish new version

- [ ] **Notify Users**
  - [ ] GitHub issue with explanation
  - [ ] Update release notes

## Version Reference

### Alpha Releases (0.1.0-alpha.X)
Use for: Initial testing, breaking changes expected
- [ ] Mark as pre-release on GitHub
- [ ] Document known issues
- [ ] Expect frequent updates

### Beta Releases (0.1.0-beta.X)
Use for: Feature-complete, API stable, testing needed
- [ ] Mark as pre-release on GitHub
- [ ] API should be stable
- [ ] Focus on bug fixes

### Release Candidates (0.1.0-rc.X)
Use for: Final testing before stable release
- [ ] Mark as pre-release on GitHub
- [ ] No new features
- [ ] Only critical bug fixes

### Stable Releases (0.1.0, 1.0.0)
Use for: Production-ready
- [ ] Full documentation
- [ ] All tests passing
- [ ] No known critical issues
- [ ] Upgrade guide if breaking changes

## Helpful Commands

```bash
# Check current versions
grep '"version"' packages/*/package.json

# Bump all versions
./scripts/bump-version.sh 0.1.0-alpha.1

# Build all packages
pnpm run build --filter '@handtrack3d/*'

# Test all packages
pnpm test --filter '@handtrack3d/*'

# Check what will be published
npm pack --dry-run

# View published package
npm view @handtrack3d/core

# List all published versions
npm view @handtrack3d/core versions

# Download published package
npm pack @handtrack3d/core
```

## Quick Links

- [PUBLISHING.md](../PUBLISHING.md) - Full publishing guide
- [NPM_SETUP.md](../NPM_SETUP.md) - Organization setup
- [npm Dashboard](https://www.npmjs.com/settings/handtrack3d/packages)
- [GitHub Actions](https://github.com/kentino/handtrack3d/actions)
- [GitHub Releases](https://github.com/kentino/handtrack3d/releases)
