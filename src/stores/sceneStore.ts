import { create } from 'zustand';
import type { SceneObject, GrabbedObject } from '@/types/scene.types';

interface SceneStore {
  objects: SceneObject[];
  grabbedObjects: Map<string, GrabbedObject>; // Map handId -> GrabbedObject
  addObject: (object: SceneObject) => void;
  setObjects: (objects: SceneObject[]) => void;
  clearObjects: () => void;
  grabObject: (handId: string, objectId: string, offset: [number, number, number]) => void;
  releaseObject: (handId: string) => void;
  updateObjectPosition: (id: string, position: [number, number, number]) => void;
  isObjectGrabbed: (objectId: string) => boolean;
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  objects: [
    {
      id: 'box-1',
      type: 'box',
      position: [-2, 1.5, -4], // Left, at eye level, in front
      rotation: [0, 0, 0],
      scale: 1,
      color: '#3b82f6',
    },
    {
      id: 'sphere-1',
      type: 'sphere',
      position: [0, 1.5, -4], // Center, at eye level, in front
      rotation: [0, 0, 0],
      scale: 1,
      color: '#10b981',
    },
    {
      id: 'torus-1',
      type: 'torus',
      position: [2, 1.5, -4], // Right, at eye level, in front
      rotation: [0, 0, 0],
      scale: 1,
      color: '#f59e0b',
    },
  ],
  grabbedObjects: new Map(),
  addObject: (object) =>
    set((state) => ({
      objects: [...state.objects, object],
    })),
  setObjects: (objects) =>
    set({
      objects,
      grabbedObjects: new Map(), // Release all grabbed objects when scene changes
    }),
  clearObjects: () =>
    set({
      objects: [],
      grabbedObjects: new Map(),
    }),
  grabObject: (handId, objectId, offset) =>
    set((state) => {
      const newGrabbedObjects = new Map(state.grabbedObjects);
      newGrabbedObjects.set(handId, { id: objectId, handId, offset });
      return { grabbedObjects: newGrabbedObjects };
    }),
  releaseObject: (handId) =>
    set((state) => {
      const newGrabbedObjects = new Map(state.grabbedObjects);
      newGrabbedObjects.delete(handId);
      return { grabbedObjects: newGrabbedObjects };
    }),
  updateObjectPosition: (id, position) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, position } : obj
      ),
    })),
  isObjectGrabbed: (objectId) => {
    const grabbedObjects = get().grabbedObjects;
    for (const grabbed of grabbedObjects.values()) {
      if (grabbed.id === objectId) return true;
    }
    return false;
  },
}));
