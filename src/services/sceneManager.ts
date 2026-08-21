import type { SceneObject } from '@/types/scene.types';
import type { SceneTemplate } from '@/data/sceneTemplates';

const CUSTOM_SCENES_KEY = 'handtrack3d_custom_scenes';

export interface SavedScene {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  objects: SceneObject[];
}

/**
 * Save current scene to localStorage
 */
export function saveSceneToStorage(name: string, description: string, objects: SceneObject[]): SavedScene {
  const customScenes = getCustomScenes();

  const newScene: SavedScene = {
    id: `custom-${Date.now()}`,
    name,
    description,
    timestamp: Date.now(),
    objects,
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
export function exportSceneToFile(name: string, description: string, objects: SceneObject[]): void {
  const sceneData: SavedScene = {
    id: `export-${Date.now()}`,
    name,
    description,
    timestamp: Date.now(),
    objects,
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

/**
 * Load template into scene
 */
export function loadTemplate(template: SceneTemplate): SceneObject[] {
  return template.objects.map((obj) => ({
    ...obj,
    // Generate new IDs to avoid conflicts
    id: `${obj.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }));
}
