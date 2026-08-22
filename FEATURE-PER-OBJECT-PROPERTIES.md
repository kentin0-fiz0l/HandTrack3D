# Per-Object Property Editor Feature

## Overview
Implemented comprehensive per-object property editing system for HandTrack3D, allowing users to customize individual object physics, appearance, and interaction behavior through right-click selection and a property panel UI.

## Implementation Summary

### 1. Type System Updates
**File:** `/Users/kentino/Projects/Active/HandTrack3D/src/types/scene.types.ts`

Added `ObjectProperties` interface with 12 customizable properties:

#### Physics Properties
- `mass`: 0.1 - 10.0 (object weight)
- `restitution`: 0.0 - 1.0 (bounciness)
- `friction`: 0.0 - 1.0 (surface friction)
- `linearDamping`: 0.0 - 2.0 (velocity damping)
- `angularDamping`: 0.0 - 2.0 (rotation damping)
- `gravityScale`: 0.0 - 2.0 (gravity multiplier)

#### Visual Properties
- `color`: Hex color string
- `emissiveIntensity`: 0.0 - 1.0 (glow effect)
- `metalness`: 0.0 - 1.0 (metallic appearance)
- `roughness`: 0.0 - 1.0 (surface roughness)

#### Interaction Properties
- `locked`: Boolean (prevents grabbing)
- `visible`: Boolean (show/hide object)

### 2. Store Refactor
**File:** `/Users/kentino/Projects/Active/HandTrack3D/src/stores/sceneStore.ts`

Major changes:
- Added `objectProperties: Map<string, ObjectProperties>` for per-object state
- Added `selectedObjectId: string | null` for tracking selected object
- Implemented `MAX_OBJECTS = 50` performance budget
- Added property management methods:
  - `setObjectProperty(id, key, value)` - Set individual property
  - `getObjectProperty(id, key)` - Get individual property with defaults
  - `getObjectProperties(id)` - Get all properties for object
  - `resetObjectProperties(id)` - Reset to defaults
  - `selectObject(id)` - Select/deselect object
  - `removeObject(id)` - Remove object and cleanup
- Updated `addObject()` to initialize default properties
- Updated `clearObjects()` to cleanup property map

### 3. Interactive Object Updates
**File:** `/Users/kentino/Projects/Active/HandTrack3D/src/components/HandTrackingCanvas/InteractiveObject.tsx`

Changes:
- Integrated per-object properties instead of global settings
- Added right-click raycasting for object selection
- Visual feedback for selected objects (pink highlight)
- Respects `locked` property (prevents grab when true)
- Respects `visible` property (hides object when false)
- Applies per-object physics properties to RigidBody
- Applies per-object visual properties to materials

### 4. Property Editor UI
**File:** `/Users/kentino/Projects/Active/HandTrack3D/src/components/ObjectPropertyEditor.tsx` (NEW)

Features:
- Right-side panel with object type and ID display
- Organized into three sections:
  - **Physics** - Mass, bounciness, friction, damping, gravity
  - **Visual** - Color picker, emissive, metalness, roughness
  - **Interaction** - Locked, visible toggles
- Real-time updates via sliders and controls
- Reset button (restores defaults)
- Delete button (with confirmation)
- Close button (deselect object)
- Scrollable panel for smaller screens

### 5. App Integration
**File:** `/Users/kentino/Projects/Active/HandTrack3D/src/App.tsx`

- Imported and rendered `ObjectPropertyEditor` component
- Updated instructions to mention right-click functionality

### 6. Test Coverage
**File:** `/Users/kentino/Projects/Active/HandTrack3D/src/stores/__tests__/sceneStore.test.ts`

Added 17 new tests covering:
- Individual property setting and retrieval
- Default property handling
- Property isolation between objects
- Property reset functionality
- Object addition with property initialization
- MAX_OBJECTS enforcement
- Object removal with property cleanup
- Selection state management

**Total Tests:** 33 passing (16 original + 17 new)

## Usage

### For Users
1. **Select Object**: Right-click any 3D object
2. **Edit Properties**: Adjust sliders/controls in the property panel
3. **Visual Feedback**: Selected objects highlight in pink
4. **Reset**: Click "Reset" to restore defaults
5. **Delete**: Click "Delete" to remove object
6. **Deselect**: Click "✕" or select another object

### For Developers
```typescript
// Get object properties
const props = useSceneStore((state) => state.getObjectProperties('box-1'));

// Set a property
useSceneStore.getState().setObjectProperty('box-1', 'mass', 2.5);

// Reset properties
useSceneStore.getState().resetObjectProperties('box-1');

// Select object
useSceneStore.getState().selectObject('box-1');
```

## Performance Considerations

1. **MAX_OBJECTS Limit**: Enforced at 50 objects to maintain 60 FPS
2. **Property Storage**: Map-based storage for O(1) property lookups
3. **Default Values**: Unset properties use defaults (no memory overhead)
4. **React Optimization**: Minimal re-renders via Zustand selectors

## Breaking Changes

### Store Shape
The `sceneStore` now includes:
```typescript
{
  objectProperties: Map<string, ObjectProperties>
  selectedObjectId: string | null
}
```

### InteractiveObject Behavior
- Objects now check `properties.locked` before allowing grab
- Objects respect `properties.visible` for rendering
- Physics properties sourced from per-object state, not global settings

## Migration Guide

For existing code that relied on global physics settings:

**Before:**
```typescript
const restitution = useSettingsStore((state) => state.restitution);
```

**After:**
```typescript
const props = useSceneStore((state) => state.getObjectProperties(objectId));
const restitution = props.restitution;
```

## Future Enhancements

Potential improvements:
1. Bulk property editing (multi-select)
2. Property presets/templates
3. Copy/paste properties between objects
4. Undo/redo for property changes
5. Property animation over time
6. Property export/import (save configurations)
7. Property constraints (e.g., max mass based on object type)

## Files Modified

- `/Users/kentino/Projects/Active/HandTrack3D/src/types/scene.types.ts`
- `/Users/kentino/Projects/Active/HandTrack3D/src/stores/sceneStore.ts`
- `/Users/kentino/Projects/Active/HandTrack3D/src/components/HandTrackingCanvas/InteractiveObject.tsx`
- `/Users/kentino/Projects/Active/HandTrack3D/src/App.tsx`
- `/Users/kentino/Projects/Active/HandTrack3D/src/stores/__tests__/sceneStore.test.ts`

## Files Created

- `/Users/kentino/Projects/Active/HandTrack3D/src/components/ObjectPropertyEditor.tsx`
- `/Users/kentino/Projects/Active/HandTrack3D/FEATURE-PER-OBJECT-PROPERTIES.md`

## Testing

Run tests with:
```bash
pnpm test
# or specifically
npx vitest run src/stores/__tests__/sceneStore.test.ts
```

Build verification:
```bash
pnpm run build
```

## Completion Status

✅ Per-object property storage (Map-based)
✅ Property CRUD operations
✅ Right-click object selection
✅ Property editor UI
✅ Visual feedback (selection highlight)
✅ Lock/hide functionality
✅ MAX_OBJECTS enforcement
✅ Default property handling
✅ Comprehensive test coverage (33 tests passing)
✅ TypeScript type safety
✅ No breaking changes to existing tests
✅ Build verification passed

Task #7: **COMPLETED**
