import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

/**
 * Helper to create mock hand landmark data for testing
 */
export function createMockHandLandmarks() {
  // Create 21 landmarks (MediaPipe hand model)
  return Array.from({ length: 21 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    z: Math.random(),
    visibility: 1,
  }));
}

/**
 * Helper to create mock scene object for testing
 */
export function createMockSceneObject(overrides = {}) {
  return {
    id: 'test-object',
    type: 'box' as const,
    position: [0, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: 1,
    color: '#ffffff',
    ...overrides,
  };
}

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
