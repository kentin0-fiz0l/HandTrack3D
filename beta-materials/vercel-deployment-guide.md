# Vercel Deployment Guide - Step by Step

**Goal**: Deploy HandTrack3D to staging for beta testing
**Time**: 15-30 minutes
**Cost**: $0 (Free tier is sufficient)

---

## Prerequisites

- [x] HandTrack3D app builds successfully locally (`pnpm dev` works)
- [ ] Vercel account (will create if needed)
- [ ] Node.js installed (already have)

---

## Step 1: Create Vercel Account (5 minutes)

1. Go to **https://vercel.com/signup**
2. Sign up with GitHub (recommended - enables automatic deployments)
3. Authorize Vercel to access your repositories
4. Skip team creation (use personal account for now)

**Result**: You'll land on the Vercel dashboard

---

## Step 2: Install Vercel CLI (2 minutes)

```bash
# Install globally
npm install -g vercel

# Verify installation
vercel --version
# Should show: Vercel CLI 33.x.x or higher

# Login
vercel login
# Follow prompts to authenticate
```

**Result**: CLI is installed and authenticated

---

## Step 3: Prepare Project for Deployment

### Check Build Configuration

The project should already be configured, but let's verify:

```bash
cd ~/Projects/Active/HandTrack3D

# Check if vite.config.ts exists
ls -la vite.config.ts
```

**Expected**: File exists (it does - we've been using it)

### Test Local Build

```bash
# Build the project
npx vite build

# Check dist folder was created
ls -la dist/

# Expected output:
# - index.html
# - assets/ (JS and CSS files)
```

**Result**: Build completes successfully, `dist/` folder created

---

## Step 4: Deploy to Vercel (10 minutes)

### Initial Deployment

```bash
cd ~/Projects/Active/HandTrack3D

# Deploy
vercel
```

**Prompts and Answers**:

```
? Set up and deploy "~/Projects/Active/HandTrack3D"?
→ Y (Yes)

? Which scope do you want to deploy to?
→ [Your Username] (personal account)

? Link to existing project?
→ N (No)

? What's your project's name?
→ handtrack3d (or handtrack3d-beta)

? In which directory is your code located?
→ ./ (press Enter - current directory)

? Auto-detected Project Settings (Vite):
  - Build Command: vite build
  - Output Directory: dist
  - Development Command: vite dev --port $PORT
  ? Want to override settings?
→ N (No - defaults are correct)
```

**Deployment Process**:
```
🔗  Linked to username/handtrack3d (created .vercel)
🔍  Inspect: https://vercel.com/username/handtrack3d/XXXXXXX
✅  Production: https://handtrack3d-xxxx.vercel.app [2m 15s]
```

**Result**: You'll get a URL like `https://handtrack3d-xxxx.vercel.app`

---

## Step 5: Test Staging Deployment (10 minutes)

### Open Deployment URL

1. Copy the URL from deployment output
2. Open in Chrome/Edge
3. Test thoroughly:

**Checklist**:
- [ ] Page loads without errors
- [ ] Webcam permission prompt appears
- [ ] Hand detection works (show hand, see cursor)
- [ ] Tutorial appears on first visit
- [ ] Gestures work (pinch, open, fist, point)
- [ ] Objects can be grabbed and thrown
- [ ] Build mode works (Press B)
- [ ] Property editor works (right-click object)
- [ ] Settings panel works (Press S)
- [ ] Gesture widget appears (top-left)
- [ ] No console errors (open DevTools)

### Check Performance

- **3D Rendering**: Should be 58-60 FPS
- **Hand Tracking**: Should be 28-30 FPS
- **Load Time**: Should be < 5 seconds

### Test on Different Browsers

- [ ] Chrome (primary)
- [ ] Edge
- [ ] Safari (if on Mac)
- [ ] Firefox

---

## Step 6: Configure Production Domain (Optional)

### Use Vercel's Free Domain

Your deployment URL (`handtrack3d-xxxx.vercel.app`) is already production-ready!

### Add Custom Domain (Optional - Later)

1. Go to **Vercel Dashboard** → Your Project → Settings → Domains
2. Add domain (e.g., `handtrack3d.dev`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-30 minutes)

**Recommendation**: Use Vercel's free domain for beta testing, add custom later.

---

## Step 7: Enable Preview Deployments (Automatic)

Vercel automatically creates preview deployments for:
- Every git push to non-main branches
- Every pull request

**How it works**:
```bash
# Create a feature branch
git checkout -b beta-fixes

# Make changes, commit
git add .
git commit -m "Fix tutorial step 3"

# Push
git push origin beta-fixes

# Vercel automatically deploys to:
# https://handtrack3d-beta-fixes-xxxx.vercel.app
```

**Result**: Preview URLs for testing changes before merging

---

## Step 8: Set Environment Variables (If Needed)

If you need environment variables (API keys, etc.):

1. Go to **Vercel Dashboard** → Project → Settings → Environment Variables
2. Add variables:
   - Variable Name: `VITE_APP_NAME`
   - Value: `HandTrack3D Beta`
   - Environments: Production, Preview, Development
3. Click **Save**
4. Redeploy: `vercel --prod`

**Current Status**: No environment variables needed for HandTrack3D

---

## Step 9: Monitor Deployment Health

### Vercel Dashboard

1. Go to **https://vercel.com/dashboard**
2. Click on your project (`handtrack3d`)
3. View:
   - Deployment status
   - Build logs
   - Analytics (visitors, page views)
   - Function invocations
   - Bandwidth usage

### Enable Analytics (Free Tier)

1. Go to Project → Analytics
2. Enable **Web Analytics**
3. View real-time data:
   - Visitors
   - Page views
   - Top pages
   - Referrers

**Useful for**: Tracking beta tester activity

---

## Step 10: Production Deployment

After beta testing is complete:

```bash
# Deploy to production
vercel --prod

# This creates:
# https://handtrack3d.vercel.app (without random hash)
```

**When to use**:
- After beta testing fixes are complete
- When ready for v0.3.0-beta.0 release
- For stable, public-facing deployment

---

## Troubleshooting

### Build Fails

**Error**: `Command "vite build" exited with 1`

**Solutions**:
1. Check local build works: `npx vite build`
2. Check for TypeScript errors: `npx tsc --noEmit`
3. Check for ESLint errors: `npx eslint .`
4. Review build logs in Vercel dashboard

### App Loads but Features Don't Work

**Issue**: Webcam access, hand tracking, or 3D rendering broken

**Solutions**:
1. Check browser console for errors
2. Verify HTTPS (Vercel uses HTTPS by default)
3. Check MediaPipe model loading (network tab)
4. Test on different browser/device

### Performance Issues

**Issue**: Low FPS, stuttering, or lag

**Solutions**:
1. Check Vercel deployment region (should be closest to you)
2. Optimize bundle size: `npx vite build --analyze`
3. Enable Vercel's Edge Network
4. Add loading states for heavy components

### Deployment Stuck

**Issue**: Deployment shows "Building..." for >5 minutes

**Solutions**:
1. Cancel and redeploy: `vercel --force`
2. Check build logs for errors
3. Clear Vercel cache: Dashboard → Settings → Clear Cache
4. Contact Vercel support (free tier has community support)

---

## Deployment Checklist

### Pre-Deployment
- [x] Local build works (`npx vite build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All features tested locally
- [ ] Dependencies up to date

### During Deployment
- [ ] Vercel account created
- [ ] CLI installed and authenticated
- [ ] Project deployed successfully
- [ ] Deployment URL received

### Post-Deployment
- [ ] URL tested in browser
- [ ] Webcam access works
- [ ] Hand tracking works
- [ ] All features functional
- [ ] No console errors
- [ ] Performance is good (60 FPS)
- [ ] Tested on multiple browsers

### Beta Testing Ready
- [ ] Staging URL added to beta invitation email
- [ ] Staging URL added to social media posts
- [ ] Deployment monitored (no downtime)
- [ ] Analytics enabled (optional)

---

## Vercel Configuration File (Optional)

Create `vercel.json` in project root for advanced config:

```json
{
  "buildCommand": "npx vite build",
  "outputDirectory": "dist",
  "devCommand": "npx vite dev --port $PORT",
  "framework": "vite",
  "regions": ["sfo1"],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Benefits**:
- Explicit configuration (no auto-detection)
- Custom headers for caching
- Specific deployment region
- Framework hints for optimizations

**Current Status**: Not needed (auto-detection works well)

---

## Useful Commands

```bash
# Deploy to preview (development)
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Remove a deployment
vercel remove <deployment-url>

# Open project in browser
vercel open

# Check deployment status
vercel inspect <deployment-url>

# Force rebuild (bypass cache)
vercel --force

# Pull environment variables locally
vercel env pull
```

---

## Cost Estimate

**Free Tier Limits** (Hobby Plan):
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains (up to 50)
- ✅ Preview deployments
- ✅ Analytics (basic)

**Estimated Usage for Beta Testing**:
- Deployments: 10-20 (well within unlimited)
- Bandwidth: ~1-2 GB (5-10 testers × 15-20 min sessions)
- **Total Cost**: $0

**When You'd Need to Upgrade** (Pro Plan - $20/month):
- >100 GB bandwidth/month
- Team collaboration features
- Advanced analytics
- Priority support

**Recommendation**: Free tier is more than sufficient for beta testing

---

## Next Steps After Deployment

1. **Copy Staging URL**
   ```
   https://handtrack3d-xxxx.vercel.app
   ```

2. **Update Beta Materials**
   - Replace `[STAGING_URL]` in beta-invitation-email.md
   - Replace `[STAGING_URL]` in social-media-posts.md
   - Add to BETA_TASKS.md checklist

3. **Share with 1-2 Friends First**
   - Quick sanity check
   - Catch any obvious issues
   - Get feedback on testing experience

4. **Launch Recruitment**
   - Send beta invitations
   - Post to communities
   - Monitor for responses

---

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Discord**: https://vercel.com/discord
- **Vite Deployment Guide**: https://vitejs.dev/guide/static-deploy.html#vercel
- **Troubleshooting**: https://vercel.com/support

---

**Status**: Ready to Deploy
**Next**: Run `vercel` command in project directory
**Expected Time**: 15-30 minutes total
