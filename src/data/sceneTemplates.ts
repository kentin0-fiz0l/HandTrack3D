import type { SceneObject } from '@/types/scene.types';

export interface SceneTemplate {
  id: string;
  name: string;
  description: string;
  objects: SceneObject[];
  cameraPosition?: [number, number, number];
}

export const sceneTemplates: SceneTemplate[] = [
  {
    id: 'playground',
    name: 'Playground',
    description: 'Variety of objects with different sizes and colors',
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
      {
        id: 'cylinder-1',
        type: 'cylinder',
        position: [-1, 2.5, -5],
        rotation: [0, 0, 0],
        scale: 0.8,
        color: '#ef4444',
      },
      {
        id: 'cone-1',
        type: 'cone',
        position: [1, 2.5, -5],
        rotation: [0, 0, 0],
        scale: 0.8,
        color: '#8b5cf6',
      },
      {
        id: 'capsule-1',
        type: 'capsule',
        position: [0, 3.5, -4],
        rotation: [0, 0, 0],
        scale: 0.6,
        color: '#ec4899',
      },
    ],
  },
  {
    id: 'newtons-cradle',
    name: "Newton's Cradle",
    description: '5 spheres suspended in a row for physics demonstration',
    objects: [
      {
        id: 'cradle-sphere-1',
        type: 'sphere',
        position: [-2, 2, -4],
        rotation: [0, 0, 0],
        scale: 0.8,
        color: '#3b82f6',
      },
      {
        id: 'cradle-sphere-2',
        type: 'sphere',
        position: [-1, 2, -4],
        rotation: [0, 0, 0],
        scale: 0.8,
        color: '#10b981',
      },
      {
        id: 'cradle-sphere-3',
        type: 'sphere',
        position: [0, 2, -4],
        rotation: [0, 0, 0],
        scale: 0.8,
        color: '#f59e0b',
      },
      {
        id: 'cradle-sphere-4',
        type: 'sphere',
        position: [1, 2, -4],
        rotation: [0, 0, 0],
        scale: 0.8,
        color: '#ef4444',
      },
      {
        id: 'cradle-sphere-5',
        type: 'sphere',
        position: [2, 2, -4],
        rotation: [0, 0, 0],
        scale: 0.8,
        color: '#8b5cf6',
      },
    ],
  },
  {
    id: 'stack-tower',
    name: 'Stack Tower',
    description: 'Boxes stacked vertically for stability testing',
    objects: [
      {
        id: 'stack-box-1',
        type: 'box',
        position: [0, 0.6, -4],
        rotation: [0, 0, 0],
        scale: 1.2,
        color: '#ef4444',
      },
      {
        id: 'stack-box-2',
        type: 'box',
        position: [0, 1.9, -4],
        rotation: [0, 0, 0],
        scale: 1.1,
        color: '#f59e0b',
      },
      {
        id: 'stack-box-3',
        type: 'box',
        position: [0, 3.1, -4],
        rotation: [0, 0, 0],
        scale: 1.0,
        color: '#10b981',
      },
      {
        id: 'stack-box-4',
        type: 'box',
        position: [0, 4.2, -4],
        rotation: [0, 0, 0],
        scale: 0.9,
        color: '#3b82f6',
      },
      {
        id: 'stack-box-5',
        type: 'box',
        position: [0, 5.2, -4],
        rotation: [0, 0, 0],
        scale: 0.8,
        color: '#8b5cf6',
      },
      {
        id: 'stack-box-6',
        type: 'box',
        position: [0, 6.1, -4],
        rotation: [0, 0, 0],
        scale: 0.7,
        color: '#ec4899',
      },
    ],
  },
  {
    id: 'marble-run',
    name: 'Marble Run',
    description: 'Angled planes with sphere for physics demo',
    objects: [
      // Ramp boxes (angled platforms)
      {
        id: 'ramp-1',
        type: 'box',
        position: [-2, 3, -4],
        rotation: [0, 0, -0.3], // Slight tilt
        scale: 1.5,
        color: '#6b7280',
      },
      {
        id: 'ramp-2',
        type: 'box',
        position: [0, 2, -4],
        rotation: [0, 0, 0.3], // Opposite tilt
        scale: 1.5,
        color: '#9ca3af',
      },
      {
        id: 'ramp-3',
        type: 'box',
        position: [2, 1, -4],
        rotation: [0, 0, -0.3],
        scale: 1.5,
        color: '#d1d5db',
      },
      // Marble
      {
        id: 'marble-1',
        type: 'sphere',
        position: [-3, 4.5, -4],
        rotation: [0, 0, 0],
        scale: 0.5,
        color: '#ef4444',
      },
      {
        id: 'marble-2',
        type: 'sphere',
        position: [-2.5, 4.8, -4],
        rotation: [0, 0, 0],
        scale: 0.5,
        color: '#f59e0b',
      },
      // Catcher at the bottom
      {
        id: 'catcher',
        type: 'box',
        position: [3, 0.3, -4],
        rotation: [0, 0, 0],
        scale: 1,
        color: '#10b981',
      },
    ],
  },
];

export function getTemplateById(id: string): SceneTemplate | undefined {
  return sceneTemplates.find((template) => template.id === id);
}
