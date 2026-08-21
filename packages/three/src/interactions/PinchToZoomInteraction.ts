import * as THREE from 'three';
import { detectPinch, getIndexFingerTip, getThumbTip, distance3D } from '@handtrack3d/core';
import type { Hand } from '@handtrack3d/core';

export interface PinchToZoomInteractionOptions {
  minZoom?: number;
  maxZoom?: number;
  zoomSpeed?: number;
  smoothing?: number;
}

const DEFAULT_OPTIONS: Required<PinchToZoomInteractionOptions> = {
  minZoom: 0.5,
  maxZoom: 5.0,
  zoomSpeed: 5.0,
  smoothing: 0.15,
};

/**
 * Pinch-to-zoom interaction for camera control
 *
 * Detects pinch gestures and adjusts camera zoom/position based on
 * the distance between thumb and index finger.
 *
 * @example
 * ```ts
 * const zoomInteraction = new PinchToZoomInteraction();
 *
 * // Update on every frame
 * zoomInteraction.update(hand, camera);
 * ```
 */
export class PinchToZoomInteraction {
  private options: Required<PinchToZoomInteractionOptions>;
  private initialPinchDistance: number = 0;
  private initialZoom: number = 1;
  private isPinching: boolean = false;
  private targetZoom: number = 1;

  constructor(options: PinchToZoomInteractionOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Update interaction based on hand data
   *
   * @param hand - Hand tracking data
   * @param camera - Camera to control (PerspectiveCamera or OrthographicCamera)
   */
  update(hand: Hand, camera: THREE.PerspectiveCamera | THREE.OrthographicCamera): void {
    const isPinching = detectPinch(hand.landmarks);

    // Get pinch distance
    const indexTip = getIndexFingerTip(hand.landmarks);
    const thumbTip = getThumbTip(hand.landmarks);
    const currentDistance = distance3D(indexTip, thumbTip);

    // Start pinch
    if (isPinching && !this.isPinching) {
      this.isPinching = true;
      this.initialPinchDistance = currentDistance;
      this.initialZoom = this.getCurrentZoom(camera);
    }

    // Update zoom while pinching
    if (isPinching && this.isPinching) {
      const distanceRatio = currentDistance / this.initialPinchDistance;
      const zoomChange = (distanceRatio - 1) * this.options.zoomSpeed;
      this.targetZoom = THREE.MathUtils.clamp(
        this.initialZoom + zoomChange,
        this.options.minZoom,
        this.options.maxZoom
      );
    }

    // End pinch
    if (!isPinching && this.isPinching) {
      this.isPinching = false;
    }

    // Apply zoom with smoothing
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.zoom = THREE.MathUtils.lerp(camera.zoom, this.targetZoom, this.options.smoothing);
      camera.updateProjectionMatrix();
    } else if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = THREE.MathUtils.lerp(camera.zoom, this.targetZoom, this.options.smoothing);
      camera.updateProjectionMatrix();
    }
  }

  /**
   * Get current zoom level
   */
  private getCurrentZoom(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera): number {
    return camera.zoom;
  }

  /**
   * Reset zoom to default
   */
  resetZoom(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera): void {
    this.targetZoom = 1;
    camera.zoom = 1;
    camera.updateProjectionMatrix();
  }

  /**
   * Set zoom limits
   */
  setZoomLimits(min: number, max: number): void {
    this.options.minZoom = min;
    this.options.maxZoom = max;
  }

  /**
   * Set zoom speed
   */
  setZoomSpeed(speed: number): void {
    this.options.zoomSpeed = speed;
  }

  /**
   * Check if currently pinching
   */
  getIsPinching(): boolean {
    return this.isPinching;
  }
}
