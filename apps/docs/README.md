# HandTrack3D Documentation

Official documentation site for HandTrack3D, built with VitePress.

## Development

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173 to view the documentation.

## Build

```bash
pnpm build
```

Output will be in `.vitepress/dist/`.

## Preview

Preview the production build locally:

```bash
pnpm preview
```

## Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/handtrack3d)

The site is configured to deploy automatically to Vercel:

1. Push to main branch
2. Vercel builds and deploys automatically
3. Preview deployments for pull requests

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/handtrack3d)

Configuration in `netlify.toml`.

### Manual Deployment

```bash
pnpm build
# Upload .vitepress/dist/ to your hosting provider
```

## Project Structure

```
apps/docs/
├── .vitepress/
│   └── config.ts          # VitePress configuration
├── guide/                 # User guides
│   ├── getting-started.md
│   ├── quickstart.md
│   └── ...
├── api/                   # API reference
│   ├── core.md
│   ├── react.md
│   └── three.md
├── examples/              # Examples
│   └── index.md
├── public/                # Static assets
└── index.md              # Homepage
```

## Adding Content

### New Guide

Create a markdown file in `guide/`:

```bash
touch guide/my-guide.md
```

Add to sidebar in `.vitepress/config.ts`:

```ts
sidebar: {
  '/guide/': [
    {
      text: 'My Section',
      items: [
        { text: 'My Guide', link: '/guide/my-guide' }
      ]
    }
  ]
}
```

### New Example

Add to `examples/index.md` with description and link.

### API Reference

API docs are auto-generated from TypeScript definitions using TypeDoc (coming soon).

## Writing Guidelines

- Use clear, concise language
- Include code examples with syntax highlighting
- Add copy buttons to code blocks (automatic)
- Use callouts for important information:

```md
::: tip
Helpful tip
:::

::: warning
Warning message
:::

::: danger
Critical warning
:::
```

## Search

Local search is enabled by default. No configuration needed.

## Theme Customization

Customize theme in `.vitepress/config.ts`:

```ts
themeConfig: {
  // Colors, fonts, layout options
}
```

## Contributing

See [Contributing Guide](guide/contributing.md) for documentation contribution guidelines.

## License

MIT
