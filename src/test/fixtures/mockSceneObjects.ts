import type { SceneObject } from '@/types/scene.types';

/**
 * Create a basic box object
 */
export function createMockBox(overrides?: Partial<SceneObject>): SceneObject {
  return {
    id: 'box-test-1',
    type: 'box',
    position: [0, 1.5, -4],
    rotation: [0, 0, 0],
    scale: 1,
    color: '#3b82f6',
    ...overrides,
  };
}

/**
 * Create a basic sphere object
 */
export function createMockSphere(overrides?: Partial<SceneObject>): SceneObject {
  return {
    id: 'sphere-test-1',
    type: 'sphere',
    position: [0, 2, -4],
    rotation: [0, 0, 0],
    scale: 1,
    color: '#10b981',
    ...overrides,
  };
}

/**
 * Create a basic torus object
 */
export function createMockTorus(overrides?: Partial<SceneObject>): SceneObject {
  return {
    id: 'torus-test-1',
    type: 'torus',
    position: [0, 2.5, -4],
    rotation: [0, 0, 0],
    scale: 1,
    color: '#f59e0b',
    ...overrides,
  };
}

/**
 * Create a playground scene with variety of objects
 */
export function createPlaygroundScene(): SceneObject[] {
  return [
    createMockBox({ id: 'box-1', position: [-2, 1.5, -4], color: '#3b82f6' }),
    createMockBox({ id: 'box-2', position: [2, 1.5, -4], color: '#8b5cf6', scale: 0.8 }),
    createMockSphere({ id: 'sphere-1', position: [0, 2, -4], color: '#10b981' }),
    createMockSphere({ id: 'sphere-2', position: [-1, 2.5, -5], color: '#f59e0b', scale: 0.6 }),
    createMockTorus({ id: 'torus-1', position: [1, 1.8, -3.5], color: '#ef4444' }),
  ];
}

/**
 * Create Newton's Cradle scene - 5 spheres in a row
 */
export function createNewtonsCradleScene(): SceneObject[] {
  return [
    createMockSphere({ id: 'sphere-1', position: [-2, 2, -4], color: '#ef4444' }),
    createMockSphere({ id: 'sphere-2', position: [-1, 2, -4], color: '#f59e0b' }),
    createMockSphere({ id: 'sphere-3', position: [0, 2, -4], color: '#10b981' }),
    createMockSphere({ id: 'sphere-4', position: [1, 2, -4], color: '#3b82f6' }),
    createMockSphere({ id: 'sphere-5', position: [2, 2, -4], color: '#8b5cf6' }),
  ];
}

/**
 * Create Stack Tower scene - boxes stacked vertically
 */
export function createStackTowerScene(): SceneObject[] {
  return [
    createMockBox({ id: 'box-1', position: [0, 0.5, -4], color: '#ef4444', scale: 1.2 }),
    createMockBox({ id: 'box-2', position: [0, 1.5, -4], color: '#f59e0b', scale: 1.0 }),
    createMockBox({ id: 'box-3', position: [0, 2.5, -4], color: '#10b981', scale: 0.9 }),
    createMockBox({ id: 'box-4', position: [0, 3.4, -4], color: '#3b82f6', scale: 0.8 }),
    createMockBox({ id: 'box-5', position: [0, 4.2, -4], color: '#8b5cf6', scale: 0.7 }),
  ];
}

/**
 * Create Marble Run scene - angled planes and spheres
 */
export function createMarbleRunScene(): SceneObject[] {
  return [
    // Ramps (boxes rotated to create slopes)
    createMockBox({
      id: 'ramp-1',
      position: [-1.5, 2.5, -4],
      rotation: [0, 0, -0.3],
      scale: 1.5,
      color: '#6366f1',
    }),
    createMockBox({
      id: 'ramp-2',
      position: [0, 1.5, -4],
      rotation: [0, 0, 0.3],
      scale: 1.5,
      color: '#6366f1',
    }),
    createMockBox({
      id: 'ramp-3',
      position: [1.5, 0.5, -4],
      rotation: [0, 0, -0.3],
      scale: 1.5,
      color: '#6366f1',
    }),
    // Marbles
    createMockSphere({ id: 'marble-1', position: [-2, 3.5, -4], color: '#f59e0b', scale: 0.4 }),
    createMockSphere({ id: 'marble-2', position: [-1.8, 3.3, -4], color: '#10b981', scale: 0.4 }),
  ];
}

/**
 * Create an empty scene
 */
export function createEmptyScene(): SceneObject[] {
  return [];
}

/**
 * Create a scene with many objects (stress test)
 */
export function createLargeScene(count: number = 50): SceneObject[] {
  const objects: SceneObject[] = [];
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
  const types: Array<'box' | 'sphere' | 'torus'> = ['box', 'sphere', 'torus'];

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const color = colors[i % colors.length];
    const x = ((i % 10) - 5) * 0.8;
    const y = Math.floor(i / 10) * 0.8 + 1;
    const z = -4 - (i % 5) * 0.5;

    objects.push({
      id: `object-${i}`,
      type,
      position: [x, y, z],
      rotation: [0, 0, 0],
      scale: 0.5 + Math.random() * 0.5,
      color,
    });
  }

  return objects;
}
