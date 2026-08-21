import * as THREE from 'three';
import { mapHandTo3D, getIndexFingerTip } from '@handtrack3d/core';
import type { Hand } from '@handtrack3d/core';

export interface HandCursor3DOptions {
  color?: string;
  emissiveIntensity?: number;
  scale?: number;
  opacity?: number;
  showGlow?: boolean;
}

const DEFAULT_OPTIONS: Required<HandCursor3DOptions> = {
  color: '#3b82f6',
  emissiveIntensity: 0.5,
  scale: 0.15,
  opacity: 0.8,
  showGlow: true,
};

/**
 * Pure Three.js hand cursor visualization
 *
 * Creates a 3D sphere that follows the hand position in space.
 * Can be added to any THREE.Scene for hand visualization.
 *
 * @example
 * ```ts
 * const cursor = new HandCursor3D({ color: '#10b981' });
 * scene.add(cursor.mesh);
 *
 * // Update on every frame
 * cursor.update(hand);
 *
 * // Cleanup
 * cursor.dispose();
 * ```
 */
export class HandCursor3D {
  public readonly mesh: THREE.Group;
  private sphere: THREE.Mesh;
  private pointLight?: THREE.PointLight;
  private targetPosition: THREE.Vector3;
  private options: Required<HandCursor3DOptions>;

  constructor(options: HandCursor3DOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.targetPosition = new THREE.Vector3();
    this.mesh = new THREE.Group();

    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: this.options.color,
      emissive: this.options.color,
      emissiveIntensity: this.options.emissiveIntensity,
      transparent: true,
      opacity: this.options.opacity,
    });

    this.sphere = new THREE.Mesh(geometry, material);
    this.sphere.scale.setScalar(this.options.scale);
    this.mesh.add(this.sphere);

    // Add glow effect
    if (this.options.showGlow) {
      this.pointLight = new THREE.PointLight(
        this.options.color,
        this.options.emissiveIntensity * 2,
        2
      );
      this.mesh.add(this.pointLight);
    }
  }

  /**
   * Update cursor position based on hand data
   *
   * @param hand - Hand tracking data
   * @param lerpFactor - Smooth interpolation factor (0-1). Default: 0.3
   */
  update(hand: Hand, lerpFactor = 0.3): void {
    // Use index finger tip for cursor position
    const indexTip = getIndexFingerTip(hand.landmarks);
    const position3D = mapHandTo3D(indexTip);

    this.targetPosition.set(position3D.x, position3D.y, position3D.z);
    this.mesh.position.lerp(this.targetPosition, lerpFactor);
  }

  /**
   * Update cursor visual properties based on gesture or state
   *
   * @param color - New color
   * @param scale - New scale
   * @param emissiveIntensity - New emissive intensity
   */
  setVisualState(
    color?: string,
    scale?: number,
    emissiveIntensity?: number
  ): void {
    const material = this.sphere.material as THREE.MeshStandardMaterial;

    if (color !== undefined) {
      material.color.set(color);
      material.emissive.set(color);
      if (this.pointLight) {
        this.pointLight.color.set(color);
      }
    }

    if (scale !== undefined) {
      this.sphere.scale.setScalar(scale);
    }

    if (emissiveIntensity !== undefined) {
      material.emissiveIntensity = emissiveIntensity;
      if (this.pointLight) {
        this.pointLight.intensity = emissiveIntensity * 2;
      }
    }
  }

  /**
   * Get current cursor position in world space
   */
  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    const geometry = this.sphere.geometry;
    const material = this.sphere.material as THREE.MeshStandardMaterial;

    geometry.dispose();
    material.dispose();

    if (this.pointLight) {
      this.mesh.remove(this.pointLight);
    }
  }
}
