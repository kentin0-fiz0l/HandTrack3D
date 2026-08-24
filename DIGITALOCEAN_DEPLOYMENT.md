# Digital Ocean App Platform Deployment Guide

**Goal**: Deploy HandTrack3D to Digital Ocean for beta testing
**Time**: 15-20 minutes
**Cost**: $5/month (Static Site plan) or $0 (Free Starter tier - 3 static sites)

---

## Prerequisites

- [x] Digital Ocean account
- [x] HandTrack3D pushed to GitHub
- [x] Local build works (`npx vite build` ✅)

---

## Step 1: Access App Platform (2 minutes)

### Option A: Via Dashboard
1. Go to https://cloud.digitalocean.com
2. Click **Create** → **Apps** (or visit https://cloud.digitalocean.com/apps)

### Option B: Direct Link
```bash
open "https://cloud.digitalocean.com/apps/new"
```

---

## Step 2: Connect GitHub Repository (3 minutes)

1. **Choose Source**: Select **GitHub**
2. **Authorize GitHub**: Click **Manage Access** if first time
   - Authorize Digital Ocean to access your repositories
   - Select **Only select repositories**
   - Choose: `kentin0-fiz0l/HandTrack3D`
   - Click **Install & Authorize**

3. **Select Repository**:
   - Repository: `kentin0-fiz0l/HandTrack3D`
   - Branch: `master` (or `main`)
   - Source Directory: `/` (root)
   - Click **Next**

---

## Step 3: Configure Build Settings (5 minutes)

### Detected Framework
Digital Ocean should auto-detect: **Vite** or **Static Site**

### Build Configuration
If not auto-detected, set manually:

**Build Command**:
```bash
pnpm install --frozen-lockfile && npx vite build
```

**Output Directory**:
```
dist
```

**Environment Variables** (Optional - add if needed):
- Key: `NODE_VERSION`
- Value: `22`
- Scope: Build

### Resource Settings
- **Plan**: Static Site
  - **Free Tier** (3 apps, 1GB bandwidth/month) - Perfect for beta testing
  - **Starter** ($5/month) - If you need more bandwidth

Click **Next**

---

## Step 4: Configure App Details (2 minutes)

**App Name**: `handtrack3d-beta`

**Region**: Select closest to your location
- New York (NYC1, NYC3)
- San Francisco (SFO2, SFO3)
- Toronto (TOR1)
- London (LON1)
- Frankfurt (FRA1)
- Amsterdam (AMS3)
- Singapore (SGP1)
- Bangalore (BLR1)

**Environment**: Production (for now)

Click **Next**

---

## Step 5: Review and Deploy (2 minutes)

1. Review configuration summary
2. **Important**: Scroll down to pricing
   - Should show: **$0.00/month** (Free tier)
   - Or: **$5.00/month** (Starter)

3. Click **Create Resources**

---

## Step 6: Wait for Deployment (3-5 minutes)

Digital Ocean will:
1. ✅ Clone repository
2. ✅ Install dependencies (`pnpm install`)
3. ✅ Run build (`npx vite build`)
4. ✅ Deploy to CDN
5. ✅ Generate URL

**Progress Indicators**:
- Building (gear icon spinning)
- Deploying (rocket icon)
- Live (green checkmark)

---

## Step 7: Get Your Staging URL (1 minute)

Once deployment completes:

1. Click on your app name
2. Copy the URL (looks like):
   ```
   https://handtrack3d-beta-xxxxx.ondigitalocean.app
   ```

3. Save this URL:
   ```bash
   echo "STAGING_URL=https://handtrack3d-beta-xxxxx.ondigitalocean.app" >> ~/Projects/Active/HandTrack3D/URLS.txt
   ```

---

## Step 8: Test Deployment (10 minutes)

### Open Deployment
```bash
open https://handtrack3d-beta-xxxxx.ondigitalocean.app  # Use YOUR URL
```

### Testing Checklist

**Page Load**:
- [ ] Page loads without errors
- [ ] No console errors (open DevTools → Console)

**Webcam & Tutorial**:
- [ ] Webcam permission prompt appears
- [ ] Tutorial overlay appears on first visit
- [ ] Can complete Step 1 (Welcome)
- [ ] Can complete Step 3 (Show hand)

**Hand Tracking**:
- [ ] Hand cursor appears (green or blue sphere)
- [ ] Cursor follows hand movement
- [ ] Gesture widget shows current gesture (top-left)

**Interactions**:
- [ ] Can grab object (pinch near cube)
- [ ] Can throw object (open hand while holding)
- [ ] Build mode works (Press B)
- [ ] Settings panel works (Press S)

**Performance**:
- [ ] 3D rendering: 55-60 FPS
- [ ] Hand tracking: 28-30 FPS
- [ ] No lag or stuttering

---

## Step 9: Configure Custom Domain (Optional)

If you have a custom domain (e.g., `handtrack3d.dev`):

1. Click **Settings** tab in your app
2. Click **Domains**
3. Click **Add Domain**
4. Enter your domain
5. Add DNS records (CNAME or A record) to your domain provider
6. Wait for DNS propagation (5-30 minutes)

**For Beta Testing**: Skip this step, use the `.ondigitalocean.app` URL

---

## Automatic Deployments

Digital Ocean App Platform automatically deploys on every push to `master` branch:

```bash
# Make changes to your code
git add .
git commit -m "Update tutorial text"
git push

# Digital Ocean automatically:
# 1. Detects the push
# 2. Rebuilds the app
# 3. Redeploys to production
# ~3-5 minute deployment time
```

**View Deployments**: App → Activity tab

---

## Troubleshooting

### Build Fails: "pnpm: command not found"

**Fix**: Add environment variable
1. App Settings → App-Level Environment Variables
2. Add:
   - Key: `NPM_CONFIG_PREFIX`
   - Value: `/workspace/.pnpm`
3. Redeploy

Or use npm instead:
- Build Command: `npm install && npx vite build`

### Build Fails: "out of memory"

**Fix**: Upgrade to Basic plan ($5/month)
- Settings → Resources
- Change from Static Site (512MB) to Basic (1GB)

### App Loads but Features Don't Work

**Issue**: Webcam, hand tracking, or 3D rendering broken

**Solutions**:
1. Check browser console for errors
2. Verify HTTPS (Digital Ocean uses HTTPS by default ✅)
3. Test on different browser/device
4. Check build logs: App → Activity → View Logs

### Slow Performance

**Issue**: Low FPS, stuttering

**Solutions**:
1. Check CDN region (should be closest to you)
2. Verify build output is optimized (not dev build)
3. Test on different device/browser

---

## Digital Ocean CLI (Optional)

Install `doctl` for command-line deployments:

```bash
# Install
brew install doctl

# Authenticate
doctl auth init

# List apps
doctl apps list

# View app details
doctl apps get <app-id>

# Trigger deployment
doctl apps create-deployment <app-id>

# View logs
doctl apps logs <app-id>
```

---

## Cost Estimate

**Free Tier** (Recommended for Beta):
- ✅ 3 static sites
- ✅ 1GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments
- **Total Cost**: $0/month

**Estimated Usage** (5-10 beta testers):
- Bandwidth: ~500MB (well within 1GB)
- Build minutes: ~10-15 (unlimited on static sites)
- **Total Cost**: $0

**Starter Plan** ($5/month) - If needed:
- 100GB bandwidth/month
- Custom domains
- More resources

---

## Comparison: Vercel vs Digital Ocean

| Feature | Vercel Free | Digital Ocean Free |
|---------|-------------|-------------------|
| Static Sites | Unlimited | 3 sites |
| Bandwidth | 100GB/month | 1GB/month |
| Build Minutes | 6,000/month | Unlimited |
| Custom Domains | ✅ Unlimited | ✅ 1 per app |
| Auto Deploy | ✅ | ✅ |
| CDN | ✅ Global | ✅ Global |
| **Best For** | High traffic | Low traffic beta |

**For Beta Testing**: Digital Ocean Free is sufficient (1GB bandwidth)

---

## Next Steps After Deployment

1. **Copy Staging URL**
   ```
   https://handtrack3d-beta-xxxxx.ondigitalocean.app
   ```

2. **Update Beta Materials**
   ```bash
   cd ~/Projects/Active/HandTrack3D
   ./update-beta-urls.sh
   # Enter staging URL when prompted
   ```

3. **Test Thoroughly**
   - Use DAY_1_CHECKLIST.md testing section
   - Verify all features work
   - Check performance metrics

4. **Create Demo Video** (Task 4)
   - Record 60-second demo
   - Upload to GitHub
   - Get demo URL

5. **Launch Recruitment** (Day 3)
   - Send beta invitations
   - Post to communities
   - Monitor responses

---

## Support Resources

- **Digital Ocean Docs**: https://docs.digitalocean.com/products/app-platform/
- **App Platform**: https://www.digitalocean.com/products/app-platform
- **Community**: https://www.digitalocean.com/community
- **Status Page**: https://status.digitalocean.com

---

**Status**: Ready to Deploy
**Next**: Open https://cloud.digitalocean.com/apps/new
**Expected Time**: 15-20 minutes total
