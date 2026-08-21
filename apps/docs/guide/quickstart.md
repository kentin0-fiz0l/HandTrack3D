# 5-Minute Quickstart

Build your first hand tracking app in just 5 minutes. This guide walks you through creating a simple React app that displays your hands on screen.

## Prerequisites

- Node.js 18+ installed
- A webcam-enabled device
- Basic knowledge of React

## Step 1: Create a New React App

```bash
npm create vite@latest my-hand-app -- --template react-ts
cd my-hand-app
npm install
```

## Step 2: Install HandTrack3D

```bash
npm install @handtrack3d/react
```

That's it! No ML models to download, no complex setup.

## Step 3: Build Your App

Replace the contents of `src/App.tsx` with:

```tsx
import { useHandTracking } from '@handtrack3d/react'
import './App.css'

function App() {
  const { hands, enabled, toggle } = useHandTracking()

  return (
    <div className="app">
      <h1>My First Hand Tracking App</h1>

      <div className="controls">
        <button onClick={toggle}>
          {enabled ? '🛑 Stop' : '▶️ Start'} Tracking
        </button>
      </div>

      <div className="hands">
        {hands.length === 0 && enabled && (
          <p>Show your hands to the camera!</p>
        )}

        {hands.map((hand, i) => (
          <div key={i} className="hand-info">
            <h3>{hand.handedness} Hand</h3>
            <p>Gesture: <strong>{hand.gesture}</strong></p>
            <p>Position: ({hand.position.x.toFixed(2)}, {hand.position.y.toFixed(2)}, {hand.position.z.toFixed(2)})</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
```

## Step 4: Add Some Styling

Update `src/App.css`:

```css
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.controls {
  margin: 2rem 0;
}

.controls button {
  font-size: 1.2rem;
  padding: 0.8rem 2rem;
  cursor: pointer;
  border-radius: 8px;
  border: 2px solid #646cff;
  background: #646cff;
  color: white;
  transition: all 0.2s;
}

.controls button:hover {
  background: #535bf2;
  transform: translateY(-2px);
}

.hands {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 2rem;
}

.hand-info {
  padding: 1rem 2rem;
  border: 2px solid #646cff;
  border-radius: 12px;
  background: rgba(100, 108, 255, 0.1);
  min-width: 200px;
}

.hand-info h3 {
  margin-top: 0;
  color: #646cff;
}

.hand-info p {
  margin: 0.5rem 0;
  font-family: monospace;
}
```

## Step 5: Run Your App

```bash
npm run dev
```

Open your browser to `http://localhost:5173` and click "Start Tracking". Allow camera access when prompted.

## What You've Built

Congratulations! You've built a hand tracking app that:

- ✅ Detects hands in real-time using your webcam
- ✅ Shows which hand (left or right) is detected
- ✅ Recognizes gestures (open, closed, pinch, point)
- ✅ Displays 3D position coordinates

## Next Steps

Now that you have basic hand tracking working, explore more advanced features:

### Add 3D Visualization

Show a 3D representation of your hands:

```tsx
import { HandCanvas3D } from '@handtrack3d/react'

function App() {
  return (
    <HandCanvas3D
      width={800}
      height={600}
      showLandmarks={true}
    />
  )
}
```

### Interact with 3D Objects

Use hand gestures to manipulate 3D objects:

```tsx
import { useHandGestures } from '@handtrack3d/react'
import { useHandInteraction } from '@handtrack3d/three'

function App() {
  const { onPinch, onRelease } = useHandGestures()
  const { grabObject, moveObject } = useHandInteraction()

  onPinch((hand) => {
    grabObject(hand.position)
  })

  onRelease(() => {
    moveObject(null)
  })

  // ... render your 3D scene
}
```

### Custom Gestures

Define your own custom gestures:

```tsx
import { useCustomGesture } from '@handtrack3d/core'

const isThumbsUp = useCustomGesture((landmarks) => {
  const thumb = landmarks[4]
  const wrist = landmarks[0]

  // Thumb tip above wrist = thumbs up
  return thumb.y < wrist.y
})
```

## Learn More

- [Core Concepts](/guide/hand-detection) - Deep dive into how hand tracking works
- [API Reference](/api/react) - Complete API documentation
- [Examples](/examples/) - More example applications
- [Contributing](/guide/contributing) - Help improve HandTrack3D

## Troubleshooting

**Camera not working?**
- Make sure you've granted camera permissions
- Check if another app is using your camera
- Try refreshing the page

**Poor tracking accuracy?**
- Ensure good lighting conditions
- Keep hands within the camera view
- Try moving closer to the camera

**Performance issues?**
- Close other browser tabs
- Reduce the camera resolution
- Disable browser extensions

## Get Help

Need help? We're here for you:

- [GitHub Discussions](https://github.com/yourusername/handtrack3d/discussions)
- [Issue Tracker](https://github.com/yourusername/handtrack3d/issues)
- [Discord Community](https://discord.gg/handtrack3d)
