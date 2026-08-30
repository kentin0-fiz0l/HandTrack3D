import * as THREE from 'three';

/**
 * DOM and coordinate projection utilities for UI elements
 */

export interface ScreenCoordinates {
  x: number;
  y: number;
}

/**
 * Project a 3D world position to 2D screen coordinates
 * @param position 3D position in world space
 * @param camera Three.js camera
 * @param canvasWidth Canvas width in pixels
 * @param canvasHeight Canvas height in pixels
 * @returns Screen coordinates { x, y } in pixels from top-left
 */
export function project3DToScreen(
  position: THREE.Vector3 | [number, number, number],
  camera: THREE.Camera,
  canvasWidth: number,
  canvasHeight: number
): ScreenCoordinates {
  // Convert to Vector3 if array
  const pos = Array.isArray(position)
    ? new THREE.Vector3(...position)
    : position.clone();

  // Project to normalized device coordinates (-1 to +1)
  const projected = pos.project(camera);

  // Convert to screen coordinates (0 to width/height)
  const x = (projected.x * 0.5 + 0.5) * canvasWidth;
  const y = (-(projected.y * 0.5) + 0.5) * canvasHeight;

  return { x, y };
}

/**
 * Get the bounding box of a DOM element
 * @param selector CSS selector for the element
 * @returns DOMRect or null if element not found
 */
export function getElementBoundingBox(selector: string): DOMRect | null {
  const element = document.querySelector(selector);
  if (!element) {
    return null;
  }
  return element.getBoundingClientRect();
}

/**
 * Get the center point of a DOM element
 * @param selector CSS selector for the element
 * @returns Screen coordinates { x, y } or null if element not found
 */
export function getElementCenter(selector: string): ScreenCoordinates | null {
  const rect = getElementBoundingBox(selector);
  if (!rect) {
    return null;
  }
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

/**
 * Get screen coordinates for a spotlight target
 * Supports:
 * - 'nearest-object': Finds the nearest object to any hand cursor
 * - 'grabbed-object': Finds the currently grabbed object
 * - CSS selector: Finds a DOM element by selector
 *
 * @param target Target specifier
 * @param camera Three.js camera (required for 3D targets)
 * @param canvasWidth Canvas width (required for 3D targets)
 * @param canvasHeight Canvas height (required for 3D targets)
 * @param getObjectPosition Function to get 3D position of an object by ID
 * @param getNearestObjectId Function to get the nearest object ID
 * @param getGrabbedObjectId Function to get the grabbed object ID
 * @returns Screen coordinates { x, y } or null if target not found
 */
export function getSpotlightTargetPosition(
  target: string,
  camera?: THREE.Camera,
  canvasWidth?: number,
  canvasHeight?: number,
  getObjectPosition?: (id: string) => [number, number, number] | null,
  getNearestObjectId?: () => string | null,
  getGrabbedObjectId?: () => string | null
): ScreenCoordinates | null {
  // Handle special target types
  if (target === 'nearest-object') {
    if (!getNearestObjectId || !getObjectPosition || !camera || !canvasWidth || !canvasHeight) {
      console.warn('Missing dependencies for nearest-object target');
      return null;
    }

    const objectId = getNearestObjectId();
    if (!objectId) {
      return null;
    }

    const position = getObjectPosition(objectId);
    if (!position) {
      return null;
    }

    return project3DToScreen(position, camera, canvasWidth, canvasHeight);
  }

  if (target === 'grabbed-object') {
    if (!getGrabbedObjectId || !getObjectPosition || !camera || !canvasWidth || !canvasHeight) {
      console.warn('Missing dependencies for grabbed-object target');
      return null;
    }

    const objectId = getGrabbedObjectId();
    if (!objectId) {
      return null;
    }

    const position = getObjectPosition(objectId);
    if (!position) {
      return null;
    }

    return project3DToScreen(position, camera, canvasWidth, canvasHeight);
  }

  // Handle CSS selector (DOM element)
  return getElementCenter(target);
}

/**
 * Format screen coordinates as a CSS radial gradient position
 * @param coords Screen coordinates { x, y }
 * @param totalWidth Total width of the container
 * @param totalHeight Total height of the container
 * @returns CSS position string like "50% 50%" or "200px 150px"
 */
export function formatGradientPosition(
  coords: ScreenCoordinates,
  totalWidth: number,
  totalHeight: number
): string {
  // Convert to percentage for better responsiveness
  const xPercent = (coords.x / totalWidth) * 100;
  const yPercent = (coords.y / totalHeight) * 100;

  return `${xPercent}% ${yPercent}%`;
}
