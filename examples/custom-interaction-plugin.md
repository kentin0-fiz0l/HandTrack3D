# Building a Custom Interaction Plugin

This tutorial shows you how to create a custom 3D interaction plugin for HandTrack3D. We'll build a "point-to-select" plugin that lets users select objects by pointing at them.

## Prerequisites

- Three.js knowledge
- Understanding of raycasting
- Familiarity with event systems
- React Three Fiber (optional, for React integration)

## What We're Building

A plugin that:
1. Detects when user points at objects
2. Shows hover feedback after sustained pointing
3. Selects objects after hover duration
4. Emits events for hover/select/deselect
5. Supports multiple selectable objects

## Step 1: Define the Interface

```typescript
import * as THREE from 'three';

export interface HandState {
  id: string;              // Hand identifier
  position: THREE.Vector3; // Hand position
  gesture: string;         // Current gesture
  indexTip?: THREE.Vector3; // Index finger tip (for pointing)
  forward?: THREE.Vector3;  // Hand direction vector
}

export interface SelectionEvent {
  type: 'select' | 'deselect' | 'hover';
  target: THREE.Object3D;
  hand: HandState;
  timestamp: number;
}

export interface PointSelectOptions {
  hoverDuration?: number;    // ms to hover before selection
  maxDistance?: number;      // Max raycast distance
  selectGesture?: string;    // Gesture required to select
}
```

## Step 2: Implement the Plugin

```typescript
export class PointSelectPlugin {
  readonly name = 'interaction:point-select';
  readonly version = '1.0.0';

  private options: Required<PointSelectOptions>;
  private selectableObjects = new Set<THREE.Object3D>();
  private listeners = new Map<string, Set<(event: SelectionEvent) => void>>();
  private raycaster = new THREE.Raycaster();

  // State tracking
  private hoveredObject: THREE.Object3D | null = null;
  private hoverStartTime: number | null = null;
  private selectedObject: THREE.Object3D | null = null;

  constructor(options: PointSelectOptions = {}) {
    this.options = {
      hoverDuration: options.hoverDuration ?? 500,
      maxDistance: options.maxDistance ?? 10,
      selectGesture: options.selectGesture ?? 'point',
    };

    this.raycaster.far = this.options.maxDistance;
  }

  // Register an object for selection
  registerObject(object: THREE.Object3D): void {
    this.selectableObjects.add(object);
  }

  // Unregister an object
  unregisterObject(object: THREE.Object3D): void {
    this.selectableObjects.delete(object);
    if (this.selectedObject === object) {
      this.deselectObject(object);
    }
  }

  // Event system
  on(event: 'select' | 'deselect' | 'hover',
     listener: (event: SelectionEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: 'select' | 'deselect' | 'hover',
      listener: (event: SelectionEvent) => void): void {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(type: 'select' | 'deselect' | 'hover',
               target: THREE.Object3D,
               hand: HandState): void {
    const event: SelectionEvent = {
      type,
      target,
      hand,
      timestamp: Date.now(),
    };

    this.listeners.get(type)?.forEach((listener) => listener(event));
  }

  // Main update loop
  update(hand: HandState): void {
    // Only process if using select gesture
    if (hand.gesture !== this.options.selectGesture) {
      this.clearHover();
      return;
    }

    // Setup raycast from index finger
    const origin = hand.indexTip || hand.position;
    const direction = hand.forward || new THREE.Vector3(0, 0, -1);
    this.raycaster.set(origin, direction.normalize());

    // Raycast against selectable objects
    const objectsArray = Array.from(this.selectableObjects);
    const intersects = this.raycaster.intersectObjects(objectsArray, true);

    if (intersects.length > 0) {
      const hitObject = this.findSelectableParent(intersects[0].object);
      if (hitObject) {
        this.handleHover(hitObject, hand);
      } else {
        this.clearHover();
      }
    } else {
      this.clearHover();
    }
  }

  private findSelectableParent(object: THREE.Object3D): THREE.Object3D | null {
    let current: THREE.Object3D | null = object;
    while (current) {
      if (this.selectableObjects.has(current)) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  private handleHover(object: THREE.Object3D, hand: HandState): void {
    const now = Date.now();

    // New object being hovered
    if (object !== this.hoveredObject) {
      this.hoveredObject = object;
      this.hoverStartTime = now;
      this.emit('hover', object, hand);
      return;
    }

    // Check if hover duration reached
    if (this.hoverStartTime &&
        now - this.hoverStartTime >= this.options.hoverDuration) {
      this.selectObject(object, hand);
      this.hoverStartTime = null; // Prevent re-selection
    }
  }

  private clearHover(): void {
    this.hoveredObject = null;
    this.hoverStartTime = null;
  }

  private selectObject(object: THREE.Object3D, hand: HandState): void {
    if (this.selectedObject && this.selectedObject !== object) {
      this.deselectObject(this.selectedObject, hand);
    }

    if (this.selectedObject !== object) {
      this.selectedObject = object;
      this.emit('select', object, hand);
    }
  }

  private deselectObject(object: THREE.Object3D, hand?: HandState): void {
    if (this.selectedObject === object) {
      this.selectedObject = null;
      this.emit('deselect', object, hand || {
        id: '',
        position: new THREE.Vector3(),
        gesture: ''
      });
    }
  }

  // Public query methods
  getSelectedObject(): THREE.Object3D | null {
    return this.selectedObject;
  }

  getHoveredObject(): THREE.Object3D | null {
    return this.hoveredObject;
  }

  getHoverProgress(): number {
    if (!this.hoverStartTime) return 0;
    const elapsed = Date.now() - this.hoverStartTime;
    return Math.min(elapsed / this.options.hoverDuration, 1);
  }

  clearSelection(): void {
    if (this.selectedObject) {
      this.deselectObject(this.selectedObject);
    }
    this.clearHover();
  }

  dispose(): void {
    this.selectableObjects.clear();
    this.listeners.clear();
    this.selectedObject = null;
    this.hoveredObject = null;
  }
}
```

## Step 3: Use in React Three Fiber

```typescript
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { PointSelectPlugin } from './PointSelectPlugin';

function SelectableObjects() {
  const box1Ref = useRef<THREE.Mesh>(null);
  const box2Ref = useRef<THREE.Mesh>(null);

  // Create plugin (memoized)
  const selectPlugin = useMemo(() => {
    const plugin = new PointSelectPlugin({
      hoverDuration: 500,
      maxDistance: 10,
      selectGesture: 'point',
    });

    // Listen for selection events
    plugin.on('select', (event) => {
      console.log('Selected:', event.target.name);
      // Change color, play sound, etc.
    });

    plugin.on('hover', (event) => {
      console.log('Hovering:', event.target.name);
      // Show hover indicator
    });

    plugin.on('deselect', (event) => {
      console.log('Deselected:', event.target.name);
      // Reset visual state
    });

    return plugin;
  }, []);

  // Register objects on mount
  useEffect(() => {
    if (box1Ref.current) selectPlugin.registerObject(box1Ref.current);
    if (box2Ref.current) selectPlugin.registerObject(box2Ref.current);

    return () => {
      if (box1Ref.current) selectPlugin.unregisterObject(box1Ref.current);
      if (box2Ref.current) selectPlugin.unregisterObject(box2Ref.current);
    };
  }, [selectPlugin]);

  // Update plugin every frame
  useFrame(() => {
    const hand = {
      id: 'right',
      position: cursor.position,
      gesture: currentGesture,
      indexTip: landmarks[8],
      forward: calculateHandDirection(landmarks),
    };

    selectPlugin.update(hand);

    // Visual feedback based on hover progress
    if (box1Ref.current && selectPlugin.getHoveredObject() === box1Ref.current) {
      const progress = selectPlugin.getHoverProgress();
      (box1Ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = progress * 0.5;
    }
  });

  return (
    <>
      <mesh ref={box1Ref} name="Box 1" position={[0, 0, -2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" emissive="orange" />
      </mesh>

      <mesh ref={box2Ref} name="Box 2" position={[2, 0, -2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="blue" emissive="blue" />
      </mesh>
    </>
  );
}
```

## Step 4: Add Visual Feedback

### Hover Indicator

```typescript
function HoverIndicator({ plugin }: { plugin: PointSelectPlugin }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const hoveredObject = plugin.getHoveredObject();
    const progress = plugin.getHoverProgress();

    if (ringRef.current && hoveredObject) {
      // Position ring around hovered object
      ringRef.current.position.copy(hoveredObject.position);

      // Animate ring based on hover progress
      const scale = 1 + progress * 0.2;
      ringRef.current.scale.set(scale, scale, scale);

      // Fade in
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = progress;
    } else if (ringRef.current) {
      // Hide when not hovering
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[0.6, 0.05, 16, 32]} />
      <meshBasicMaterial color="yellow" transparent opacity={0} />
    </mesh>
  );
}
```

### Selection Highlight

```typescript
plugin.on('select', (event) => {
  const material = (event.target as THREE.Mesh).material as THREE.MeshStandardMaterial;
  material.emissive.setHex(0xffff00);
  material.emissiveIntensity = 0.8;
});

plugin.on('deselect', (event) => {
  const material = (event.target as THREE.Mesh).material as THREE.MeshStandardMaterial;
  material.emissive.setHex(0x000000);
  material.emissiveIntensity = 0;
});
```

## Advanced Features

### Multi-Select Support

```typescript
class MultiSelectPlugin extends PointSelectPlugin {
  private selectedObjects = new Set<THREE.Object3D>();

  private selectObject(object: THREE.Object3D, hand: HandState): void {
    // Toggle selection instead of replacing
    if (this.selectedObjects.has(object)) {
      this.selectedObjects.delete(object);
      this.emit('deselect', object, hand);
    } else {
      this.selectedObjects.add(object);
      this.emit('select', object, hand);
    }
  }

  getSelectedObjects(): THREE.Object3D[] {
    return Array.from(this.selectedObjects);
  }

  clearAllSelections(): void {
    this.selectedObjects.forEach((obj) => {
      this.emit('deselect', obj, { id: '', position: new THREE.Vector3(), gesture: '' });
    });
    this.selectedObjects.clear();
  }
}
```

### Distance-Based Interaction

```typescript
class ProximitySelectPlugin extends PointSelectPlugin {
  private proximityThreshold = 0.5;

  update(hand: HandState): void {
    // Check proximity to objects
    this.selectableObjects.forEach((object) => {
      const distance = hand.position.distanceTo(object.position);

      if (distance < this.proximityThreshold && hand.gesture === 'pinch') {
        this.selectObject(object, hand);
      }
    });
  }
}
```

### Gesture-Triggered Actions

```typescript
plugin.on('select', (event) => {
  const hand = event.hand;

  // Different actions for different gestures
  if (hand.gesture === 'pinch') {
    // Grab and move
    startDragging(event.target);
  } else if (hand.gesture === 'point') {
    // Activate/click
    activateObject(event.target);
  } else if (hand.gesture === 'open') {
    // Release/push away
    pushObject(event.target, hand.forward);
  }
});
```

## Best Practices

### 1. Performance Optimization

```typescript
// Cache raycast results
private raycastCache = new Map<string, number>();
private cacheTimeout = 100; // ms

update(hand: HandState): void {
  const cacheKey = `${hand.id}-${Date.now()}`;

  // Use cached result if recent
  if (this.raycastCache.has(cacheKey)) {
    return;
  }

  // Perform raycast
  const intersects = this.raycaster.intersectObjects(...);
  this.raycastCache.set(cacheKey, Date.now());

  // Clean old cache entries
  for (const [key, timestamp] of this.raycastCache.entries()) {
    if (Date.now() - timestamp > this.cacheTimeout) {
      this.raycastCache.delete(key);
    }
  }
}
```

### 2. Layer-Based Filtering

```typescript
// Only raycast against specific layers
this.raycaster.layers.set(1); // Layer 1 = selectable objects

// Set objects to layer 1
object.layers.set(1);
```

### 3. Event Throttling

```typescript
private lastEmitTime = 0;
private emitThrottle = 50; // ms

private emit(type: string, target: THREE.Object3D, hand: HandState): void {
  const now = Date.now();
  if (now - this.lastEmitTime < this.emitThrottle) {
    return; // Skip emission
  }

  this.lastEmitTime = now;
  // ... emit event
}
```

## Testing

```typescript
describe('PointSelectPlugin', () => {
  it('should select object after hover duration', async () => {
    const plugin = new PointSelectPlugin({ hoverDuration: 100 });
    const mesh = new THREE.Mesh();

    plugin.registerObject(mesh);

    const hand = {
      id: 'test',
      position: new THREE.Vector3(0, 0, 0),
      gesture: 'point',
      forward: new THREE.Vector3(0, 0, -1),
    };

    // Start hovering
    plugin.update(hand);
    expect(plugin.getHoveredObject()).toBe(mesh);
    expect(plugin.getSelectedObject()).toBeNull();

    // Wait for hover duration
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Update again
    plugin.update(hand);
    expect(plugin.getSelectedObject()).toBe(mesh);
  });
});
```

## Resources

- [Three.js Raycasting](https://threejs.org/docs/#api/en/core/Raycaster)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Event-Driven Architecture](https://en.wikipedia.org/wiki/Event-driven_architecture)

## Next Steps

1. Add sound effects on select/deselect
2. Implement haptic feedback (if supported)
3. Create visual cursor for pointing
4. Add undo/redo for selections
5. Support multi-hand interactions

Happy interaction coding! 🎯
