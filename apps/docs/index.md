---
layout: home

hero:
  name: HandTrack3D
  text: Webcam-based 3D hand tracking
  tagline: Build immersive web experiences with natural hand interaction
  image:
    src: /logo.svg
    alt: HandTrack3D
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: 5-Minute Quickstart
      link: /guide/quickstart
    - theme: alt
      text: View on GitHub
      link: https://github.com/yourusername/handtrack3d

features:
  - icon: 🖐️
    title: Real-time Hand Tracking
    details: Detect and track hands in 3D space using any webcam with MediaPipe-powered accuracy
  - icon: ⚛️
    title: React-First
    details: First-class React hooks and components for seamless integration into your React apps
  - icon: 🎨
    title: Three.js Ready
    details: Pre-built utilities for 3D object manipulation with React Three Fiber
  - icon: 🚀
    title: Performance Optimized
    details: Efficient hand tracking with minimal overhead, optimized for 60fps experiences
  - icon: 🎯
    title: Gesture Recognition
    details: Built-in gesture detection (pinch, grab, point) with custom gesture support
  - icon: 📦
    title: Modular Packages
    details: Use only what you need - core tracking, React bindings, or Three.js integration
---

## Quick Example

Get started with hand tracking in just a few lines of code:

```tsx
import { useHandTracking } from '@handtrack3d/react'

function App() {
  const { hands, enabled, toggle } = useHandTracking()

  return (
    <div>
      <button onClick={toggle}>
        {enabled ? 'Stop' : 'Start'} Tracking
      </button>

      {hands.map((hand, i) => (
        <div key={i}>
          Hand {i + 1}: {hand.gesture}
        </div>
      ))}
    </div>
  )
}
```

## Installation

```bash
# For React apps
npm install @handtrack3d/react

# For vanilla JS
npm install @handtrack3d/core

# For Three.js integration
npm install @handtrack3d/three
```

## Why HandTrack3D?

HandTrack3D makes it simple to add natural hand interaction to your web applications. Built on battle-tested MediaPipe technology, it provides:

- **Zero Setup**: No external dependencies or ML model downloads
- **Cross-Platform**: Works on desktop and mobile browsers
- **Developer-Friendly**: TypeScript support with full type definitions
- **Well-Documented**: Comprehensive guides and API references
- **Production-Ready**: Used in real-world applications

## Community

- [GitHub Discussions](https://github.com/yourusername/handtrack3d/discussions)
- [Issue Tracker](https://github.com/yourusername/handtrack3d/issues)
- [Contributing Guide](/guide/contributing)

## License

MIT License - see [LICENSE](https://github.com/yourusername/handtrack3d/blob/main/LICENSE) for details.
