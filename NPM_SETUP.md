# npm Organization Setup Guide

This guide walks you through setting up the `@handtrack3d` npm organization from scratch.

## Step 1: Create npm Account (if needed)

If you don't have an npm account:

1. Go to https://www.npmjs.com/signup
2. Choose a username (e.g., "kentino")
3. Provide email and password
4. Verify your email address

## Step 2: Check Organization Availability

Before creating the organization, verify `@handtrack3d` is available:

```bash
npm view @handtrack3d
```

Expected output: `404 Not Found` (good - it's available!)

If it says the organization exists, you'll need to choose an alternative name:
- `@handtrack3d-js`
- `@handtrack-3d`
- `@hand-track3d`
- `@handtrack` (if available)

## Step 3: Create npm Organization

### Option A: Via npm Website (Recommended)

1. Login to https://www.npmjs.com
2. Click your profile icon → "Add Organization"
3. Or go directly to: https://www.npmjs.com/org/create
4. Enter organization name: `handtrack3d` (without the @)
5. Choose "Unlimited public packages" (free)
6. Click "Create"

### Option B: Via CLI

```bash
npm login
npm org create handtrack3d
```

## Step 4: Verify Organization

```bash
# Check organization exists
npm org ls handtrack3d

# Should show you as the only member
```

## Step 5: Create npm Access Token

You need an automation token for GitHub Actions:

1. Go to https://www.npmjs.com/settings/~/tokens
2. Click "Generate New Token" → "Classic Token"
3. Select "Automation" token type
4. Give it a name: `HandTrack3D GitHub Actions`
5. Click "Generate Token"
6. **COPY THE TOKEN NOW** - you won't see it again!

Token format: `npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 6: Add Token to GitHub

1. Go to your GitHub repo: https://github.com/kentino/handtrack3d
2. Navigate to: Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Fill in:
   - **Name**: `NPM_TOKEN`
   - **Secret**: Paste the token from Step 5
5. Click "Add secret"

## Step 7: Verify GitHub Secret

Check that the secret was added:

1. Go to: https://github.com/kentino/handtrack3d/settings/secrets/actions
2. You should see `NPM_TOKEN` listed
3. You cannot view the value (this is expected)

## Step 8: Test Locally

Before pushing, test the publish workflow locally:

```bash
# Navigate to project
cd /Users/kentino/Projects/Active/HandTrack3D

# Install dependencies
pnpm install

# Build all packages
cd packages/core && pnpm run build
cd ../react && pnpm run build
cd ../three && pnpm run build

# Test dry-run publish (DO NOT ACTUALLY PUBLISH YET)
cd ../core
npm publish --dry-run --access public

cd ../react
npm publish --dry-run --access public

cd ../three
npm publish --dry-run --access public
```

Each dry-run should show:
```
npm notice 📦  @handtrack3d/core@0.1.0-alpha.0
npm notice === Tarball Contents ===
npm notice 1.2kB  package.json
npm notice 3.4kB  README.md
npm notice 25.3kB dist/index.js
npm notice ...
npm notice === Tarball Details ===
npm notice name:          @handtrack3d/core
npm notice version:       0.1.0-alpha.0
npm notice package size:  X.X kB
npm notice unpacked size: X.X kB
npm notice total files:   X
```

## Step 9: Alternatives if @handtrack3d is Taken

If `@handtrack3d` is already taken, here are alternatives:

### Option 1: Request Transfer

If the org exists but is unused:
1. Email npm support: support@npmjs.com
2. Explain you want to use the name
3. They may transfer it if it's inactive

### Option 2: Use Alternative Name

Update all package names:

**Option A: `@handtrack3d-js`**
```json
{
  "name": "@handtrack3d-js/core",
  "name": "@handtrack3d-js/react",
  "name": "@handtrack3d-js/three"
}
```

**Option B: `@handtrack-3d`**
```json
{
  "name": "@handtrack-3d/core",
  "name": "@handtrack-3d/react",
  "name": "@handtrack-3d/three"
}
```

**Option C: Unscoped (not recommended)**
```json
{
  "name": "handtrack3d-core",
  "name": "handtrack3d-react",
  "name": "handtrack3d-three"
}
```

To update all files with a new org name:
```bash
# Replace @handtrack3d with new name
find . -name "package.json" -o -name "*.md" | xargs sed -i '' 's/@handtrack3d/@handtrack3d-js/g'
```

## Step 10: First Publish Test

Once everything is set up, do a test publish with a pre-release version:

```bash
# Make sure you're on main branch
git checkout main

# Create a test tag
git tag v0.0.1-test
git push origin v0.0.1-test

# Watch GitHub Actions
# Go to: https://github.com/kentino/handtrack3d/actions

# If it fails, delete the tag and try again
git tag -d v0.0.1-test
git push origin :refs/tags/v0.0.1-test
```

## Verification Checklist

Before the first real publish, verify:

- [ ] npm account created and email verified
- [ ] `@handtrack3d` organization created (or alternative chosen)
- [ ] You are the owner of the organization
- [ ] npm automation token generated
- [ ] Token added to GitHub as `NPM_TOKEN` secret
- [ ] Local `npm publish --dry-run` succeeds for all packages
- [ ] GitHub Actions workflow file exists (`.github/workflows/publish.yml`)
- [ ] `pnpm-workspace.yaml` configured
- [ ] All package.json files have correct `publishConfig`

## Common Issues

### "You do not have permission to publish"

Solution:
```bash
# Make sure you're logged in
npm login

# Check you're the right user
npm whoami

# Verify org membership
npm org ls handtrack3d
```

### "Package name too similar to existing package"

npm has restrictions on similar names. Choose a more distinct name.

### "You must verify your email address"

Check your email for verification link from npm.

### "402 Payment Required"

This usually means you're trying to publish a private scoped package on a free account. Add to package.json:

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

## Next Steps

Once setup is complete:

1. Read [PUBLISHING.md](./PUBLISHING.md) for publishing workflow
2. Update CHANGELOG.md files
3. Run version bump: `./scripts/bump-version.sh 0.1.0-alpha.0`
4. Create git tag and push
5. Monitor GitHub Actions
6. Verify packages on npm

## Resources

- npm Organizations: https://docs.npmjs.com/organizations
- npm Publishing: https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry
- npm Tokens: https://docs.npmjs.com/about-access-tokens
- Scoped Packages: https://docs.npmjs.com/about-scopes
