# HandTrack3D Monorepo

This document describes the monorepo structure, tooling, and workflows for the HandTrack3D SDK platform.

## Overview

HandTrack3D uses a monorepo architecture to manage multiple npm packages that work together to provide hand tracking capabilities across different frameworks and use cases.

## Monorepo Tooling

### pnpm Workspaces

We use **pnpm workspaces** for dependency management:

- Efficient disk space usage through content-addressable storage
- Fast installation with parallel processing
- Strict dependency resolution prevents phantom dependencies
- Native workspace protocol (`workspace:*`) for internal dependencies

Configuration: `pnpm-workspace.yaml`

### Turborepo

**Turborepo** provides intelligent build orchestration:

- Parallel task execution with dependency awareness
- Local and remote caching for faster builds
- Incremental builds (only rebuild what changed)
- Pipeline configuration for task dependencies

Configuration: `turbo.json`

## Repository Structure

```
HandTrack3D/
├── packages/
│   ├── core/           # @handtrack3d/core - Framework-agnostic hand tracking
│   ├── react/          # @handtrack3d/react - React hooks and components
│   ├── three/          # @handtrack3d/three - Three.js integration
│   └── rapier/         # @handtrack3d/rapier - Rapier physics adapter
├── apps/
│   ├── showcase/       # Demo application (current codebase will move here)
│   └── docs/           # Documentation site (VitePress)
├── examples/           # Code samples and examples
├── pnpm-workspace.yaml # Workspace configuration
├── turbo.json          # Turborepo pipeline configuration
├── tsconfig.base.json  # Shared TypeScript configuration
├── .eslintrc.json      # Shared ESLint configuration
└── .prettierrc         # Shared Prettier configuration
```

## Packages

### @handtrack3d/core

Framework-agnostic hand tracking library using MediaPipe.

- **Location**: `packages/core/`
- **Dependencies**: `@mediapipe/tasks-vision`
- **Exports**: Hand detection, gesture recognition, coordinate mapping

### @handtrack3d/react

React hooks and components for hand tracking.

- **Location**: `packages/react/`
- **Dependencies**: `@handtrack3d/core`
- **Peer Dependencies**: `react`, `react-dom`
- **Exports**: `useHandTracking`, `useGestureRecognition`, etc.

### @handtrack3d/three

Three.js integration with React Three Fiber support.

- **Location**: `packages/three/`
- **Dependencies**: `@handtrack3d/core`, `@handtrack3d/react`
- **Peer Dependencies**: `three`, `@react-three/fiber`, `react`, `react-dom`
- **Exports**: 3D hand visualization, interaction helpers

### @handtrack3d/rapier

Rapier physics adapter for hand-based physics interactions.

- **Location**: `packages/rapier/`
- **Dependencies**: `@handtrack3d/core`, `@handtrack3d/react`, `@handtrack3d/three`
- **Peer Dependencies**: `@react-three/rapier`, `three`, `react`, `react-dom`
- **Exports**: Physics-enabled hand interactions

## Common Commands

### Installation

```bash
# Install all dependencies across the monorepo
pnpm install
```

### Building

```bash
# Build all packages in dependency order
pnpm build

# Build a specific package
pnpm --filter @handtrack3d/core build

# Build in watch mode
pnpm dev
```

### Testing

```bash
# Run tests across all packages
pnpm test

# Run tests for a specific package
pnpm --filter @handtrack3d/react test

# Run tests in watch mode
pnpm --filter @handtrack3d/core test:watch
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint a specific package
pnpm --filter @handtrack3d/three lint
```

### Cleaning

```bash
# Clean all build artifacts and node_modules
pnpm clean

# Clean a specific package
pnpm --filter @handtrack3d/core clean
```

## TypeScript Configuration

### Base Configuration (`tsconfig.base.json`)

Shared TypeScript configuration with:
- Target: ES2023
- Module: ESNext with bundler resolution
- Strict type checking enabled
- Incremental compilation with composite projects
- Source maps and declarations

### Package-Specific Configurations

Each package extends `tsconfig.base.json` and adds:
- Package-specific output directories
- Source file includes/excludes
- Project references for workspace dependencies

## Dependency Management

### Internal Dependencies

Packages reference each other using the `workspace:*` protocol:

```json
{
  "dependencies": {
    "@handtrack3d/core": "workspace:*"
  }
}
```

This ensures:
- Always using the local workspace version
- Automatic updates when dependencies change
- Correct build order in Turborepo

### Peer Dependencies

UI framework packages use peer dependencies:

```json
{
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

This allows consumers to control the framework version.

## Build Pipeline

Turborepo manages the build pipeline defined in `turbo.json`:

### Task Dependencies

```
core:build
├── react:build (depends on core:build)
│   ├── three:build (depends on react:build)
│   │   └── rapier:build (depends on three:build)
```

### Caching

Turborepo caches build outputs based on:
- Source file changes
- Dependencies changes
- Environment variables
- Configuration files

Cache hits skip rebuilding and restore outputs instantly.

## Versioning and Publishing

### Changesets

We use `@changesets/cli` for version management:

```bash
# Create a changeset (describe changes)
pnpm changeset

# Update package versions based on changesets
pnpm version-packages

# Build and publish packages
pnpm release
```

### Version Strategy

- **Alpha releases**: `0.1.0-alpha.0` during initial development
- **Semantic versioning**: After 1.0.0 release
- **Synchronized versions**: All packages versioned together initially

## Development Workflow

### Adding a New Package

1. Create package directory: `packages/your-package/`
2. Create `package.json` with `@handtrack3d/your-package` name
3. Create `tsconfig.json` extending `tsconfig.base.json`
4. Create `src/index.ts` as entry point
5. Add build scripts using `tsup`
6. Run `pnpm install` to link workspace dependencies

### Adding a Dependency

```bash
# Add to a specific package
pnpm --filter @handtrack3d/core add @mediapipe/tasks-vision

# Add as dev dependency
pnpm --filter @handtrack3d/react add -D @types/react

# Add to root (for tooling)
pnpm add -D -w prettier
```

### Testing Changes Locally

```bash
# Build all packages
pnpm build

# Link to another project for testing
cd /path/to/test-project
pnpm link /Users/kentino/Projects/Active/HandTrack3D/packages/core
```

## Package Exports

All packages use modern export maps for dual ESM/CJS support:

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

Build tool: `tsup` generates:
- CommonJS: `dist/index.js`
- ESM: `dist/index.mjs`
- Types: `dist/index.d.ts` and `dist/index.d.mts`

## Performance Tips

### Filtered Commands

Use `--filter` to work on specific packages:

```bash
# Only build core and its dependents
pnpm --filter @handtrack3d/core... build

# Only build react and its dependencies
pnpm --filter ...@handtrack3d/react build
```

### Parallel Execution

Turborepo automatically parallelizes independent tasks:

```bash
# Builds core, react, three, rapier in parallel when possible
pnpm build
```

### Watch Mode

Use watch mode during development:

```bash
# Watch all packages
pnpm dev

# Watch a specific package
pnpm --filter @handtrack3d/core dev
```

## Troubleshooting

### Build Errors

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### Type Errors

```bash
# Rebuild TypeScript project references
pnpm --filter @handtrack3d/core build
```

### Dependency Issues

```bash
# Verify workspace links
pnpm list --depth=0

# Check for peer dependency warnings
pnpm peers check
```

## Migration Status

- [x] Monorepo structure created
- [x] pnpm workspaces configured
- [x] Turborepo configured
- [x] Package scaffolding complete
- [ ] Code extraction (in progress)
- [ ] Showcase app migration
- [ ] Examples created
- [ ] Documentation complete

## Next Steps

1. Extract core hand tracking logic to `@handtrack3d/core`
2. Extract React hooks to `@handtrack3d/react`
3. Build Three.js integration in `@handtrack3d/three`
4. Build Rapier physics adapter in `@handtrack3d/rapier`
5. Move current codebase to `apps/showcase/`
6. Create example projects in `examples/`
7. Set up CI/CD pipeline
8. Publish alpha releases to npm

## Resources

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Changesets](https://github.com/changesets/changesets)
- [tsup Documentation](https://tsup.egoist.dev/)
