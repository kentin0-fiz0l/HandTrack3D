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
});
