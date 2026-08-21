# 3D Interaction

Learn how to manipulate 3D objects with hand gestures using HandTrack3D.

::: info Coming Soon
This guide is being written. Check back soon for detailed information on 3D interaction.
:::

## Overview

HandTrack3D provides utilities for natural 3D object manipulation:

- Grab and move objects with pinch gesture
- Two-hand scaling and rotation
- Point-based selection
- Distance-based interactions

## Basic Example

```tsx
import { Canvas } from '@react-three/fiber'
import { useHandInteraction } from '@handtrack3d/three'

function Scene() {
  const { grabbedObject, grabPosition } = useHandInteraction()

  return (
    <mesh position={grabPosition}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  )
}
```

## Interaction Patterns

- **Grabbing**: Pinch to grab, release to drop
- **Pointing**: Point at objects to select
- **Two-Hand**: Use both hands for scaling
- **Hover**: Trigger on proximity

## Coming Soon

Detailed information on:
- Coordinate mapping
- Object grabbing
- Two-hand gestures
- Custom interactions
- Physics integration
- Performance optimization

## See Also

- [Install @handtrack3d/three](/guide/install-three)
- [Three.js API Reference](/api/three)
- [Examples](/examples/)
