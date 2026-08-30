import { create } from 'zustand';
import type { SceneObject, GrabbedObject, ObjectProperties } from '@/types/scene.types';
import * as THREE from 'three';

// Default properties for new objects
const DEFAULT_OBJECT_PROPERTIES: ObjectProperties = {
  mass: 1.0,
  restitution: 0.5,
  friction: 0.7,
  linearDamping: 0.5,
  angularDamping: 0.5,
  gravityScale: 1.0,
  color: '#3b82f6',
  emissiveIntensity: 0.0,
  metalness: 0.0,
  roughness: 0.5,
  locked: false,
  visible: true,
  isStatic: false,
};

const MAX_OBJECTS = 50; // Performance budget

interface SceneStore {
  objects: SceneObject[];
  grabbedObjects: Map<string, GrabbedObject>; // Map handId -> GrabbedObject
  objectProperties: Map<string, ObjectProperties>; // Map objectId -> ObjectProperties
  selectedObjectId: string | null; // Currently selected object for property editing
  buildMode: boolean;
  ghostPreview: SceneObject | null;

  addObject: (object: SceneObject) => void;
  setObjects: (objects: SceneObject[], properties?: Map<string, ObjectProperties>) => void;
  clearObjects: () => void;
  removeObject: (id: string) => void;
  grabObject: (handId: string, objectId: string, offset: [number, number, number]) => void;
  releaseObject: (handId: string) => void;
  updateObjectPosition: (id: string, position: [number, number, number]) => void;
  isObjectGrabbed: (objectId: string) => boolean;
  getNearObjects: (handPosition: THREE.Vector3, grabRange: number) => SceneObject[];
  toggleBuildMode: () => void;
  setGhostPreview: (preview: SceneObject | null) => void;

  // Per-object property management
  setObjectProperty: <K extends keyof ObjectProperties>(
    id: string,
    key: K,
    value: ObjectProperties[K]
  ) => void;
  getObjectProperty: <K extends keyof ObjectProperties>(
    id: string,
    key: K
  ) => ObjectProperties[K];
  getObjectProperties: (id: string) => ObjectProperties;
  resetObjectProperties: (id: string) => void;

  // Selection management
  selectObject: (id: string | null) => void;
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
  objectProperties: new Map(),
  selectedObjectId: null,
  buildMode: false,
  ghostPreview: null,

  addObject: (object) =>
    set((state) => {
      // Enforce MAX_OBJECTS limit
      if (state.objects.length >= MAX_OBJECTS) {
        console.warn(`Maximum object limit (${MAX_OBJECTS}) reached`);
        return state;
      }

      // Initialize default properties for new object
      const newProperties = new Map(state.objectProperties);
      newProperties.set(object.id, { ...DEFAULT_OBJECT_PROPERTIES, color: object.color });

      return {
        objects: [...state.objects, object],
        objectProperties: newProperties,
      };
    }),

  setObjects: (objects, properties) =>
    set((state) => {
      // If properties are provided, use them; otherwise initialize defaults
      let newProperties: Map<string, ObjectProperties>;

      if (properties) {
        newProperties = new Map(properties);
      } else {
        // Initialize properties for any objects that don't have them
        newProperties = new Map(state.objectProperties);
        objects.forEach((obj) => {
          if (!newProperties.has(obj.id)) {
            newProperties.set(obj.id, { ...DEFAULT_OBJECT_PROPERTIES, color: obj.color });
          }
        });
      }

      return {
        objects,
        grabbedObjects: new Map(), // Release all grabbed objects when scene changes
        objectProperties: newProperties,
      };
    }),

  clearObjects: () =>
    set({
      objects: [],
      grabbedObjects: new Map(),
      objectProperties: new Map(),
      selectedObjectId: null,
    }),

  removeObject: (id) =>
    set((state) => {
      const newProperties = new Map(state.objectProperties);
      newProperties.delete(id);

      // If this was the selected object, deselect it
      const newSelectedId = state.selectedObjectId === id ? null : state.selectedObjectId;

      return {
        objects: state.objects.filter((obj) => obj.id !== id),
        objectProperties: newProperties,
        selectedObjectId: newSelectedId,
      };
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
      objects: state.objects.map((obj) => (obj.id === id ? { ...obj, position } : obj)),
    })),

  isObjectGrabbed: (objectId) => {
    const grabbedObjects = get().grabbedObjects;
    for (const grabbed of grabbedObjects.values()) {
      if (grabbed.id === objectId) return true;
    }
    return false;
  },

  getNearObjects: (handPosition, grabRange) => {
    const objects = get().objects;
    return objects.filter((obj) => {
      const objPos = new THREE.Vector3(...obj.position);
      const distance = handPosition.distanceTo(objPos);
      return distance <= grabRange;
    });
  },

  toggleBuildMode: () =>
    set((state) => ({
      buildMode: !state.buildMode,
      ghostPreview: null, // Clear ghost preview when toggling
    })),

  setGhostPreview: (preview) =>
    set({
      ghostPreview: preview,
    }),

  // Per-object property management
  setObjectProperty: (id, key, value) =>
    set((state) => {
      const newProperties = new Map(state.objectProperties);
      const current = newProperties.get(id) || { ...DEFAULT_OBJECT_PROPERTIES };
      newProperties.set(id, { ...current, [key]: value });
      return { objectProperties: newProperties };
    }),

  getObjectProperty: (id, key) => {
    const properties = get().objectProperties.get(id);
    return properties ? properties[key] : DEFAULT_OBJECT_PROPERTIES[key];
  },

  getObjectProperties: (id) => {
    const properties = get().objectProperties.get(id);
    return properties || { ...DEFAULT_OBJECT_PROPERTIES };
  },

  resetObjectProperties: (id) =>
    set((state) => {
      const newProperties = new Map(state.objectProperties);
      newProperties.set(id, { ...DEFAULT_OBJECT_PROPERTIES });
      return { objectProperties: newProperties };
    }),

  selectObject: (id) =>
    set({
      selectedObjectId: id,
    }),
}));
