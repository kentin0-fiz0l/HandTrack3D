import type { SceneObject, ObjectProperties } from '@/types/scene.types';
import type { SceneTemplate } from '@/data/sceneTemplates';

const CUSTOM_SCENES_KEY = 'handtrack3d_custom_scenes';

// Default properties for objects without saved properties (migration)
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
};

export interface SavedScene {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  objects: SceneObject[];
  objectProperties?: Record<string, ObjectProperties>; // Optional for backward compatibility
}

/**
 * Save current scene to localStorage
 */
export function saveSceneToStorage(
  name: string,
  description: string,
  objects: SceneObject[],
  objectProperties: Map<string, ObjectProperties>
): SavedScene {
  const customScenes = getCustomScenes();

  // Convert Map to Record for JSON serialization
  const propertiesRecord: Record<string, ObjectProperties> = {};
  objectProperties.forEach((value, key) => {
    propertiesRecord[key] = value;
  });

  const newScene: SavedScene = {
    id: `custom-${Date.now()}`,
    name,
    description,
    timestamp: Date.now(),
    objects,
    objectProperties: propertiesRecord,
  };

  customScenes.push(newScene);
  localStorage.setItem(CUSTOM_SCENES_KEY, JSON.stringify(customScenes));

  return newScene;
}

/**
 * Get all custom scenes from localStorage
 */
export function getCustomScenes(): SavedScene[] {
  const stored = localStorage.getItem(CUSTOM_SCENES_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse custom scenes:', error);
    return [];
  }
}

/**
 * Delete a custom scene from localStorage
 */
export function deleteCustomScene(id: string): void {
  const customScenes = getCustomScenes();
  const filtered = customScenes.filter((scene) => scene.id !== id);
  localStorage.setItem(CUSTOM_SCENES_KEY, JSON.stringify(filtered));
}

/**
 * Export scene to JSON file
 */
export function exportSceneToFile(
  name: string,
  description: string,
  objects: SceneObject[],
  objectProperties: Map<string, ObjectProperties>
): void {
  // Convert Map to Record for JSON serialization
  const propertiesRecord: Record<string, ObjectProperties> = {};
  objectProperties.forEach((value, key) => {
    propertiesRecord[key] = value;
  });

  const sceneData: SavedScene = {
    id: `export-${Date.now()}`,
    name,
    description,
    timestamp: Date.now(),
    objects,
    objectProperties: propertiesRecord,
  };

  const json = JSON.stringify(sceneData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${name.toLowerCase().replace(/\s+/g, '-')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import scene from JSON file
 */
export function importSceneFromFile(): Promise<SavedScene> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const scene = JSON.parse(content) as SavedScene;

          // Validate scene structure
          if (!scene.objects || !Array.isArray(scene.objects)) {
            throw new Error('Invalid scene format');
          }

          resolve(scene);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };

    input.click();
  });
}

export interface LoadedScene {
  objects: SceneObject[];
  objectProperties: Map<string, ObjectProperties>;
}

/**
 * Load template into scene
 */
export function loadTemplate(template: SceneTemplate): LoadedScene {
  const objects = template.objects.map((obj) => ({
    ...obj,
    // Generate new IDs to avoid conflicts
    id: `${obj.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }));

  // Initialize default properties for all objects
  const objectProperties = new Map<string, ObjectProperties>();
  objects.forEach((obj) => {
    objectProperties.set(obj.id, { ...DEFAULT_OBJECT_PROPERTIES, color: obj.color });
  });

  return { objects, objectProperties };
}

/**
 * Load saved scene (from localStorage or imported file)
 * Applies migration for old scenes without objectProperties
 */
export function loadSavedScene(scene: SavedScene): LoadedScene {
  const objects = scene.objects;
  const objectProperties = new Map<string, ObjectProperties>();

  // If scene has saved properties, use them
  if (scene.objectProperties) {
    Object.entries(scene.objectProperties).forEach(([id, props]) => {
      objectProperties.set(id, props);
    });
  }

  // Apply default properties for any objects missing them (migration)
  objects.forEach((obj) => {
    if (!objectProperties.has(obj.id)) {
      objectProperties.set(obj.id, { ...DEFAULT_OBJECT_PROPERTIES, color: obj.color });
    }
  });

  return { objects, objectProperties };
}
