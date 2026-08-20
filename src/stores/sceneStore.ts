import { create } from 'zustand';
import type { SceneObject, GrabbedObject } from '@/types/scene.types';

interface SceneStore {
  objects: SceneObject[];
  grabbedObject: GrabbedObject | null;
  setGrabbedObject: (grabbed: GrabbedObject | null) => void;
  updateObjectPosition: (id: string, position: [number, number, number]) => void;
}

export const useSceneStore = create<SceneStore>((set) => ({
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
  grabbedObject: null,
  setGrabbedObject: (grabbed) => set({ grabbedObject: grabbed }),
  updateObjectPosition: (id, position) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, position } : obj
      ),
    })),
}));
