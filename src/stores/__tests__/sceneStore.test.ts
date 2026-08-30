import { describe, it, expect, beforeEach } from 'vitest';
import { useSceneStore } from '../sceneStore';

describe('sceneStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    const initialState = useSceneStore.getState();
    useSceneStore.setState({
      objects: [
        {
          id: 'box-1',
          type: 'box',
          position: [-2, 1.5, -4],
          rotation: [0, 0, 0],
          scale: 1,
          color: '#3b82f6',
        },
        {
          id: 'sphere-1',
          type: 'sphere',
          position: [0, 1.5, -4],
          rotation: [0, 0, 0],
          scale: 1,
          color: '#10b981',
        },
        {
          id: 'torus-1',
          type: 'torus',
          position: [2, 1.5, -4],
          rotation: [0, 0, 0],
          scale: 1,
          color: '#f59e0b',
        },
      ],
      grabbedObjects: new Map(),
      objectProperties: new Map(),
      selectedObjectId: null,
      buildMode: false,
      ghostPreview: null,
    });
  });

  describe('Initial state', () => {
    it('should have three default objects', () => {
      const state = useSceneStore.getState();
      expect(state.objects).toHaveLength(3);
    });

    it('should have correct object types', () => {
      const state = useSceneStore.getState();
      expect(state.objects[0].type).toBe('box');
      expect(state.objects[1].type).toBe('sphere');
      expect(state.objects[2].type).toBe('torus');
    });

    it('should have no grabbed objects initially', () => {
      const state = useSceneStore.getState();
      expect(state.grabbedObjects.size).toBe(0);
    });

    it('should position objects correctly', () => {
      const state = useSceneStore.getState();
      expect(state.objects[0].position).toEqual([-2, 1.5, -4]);
      expect(state.objects[1].position).toEqual([0, 1.5, -4]);
      expect(state.objects[2].position).toEqual([2, 1.5, -4]);
    });
  });

  describe('grabObject', () => {
    it('should add object to grabbed map', () => {
      const { grabObject } = useSceneStore.getState();
      grabObject('hand-1', 'box-1', [0, 0, 0]);

      const state = useSceneStore.getState();
      expect(state.grabbedObjects.size).toBe(1);
      expect(state.grabbedObjects.has('hand-1')).toBe(true);
    });

    it('should store correct grab data', () => {
      const { grabObject } = useSceneStore.getState();
      const offset: [number, number, number] = [0.1, 0.2, 0.3];
      grabObject('hand-1', 'box-1', offset);

      const state = useSceneStore.getState();
      const grabbed = state.grabbedObjects.get('hand-1');
      expect(grabbed).toEqual({
        id: 'box-1',
        handId: 'hand-1',
        offset,
      });
    });

    it('should allow multiple hands to grab different objects', () => {
      const { grabObject } = useSceneStore.getState();
      grabObject('hand-1', 'box-1', [0, 0, 0]);
      grabObject('hand-2', 'sphere-1', [0, 0, 0]);

      const state = useSceneStore.getState();
      expect(state.grabbedObjects.size).toBe(2);
      expect(state.grabbedObjects.get('hand-1')?.id).toBe('box-1');
      expect(state.grabbedObjects.get('hand-2')?.id).toBe('sphere-1');
    });

    it('should replace previous grab if same hand grabs again', () => {
      const { grabObject } = useSceneStore.getState();
      grabObject('hand-1', 'box-1', [0, 0, 0]);
      grabObject('hand-1', 'sphere-1', [0, 0, 0]);

      const state = useSceneStore.getState();
      expect(state.grabbedObjects.size).toBe(1);
      expect(state.grabbedObjects.get('hand-1')?.id).toBe('sphere-1');
    });
  });

  describe('releaseObject', () => {
    it('should remove object from grabbed map', () => {
      const { grabObject, releaseObject } = useSceneStore.getState();
      grabObject('hand-1', 'box-1', [0, 0, 0]);

      let state = useSceneStore.getState();
      expect(state.grabbedObjects.size).toBe(1);

      releaseObject('hand-1');
      state = useSceneStore.getState();
      expect(state.grabbedObjects.size).toBe(0);
    });

    it('should not affect other grabbed objects', () => {
      const { grabObject, releaseObject } = useSceneStore.getState();
      grabObject('hand-1', 'box-1', [0, 0, 0]);
      grabObject('hand-2', 'sphere-1', [0, 0, 0]);

      releaseObject('hand-1');

      const state = useSceneStore.getState();
      expect(state.grabbedObjects.size).toBe(1);
      expect(state.grabbedObjects.has('hand-2')).toBe(true);
    });

    it('should handle releasing non-existent grab', () => {
      const { releaseObject } = useSceneStore.getState();
      expect(() => releaseObject('non-existent')).not.toThrow();

      const state = useSceneStore.getState();
      expect(state.grabbedObjects.size).toBe(0);
    });
  });

  describe('updateObjectPosition', () => {
    it('should update object position', () => {
      const { updateObjectPosition } = useSceneStore.getState();
      const newPosition: [number, number, number] = [5, 10, -2];
      updateObjectPosition('box-1', newPosition);

      const state = useSceneStore.getState();
      const box = state.objects.find((obj) => obj.id === 'box-1');
      expect(box?.position).toEqual(newPosition);
    });

    it('should not affect other objects', () => {
      const { updateObjectPosition } = useSceneStore.getState();
      const originalSpherePosition = useSceneStore.getState().objects[1].position;

      updateObjectPosition('box-1', [1, 2, 3]);

      const state = useSceneStore.getState();
      const sphere = state.objects.find((obj) => obj.id === 'sphere-1');
      expect(sphere?.position).toEqual(originalSpherePosition);
    });

    it('should handle updating non-existent object', () => {
      const { updateObjectPosition } = useSceneStore.getState();
      const originalLength = useSceneStore.getState().objects.length;

      updateObjectPosition('non-existent', [1, 2, 3]);

      const state = useSceneStore.getState();
      expect(state.objects.length).toBe(originalLength);
    });
  });

  describe('isObjectGrabbed', () => {
    it('should return false for non-grabbed object', () => {
      const { isObjectGrabbed } = useSceneStore.getState();
      expect(isObjectGrabbed('box-1')).toBe(false);
    });

    it('should return true for grabbed object', () => {
      const { grabObject, isObjectGrabbed } = useSceneStore.getState();
      grabObject('hand-1', 'box-1', [0, 0, 0]);
      expect(isObjectGrabbed('box-1')).toBe(true);
    });

    it('should return false after object is released', () => {
      const { grabObject, releaseObject, isObjectGrabbed } = useSceneStore.getState();
      grabObject('hand-1', 'box-1', [0, 0, 0]);
      expect(isObjectGrabbed('box-1')).toBe(true);

      releaseObject('hand-1');
      expect(isObjectGrabbed('box-1')).toBe(false);
    });

    it('should handle non-existent object', () => {
      const { isObjectGrabbed } = useSceneStore.getState();
      expect(isObjectGrabbed('non-existent')).toBe(false);
    });
  });

  describe('Per-object properties', () => {
    describe('setObjectProperty', () => {
      it('should set individual property on object', () => {
        const { setObjectProperty, getObjectProperty } = useSceneStore.getState();
        setObjectProperty('box-1', 'mass', 2.5);
        expect(getObjectProperty('box-1', 'mass')).toBe(2.5);
      });

      it('should set multiple properties independently', () => {
        const { setObjectProperty, getObjectProperty } = useSceneStore.getState();
        setObjectProperty('box-1', 'mass', 2.5);
        setObjectProperty('box-1', 'friction', 0.9);
        expect(getObjectProperty('box-1', 'mass')).toBe(2.5);
        expect(getObjectProperty('box-1', 'friction')).toBe(0.9);
      });

      it('should not affect properties of other objects', () => {
        const { setObjectProperty, getObjectProperty } = useSceneStore.getState();
        setObjectProperty('box-1', 'mass', 2.5);
        expect(getObjectProperty('sphere-1', 'mass')).toBe(1.0); // Default
      });
    });

    describe('getObjectProperty', () => {
      it('should return default value for unset property', () => {
        const { getObjectProperty } = useSceneStore.getState();
        expect(getObjectProperty('box-1', 'mass')).toBe(1.0);
      });

      it('should return custom value after setting', () => {
        const { setObjectProperty, getObjectProperty } = useSceneStore.getState();
        setObjectProperty('box-1', 'restitution', 0.8);
        expect(getObjectProperty('box-1', 'restitution')).toBe(0.8);
      });
    });

    describe('getObjectProperties', () => {
      it('should return default properties for object without custom properties', () => {
        const { getObjectProperties } = useSceneStore.getState();
        const props = getObjectProperties('box-1');
        expect(props.mass).toBe(1.0);
        expect(props.friction).toBe(0.7);
        expect(props.restitution).toBe(0.5);
      });

      it('should return merged properties after setting custom values', () => {
        const { setObjectProperty, getObjectProperties } = useSceneStore.getState();
        setObjectProperty('box-1', 'mass', 3.0);
        setObjectProperty('box-1', 'locked', true);

        const props = getObjectProperties('box-1');
        expect(props.mass).toBe(3.0);
        expect(props.locked).toBe(true);
        expect(props.friction).toBe(0.7); // Still default
      });
    });

    describe('resetObjectProperties', () => {
      it('should reset all properties to defaults', () => {
        const { setObjectProperty, resetObjectProperties, getObjectProperties } =
          useSceneStore.getState();

        setObjectProperty('box-1', 'mass', 5.0);
        setObjectProperty('box-1', 'friction', 0.9);
        setObjectProperty('box-1', 'locked', true);

        resetObjectProperties('box-1');

        const props = getObjectProperties('box-1');
        expect(props.mass).toBe(1.0);
        expect(props.friction).toBe(0.7);
        expect(props.locked).toBe(false);
      });
    });

    describe('addObject', () => {
      it('should initialize properties for new object', () => {
        const { addObject, getObjectProperties } = useSceneStore.getState();
        const newObject = {
          id: 'new-box',
          type: 'box' as const,
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: 1,
          color: '#ff0000',
        };

        addObject(newObject);

        const props = getObjectProperties('new-box');
        expect(props.mass).toBe(1.0);
        expect(props.color).toBe('#ff0000');
      });

      it('should enforce MAX_OBJECTS limit', () => {
        const { addObject } = useSceneStore.getState();
        const initialCount = useSceneStore.getState().objects.length;

        // Try to add 50+ objects
        for (let i = 0; i < 50; i++) {
          addObject({
            id: `test-${i}`,
            type: 'box',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: 1,
            color: '#ffffff',
          });
        }

        const state = useSceneStore.getState();
        expect(state.objects.length).toBeLessThanOrEqual(50);
      });
    });

    describe('removeObject', () => {
      it('should remove object and its properties', () => {
        const { addObject, setObjectProperty, removeObject, getObjectProperties } =
          useSceneStore.getState();

        addObject({
          id: 'temp-box',
          type: 'box',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: 1,
          color: '#00ff00',
        });

        setObjectProperty('temp-box', 'mass', 10.0);
        removeObject('temp-box');

        const state = useSceneStore.getState();
        expect(state.objects.find((obj) => obj.id === 'temp-box')).toBeUndefined();

        // Properties should return to defaults (not stored in Map)
        const props = getObjectProperties('temp-box');
        expect(props.mass).toBe(1.0); // Default, not custom value
      });

      it('should deselect object if it was selected', () => {
        const { selectObject, removeObject } = useSceneStore.getState();

        selectObject('box-1');
        expect(useSceneStore.getState().selectedObjectId).toBe('box-1');

        removeObject('box-1');
        expect(useSceneStore.getState().selectedObjectId).toBeNull();
      });
    });

    describe('selectObject', () => {
      it('should select object', () => {
        const { selectObject } = useSceneStore.getState();
        selectObject('box-1');
        expect(useSceneStore.getState().selectedObjectId).toBe('box-1');
      });

      it('should deselect when passed null', () => {
        const { selectObject } = useSceneStore.getState();
        selectObject('box-1');
        selectObject(null);
        expect(useSceneStore.getState().selectedObjectId).toBeNull();
      });

      it('should change selection', () => {
        const { selectObject } = useSceneStore.getState();
        selectObject('box-1');
        selectObject('sphere-1');
        expect(useSceneStore.getState().selectedObjectId).toBe('sphere-1');
      });
    });

    describe('setObjects with properties', () => {
      it('should load objects with provided properties', () => {
        const { setObjects, getObjectProperty } = useSceneStore.getState();

        const newObjects = [
          {
            id: 'new-box',
            type: 'box' as const,
            position: [0, 0, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: 1,
            color: '#ff0000',
          },
        ];

        const newProperties = new Map();
        newProperties.set('new-box', {
          mass: 5.0,
          restitution: 0.9,
          friction: 0.3,
          linearDamping: 0.1,
          angularDamping: 0.2,
          gravityScale: 1.5,
          color: '#ff0000',
          emissiveIntensity: 0.5,
          metalness: 0.8,
          roughness: 0.2,
          locked: true,
          visible: true,
        });

        setObjects(newObjects, newProperties);

        expect(getObjectProperty('new-box', 'mass')).toBe(5.0);
        expect(getObjectProperty('new-box', 'restitution')).toBe(0.9);
        expect(getObjectProperty('new-box', 'locked')).toBe(true);
      });

      it('should initialize default properties when no properties provided', () => {
        const { setObjects, getObjectProperty } = useSceneStore.getState();

        const newObjects = [
          {
            id: 'default-box',
            type: 'box' as const,
            position: [0, 0, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: 1,
            color: '#00ff00',
          },
        ];

        setObjects(newObjects);

        expect(getObjectProperty('default-box', 'mass')).toBe(1.0);
        expect(getObjectProperty('default-box', 'friction')).toBe(0.7);
        expect(getObjectProperty('default-box', 'locked')).toBe(false);
      });

      it('should preserve existing properties when not provided', () => {
        const { setObjects, setObjectProperty, getObjectProperty } = useSceneStore.getState();

        // Set custom property on existing object
        setObjectProperty('box-1', 'mass', 3.0);

        const existingObjects = useSceneStore.getState().objects;
        setObjects(existingObjects); // Load same objects without properties

        // Should still have the custom property since we passed the existing objects
        expect(getObjectProperty('box-1', 'mass')).toBe(3.0);
      });
    });
  });
});
