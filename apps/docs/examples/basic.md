# Basic Hand Tracking Example

The simplest example - display detected hands and gestures.

::: info Coming Soon
Complete example code is being prepared. Check the [GitHub repository](https://github.com/yourusername/handtrack3d/tree/main/examples/basic) for the latest version.
:::

## Overview

This example demonstrates:
- Basic hand tracking setup
- Displaying hand information
- Gesture detection
- Start/stop controls

## Quick Start

```bash
git clone https://github.com/yourusername/handtrack3d
cd handtrack3d/examples/basic
npm install
npm run dev
```

## Code Preview

```tsx
import { useHandTracking } from '@handtrack3d/react'

function App() {
  const { hands, enabled, toggle } = useHandTracking()

  return (
    <div>
      <button onClick={toggle}>
        {enabled ? 'Stop' : 'Start'}
      </button>

      {hands.map((hand, i) => (
        <div key={i}>
          <h3>{hand.handedness} Hand</h3>
          <p>Gesture: {hand.gesture}</p>
        </div>
      ))}
    </div>
  )
}
```

## See Also

- [5-Minute Quickstart](/guide/quickstart)
- [Getting Started](/guide/getting-started)
