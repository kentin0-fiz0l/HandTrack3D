# Documentation Deployment Guide

This guide explains how to deploy the HandTrack3D documentation site.

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `apps/docs` directory as root

2. **Configure Build**
   - Framework Preset: VitePress
   - Build Command: `pnpm build`
   - Output Directory: `.vitepress/dist`
   - Install Command: `pnpm install`

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Get your production URL (e.g., `handtrack3d.vercel.app`)

4. **Automatic Deployments**
   - Main branch → Production
   - Pull requests → Preview deployments

### Option 2: Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build**
   - Base directory: `apps/docs`
   - Build command: `pnpm build`
   - Publish directory: `apps/docs/.vitepress/dist`
   - Node version: 18

3. **Deploy**
   - Netlify uses `netlify.toml` for configuration
   - Automatic deployments on push to main

### Option 3: GitHub Pages

1. **Add GitHub Actions Workflow**

Create `.github/workflows/deploy-docs.yml`:

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm --filter @handtrack3d/docs build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./apps/docs/.vitepress/dist
```

2. **Enable GitHub Pages**
   - Repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`

3. **Configure Base Path**

Update `.vitepress/config.ts`:

```ts
export default defineConfig({
  base: '/handtrack3d/', // Your repo name
  // ... rest of config
})
```

### Option 4: Custom Hosting

Build and deploy to any static hosting:

```bash
# Build
cd apps/docs
pnpm build

# Output is in .vitepress/dist/
# Upload to your hosting provider
```

## Custom Domain

### Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown

### Netlify

1. Go to Site Settings → Domain management
2. Add custom domain
3. Update DNS with Netlify nameservers

### GitHub Pages

1. Add `CNAME` file to `public/`:
   ```
   docs.handtrack3d.com
   ```
2. Configure DNS:
   ```
   CNAME: docs.handtrack3d.com → yourusername.github.io
   ```

## Environment Variables

No environment variables needed for the docs site.

## Build Configuration

### Production Build

```bash
pnpm build
```

Output: `.vitepress/dist/`

### Development Server

```bash
pnpm dev
```

Runs on http://localhost:5173

### Preview Production Build

```bash
pnpm build
pnpm preview
```

## Performance Optimization

The VitePress build automatically:
- ✅ Code splits routes
- ✅ Optimizes images
- ✅ Minifies CSS/JS
- ✅ Generates static HTML
- ✅ Enables search indexing

## Monitoring

### Analytics

Add analytics in `.vitepress/config.ts`:

```ts
export default defineConfig({
  head: [
    // Google Analytics
    ['script', { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID' }],
    ['script', {}, `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    `]
  ]
})
```

### Vercel Analytics

Enable in Vercel dashboard → Analytics

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf node_modules .vitepress/cache .vitepress/dist
pnpm install
pnpm build
```

### Dead Links

Configure in `.vitepress/config.ts`:

```ts
ignoreDeadLinks: [
  /pattern-to-ignore/
]
```

### Slow Builds

- Use pnpm caching in CI
- Enable Vercel/Netlify build caching
- Reduce markdown file sizes

## CI/CD Best Practices

1. **Cache Dependencies**
   ```yaml
   - uses: actions/cache@v3
     with:
       path: ~/.pnpm-store
       key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
   ```

2. **Test Before Deploy**
   ```yaml
   - run: pnpm build
   - run: pnpm test:docs # if you have docs tests
   ```

3. **Preview Deployments**
   - Enable for pull requests
   - Review before merging

## Next Steps

After deployment:
1. ✅ Set up custom domain
2. ✅ Configure analytics
3. ✅ Enable preview deployments
4. ✅ Add status badge to README
5. ✅ Share with the community
