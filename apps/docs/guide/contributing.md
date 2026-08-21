# Contributing Guide

Thank you for your interest in contributing to HandTrack3D! This guide will help you get started.

## Code of Conduct

We are committed to providing a welcoming and inclusive community. Please read and follow our [Code of Conduct](https://github.com/yourusername/handtrack3d/blob/main/CODE_OF_CONDUCT.md).

## Ways to Contribute

There are many ways to contribute to HandTrack3D:

- **Report bugs** - Found a bug? Open an issue
- **Suggest features** - Have an idea? Start a discussion
- **Write documentation** - Help improve our docs
- **Fix bugs** - Submit a pull request
- **Add features** - Implement new capabilities
- **Share examples** - Show others what you've built

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/handtrack3d
cd handtrack3d
```

### 2. Install Dependencies

We use pnpm for package management:

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies
pnpm install
```

### 3. Set Up Development

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Start development server
pnpm dev
```

## Project Structure

```
handtrack3d/
├── packages/
│   ├── core/           # @handtrack3d/core
│   ├── react/          # @handtrack3d/react
│   └── three/          # @handtrack3d/three
├── apps/
│   └── docs/           # Documentation site
├── examples/           # Example applications
└── packages.json
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Write code following our [style guide](#code-style)
- Add tests for new features
- Update documentation as needed
- Follow TypeScript best practices

### 3. Test Your Changes

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @handtrack3d/core test

# Run tests in watch mode
pnpm test:watch
```

### 4. Lint and Format

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

### 5. Commit Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add new gesture detection"
```

**Commit types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Code Style

### TypeScript

- Use TypeScript for all code
- Provide type definitions for public APIs
- Avoid `any` types
- Use strict mode

```ts
// Good
function processHand(hand: Hand): Gesture {
  return detectGesture(hand.landmarks)
}

// Bad
function processHand(hand: any): any {
  return detectGesture(hand.landmarks)
}
```

### React

- Use functional components
- Use hooks for state management
- Provide prop types

```tsx
// Good
interface Props {
  hands: Hand[]
  onGesture: (gesture: Gesture) => void
}

export function HandDisplay({ hands, onGesture }: Props) {
  return <div>...</div>
}

// Bad
export function HandDisplay(props) {
  return <div>...</div>
}
```

### Naming Conventions

- **Components**: PascalCase (`HandTracker`)
- **Functions**: camelCase (`detectGesture`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_CONFIG`)
- **Files**: kebab-case (`hand-tracker.ts`)

## Testing

### Unit Tests

Write unit tests for utilities and helpers:

```ts
import { describe, it, expect } from 'vitest'
import { detectGesture } from '../src/gestures'

describe('detectGesture', () => {
  it('detects pinch gesture', () => {
    const landmarks = createPinchLandmarks()
    expect(detectGesture(landmarks)).toBe('pinch')
  })
})
```

### Integration Tests

Test components and hooks:

```tsx
import { render, screen } from '@testing-library/react'
import { HandDisplay } from '../src/components/HandDisplay'

describe('HandDisplay', () => {
  it('renders hands', () => {
    render(<HandDisplay hands={mockHands} />)
    expect(screen.getByText('Left')).toBeInTheDocument()
  })
})
```

## Documentation

### Code Comments

- Document complex logic
- Explain "why", not "what"
- Use JSDoc for public APIs

```ts
/**
 * Detects the current gesture from hand landmarks.
 *
 * @param landmarks - Array of 21 hand landmarks
 * @returns The detected gesture type
 *
 * @example
 * ```ts
 * const gesture = detectGesture(hand.landmarks)
 * console.log(gesture) // 'pinch'
 * ```
 */
export function detectGesture(landmarks: Landmark[]): Gesture {
  // ...
}
```

### Documentation Site

Update docs when adding features:

1. Add guide to `apps/docs/guide/`
2. Update API reference in `apps/docs/api/`
3. Add example to `apps/docs/examples/`

## Pull Request Process

### Before Submitting

- [ ] Tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Code is formatted (`pnpm format`)
- [ ] Documentation updated
- [ ] Examples added (if applicable)
- [ ] Changeset added (see below)

### Changesets

We use changesets for version management:

```bash
# Create a changeset
pnpm changeset

# Follow the prompts to describe your changes
```

### PR Template

Include in your PR description:

- **What**: What does this PR do?
- **Why**: Why is this change needed?
- **How**: How does it work?
- **Testing**: How did you test this?
- **Screenshots**: (if applicable)

### Review Process

1. Automated checks run (tests, lint, build)
2. Maintainers review code
3. Address feedback
4. PR merged when approved

## Release Process

Maintainers handle releases:

1. Review pending changesets
2. Run `pnpm changeset version`
3. Create release PR
4. Merge and publish

## Community

### Get Help

- [GitHub Discussions](https://github.com/yourusername/handtrack3d/discussions)
- [Discord](https://discord.gg/handtrack3d)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/handtrack3d)

### Share Your Work

Built something cool? Share it!

- [Show and Tell Discussions](https://github.com/yourusername/handtrack3d/discussions/categories/show-and-tell)
- [Awesome HandTrack3D](https://github.com/yourusername/awesome-handtrack3d)
- Tweet with #HandTrack3D

## Recognition

Contributors are recognized in:

- [CONTRIBUTORS.md](https://github.com/yourusername/handtrack3d/blob/main/CONTRIBUTORS.md)
- Release notes
- Documentation credits

## Questions?

Not sure where to start? Open a [discussion](https://github.com/yourusername/handtrack3d/discussions) and we'll help you out!

Thank you for contributing to HandTrack3D!
