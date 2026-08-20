import { create } from 'zustand';
import type { SceneObject, GrabbedObject } from '@/types/scene.types';

interface SceneStore {
  objects: SceneObject[];
  grabbedObjects: Map<string, GrabbedObject>; // Map handId -> GrabbedObject
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
      position: [-2, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
      color: '#3b82f6',
    },
    {
      id: 'sphere-1',
      type: 'sphere',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
      color: '#10b981',
    },
    {
      id: 'torus-1',
      type: 'torus',
      position: [2, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
      color: '#f59e0b',
    },
  ],
  grabbedObjects: new Map(),
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
