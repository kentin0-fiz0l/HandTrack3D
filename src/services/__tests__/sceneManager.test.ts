import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveSceneToStorage,
  loadSavedScene,
  loadTemplate,
  getCustomScenes,
  type SavedScene,
  type LoadedScene,
} from '../sceneManager';
import type { SceneObject, ObjectProperties } from '@/types/scene.types';
import type { SceneTemplate } from '@/data/sceneTemplates';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = localStorageMock as Storage;

describe('sceneManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('saveSceneToStorage', () => {
    it('should save scene with object properties', () => {
      const objects: SceneObject[] = [
        {
          id: 'box-1',
          type: 'box',
          position: [0, 1, -4],
          rotation: [0, 0, 0],
          scale: 1,
          color: '#3b82f6',
        },
      ];

      const properties = new Map<string, ObjectProperties>();
      properties.set('box-1', {
        mass: 2.5,
        restitution: 0.8,
        friction: 0.6,
        linearDamping: 0.3,
        angularDamping: 0.4,
        gravityScale: 1.2,
        color: '#3b82f6',
        emissiveIntensity: 0.1,
        metalness: 0.5,
        roughness: 0.4,
        locked: false,
        visible: true,
      });

      const savedScene = saveSceneToStorage('Test Scene', 'A test scene', objects, properties);

      expect(savedScene.name).toBe('Test Scene');
      expect(savedScene.description).toBe('A test scene');
      expect(savedScene.objects).toEqual(objects);
      expect(savedScene.objectProperties).toBeDefined();
      expect(savedScene.objectProperties?.['box-1'].mass).toBe(2.5);
    });

    it('should persist to localStorage', () => {
      const objects: SceneObject[] = [
        {
          id: 'sphere-1',
          type: 'sphere',
          position: [1, 2, -3],
          rotation: [0, 0, 0],
          scale: 1,
          color: '#10b981',
        },
      ];

      const properties = new Map<string, ObjectProperties>();
      properties.set('sphere-1', {
        mass: 1.5,
        restitution: 0.9,
        friction: 0.5,
        linearDamping: 0.2,
        angularDamping: 0.3,
        gravityScale: 1.0,
        color: '#10b981',
        emissiveIntensity: 0.2,
        metalness: 0.3,
        roughness: 0.6,
        locked: true,
        visible: true,
      });

      saveSceneToStorage('Sphere Scene', 'Contains a sphere', objects, properties);

      const stored = getCustomScenes();
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Sphere Scene');
      expect(stored[0].objectProperties?.['sphere-1'].locked).toBe(true);
    });
  });

  describe('loadSavedScene', () => {
    it('should load scene with saved properties', () => {
      const savedScene: SavedScene = {
        id: 'test-1',
        name: 'Test',
        description: 'Test scene',
        timestamp: Date.now(),
        objects: [
          {
            id: 'box-1',
            type: 'box',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: 1,
            color: '#ff0000',
          },
        ],
        objectProperties: {
          'box-1': {
            mass: 3.0,
            restitution: 0.7,
            friction: 0.8,
            linearDamping: 0.4,
            angularDamping: 0.5,
            gravityScale: 1.1,
            color: '#ff0000',
            emissiveIntensity: 0.3,
            metalness: 0.6,
            roughness: 0.3,
            locked: true,
            visible: true,
          },
        },
      };

      const loaded = loadSavedScene(savedScene);

      expect(loaded.objects).toEqual(savedScene.objects);
      expect(loaded.objectProperties.get('box-1')?.mass).toBe(3.0);
      expect(loaded.objectProperties.get('box-1')?.locked).toBe(true);
    });

    it('should apply default properties for old scenes without objectProperties', () => {
      const oldScene: SavedScene = {
        id: 'old-1',
        name: 'Old Scene',
        description: 'Scene from before property persistence',
        timestamp: Date.now(),
        objects: [
          {
            id: 'box-1',
            type: 'box',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: 1,
            color: '#00ff00',
          },
        ],
        // No objectProperties field (old format)
      };

      const loaded = loadSavedScene(oldScene);

      expect(loaded.objects).toEqual(oldScene.objects);
      // Should have default properties
      expect(loaded.objectProperties.get('box-1')?.mass).toBe(1.0);
      expect(loaded.objectProperties.get('box-1')?.friction).toBe(0.7);
      expect(loaded.objectProperties.get('box-1')?.locked).toBe(false);
      expect(loaded.objectProperties.get('box-1')?.color).toBe('#00ff00'); // From object
    });

    it('should handle mixed scenarios (some objects with properties, some without)', () => {
      const mixedScene: SavedScene = {
        id: 'mixed-1',
        name: 'Mixed Scene',
        description: 'Some objects have properties, some dont',
        timestamp: Date.now(),
        objects: [
          {
            id: 'box-1',
            type: 'box',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: 1,
            color: '#ff0000',
          },
          {
            id: 'sphere-1',
            type: 'sphere',
            position: [1, 1, 1],
            rotation: [0, 0, 0],
            scale: 1,
            color: '#00ff00',
          },
        ],
        objectProperties: {
          'box-1': {
            mass: 2.0,
            restitution: 0.6,
            friction: 0.7,
            linearDamping: 0.5,
            angularDamping: 0.5,
            gravityScale: 1.0,
            color: '#ff0000',
            emissiveIntensity: 0.0,
            metalness: 0.0,
            roughness: 0.5,
            locked: false,
            visible: true,
          },
          // sphere-1 not in properties
        },
      };

      const loaded = loadSavedScene(mixedScene);

      expect(loaded.objectProperties.get('box-1')?.mass).toBe(2.0);
      // sphere-1 should get defaults
      expect(loaded.objectProperties.get('sphere-1')?.mass).toBe(1.0);
      expect(loaded.objectProperties.get('sphere-1')?.color).toBe('#00ff00');
    });
  });

  describe('loadTemplate', () => {
    it('should generate new IDs for template objects', () => {
      const template: SceneTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A template for testing',
        objects: [
          {
            id: 'box-1',
            type: 'box',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: 1,
            color: '#3b82f6',
          },
        ],
      };

      const loaded = loadTemplate(template);

      expect(loaded.objects).toHaveLength(1);
      expect(loaded.objects[0].id).not.toBe('box-1'); // Should have new ID
      expect(loaded.objects[0].type).toBe('box');
      expect(loaded.objects[0].color).toBe('#3b82f6');
    });

    it('should initialize default properties for template objects', () => {
      const template: SceneTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A template for testing',
        objects: [
          {
            id: 'sphere-1',
            type: 'sphere',
            position: [1, 1, 1],
            rotation: [0, 0, 0],
            scale: 1,
            color: '#10b981',
          },
        ],
      };

      const loaded = loadTemplate(template);
      const objectId = loaded.objects[0].id;

      expect(loaded.objectProperties.get(objectId)?.mass).toBe(1.0);
      expect(loaded.objectProperties.get(objectId)?.friction).toBe(0.7);
      expect(loaded.objectProperties.get(objectId)?.color).toBe('#10b981');
    });

    it('should handle templates with multiple objects', () => {
      const template: SceneTemplate = {
        id: 'multi-template',
        name: 'Multi Object Template',
        description: 'Template with multiple objects',
        objects: [
          {
            id: 'box-1',
            type: 'box',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: 1,
            color: '#3b82f6',
          },
          {
            id: 'sphere-1',
            type: 'sphere',
            position: [1, 1, 1],
            rotation: [0, 0, 0],
            scale: 1,
            color: '#10b981',
          },
          {
            id: 'torus-1',
            type: 'torus',
            position: [2, 2, 2],
            rotation: [0, 0, 0],
            scale: 1,
            color: '#f59e0b',
          },
        ],
      };

      const loaded = loadTemplate(template);

      expect(loaded.objects).toHaveLength(3);
      expect(loaded.objectProperties.size).toBe(3);

      // All objects should have unique IDs
      const ids = loaded.objects.map((obj) => obj.id);
      expect(new Set(ids).size).toBe(3);

      // All objects should have properties
      loaded.objects.forEach((obj) => {
        expect(loaded.objectProperties.has(obj.id)).toBe(true);
      });
    });
  });
});
