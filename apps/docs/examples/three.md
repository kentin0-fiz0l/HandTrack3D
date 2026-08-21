# 3D Object Manipulation Example

Grab and move 3D objects with your hands using React Three Fiber.

::: info Coming Soon
Complete example code is being prepared. Check the [GitHub repository](https://github.com/yourusername/handtrack3d/tree/main/examples/3d-manipulation) for the latest version.
:::

## Overview

This example demonstrates:
- 3D object interaction
- Grab and release mechanics
- Position tracking
- Visual feedback

## Features

- Pinch to grab objects
- Move objects in 3D space
- Release to drop
- Multiple objects support

## Code Preview

```tsx
import { Canvas } from '@react-three/fiber'
import { useHandInteraction } from '@handtrack3d/three'

function Scene() {
  const { isPinching, grabPosition } = useHandInteraction()

  return (
    <mesh position={isPinching ? grabPosition : [0, 0, 0]}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  )
}
```

## See Also

- [Install @handtrack3d/three](/guide/install-three)
- [3D Interaction Guide](/guide/3d-interaction)
- [Three.js API Reference](/api/three)
