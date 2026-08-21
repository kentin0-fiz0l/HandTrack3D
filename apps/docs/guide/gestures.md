# Gesture Recognition

Learn how to detect and create custom hand gestures.

::: info Coming Soon
This guide is being written. Check back soon for detailed information on gesture recognition.
:::

## Built-in Gestures

HandTrack3D includes these gestures out of the box:

- **Open Hand**: All fingers extended
- **Closed Hand**: Fist gesture
- **Pinch**: Thumb and index finger touching
- **Point**: Index finger extended

## Using Gestures

```tsx
import { useHandTracking } from '@handtrack3d/react'

function App() {
  const { hands } = useHandTracking()

  return (
    <div>
      {hands.map(hand => (
        <div key={hand.id}>
          Current gesture: {hand.gesture}
        </div>
      ))}
    </div>
  )
}
```

## Custom Gestures

Define your own gesture detection:

```ts
import { defineGesture } from '@handtrack3d/core'

const thumbsUp = defineGesture((landmarks) => {
  // Custom logic
  return true
})
```

## Coming Soon

Detailed information on:
- Gesture detection algorithms
- Creating custom gestures
- Gesture events
- Multi-hand gestures
- Gesture sequences

## See Also

- [Hand Detection](/guide/hand-detection)
- [API Reference](/api/core)
