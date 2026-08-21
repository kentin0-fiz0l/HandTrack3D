import * as THREE from 'three';
import { mapHandTo3D } from '@handtrack3d/core';
import type { Hand } from '@handtrack3d/core';

export interface HandSkeleton3DOptions {
  jointSize?: number;
  boneThickness?: number;
  opacity?: number;
  colorScheme?: 'rainbow' | 'monochrome' | 'handedness';
  baseColor?: string;
}

const DEFAULT_OPTIONS: Required<HandSkeleton3DOptions> = {
  jointSize: 0.01,
  boneThickness: 0.005,
  opacity: 0.8,
  colorScheme: 'rainbow',
  baseColor: '#3b82f6',
};

// MediaPipe hand landmark connections
const HAND_CONNECTIONS = [
  // Wrist to palm base
  [0, 1], [0, 5], [0, 9], [0, 13], [0, 17],
  // Thumb
  [1, 2], [2, 3], [3, 4],
  // Index finger
  [5, 6], [6, 7], [7, 8],
  // Middle finger
  [9, 10], [10, 11], [11, 12],
  // Ring finger
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [17, 18], [18, 19], [19, 20],
  // Palm connections
  [5, 9], [9, 13], [13, 17],
];

// Color-coded joints by finger (rainbow scheme)
const JOINT_COLORS_RAINBOW = {
  wrist: '#ffffff',    // White for wrist (0)
  thumb: '#ef4444',    // Red for thumb (1-4)
  index: '#3b82f6',    // Blue for index (5-8)
  middle: '#10b981',   // Green for middle (9-12)
  ring: '#f59e0b',     // Yellow/orange for ring (13-16)
  pinky: '#a855f7',    // Purple for pinky (17-20)
};

function getJointColor(
  landmarkIndex: number,
  colorScheme: 'rainbow' | 'monochrome' | 'handedness',
  handedness: 'Left' | 'Right',
  baseColor: string
): string {
  if (colorScheme === 'monochrome') {
    return baseColor;
  }

  if (colorScheme === 'handedness') {
    return handedness === 'Left' ? '#10b981' : '#3b82f6';
  }

  // Rainbow scheme
  if (landmarkIndex === 0) return JOINT_COLORS_RAINBOW.wrist;
  if (landmarkIndex >= 1 && landmarkIndex <= 4) return JOINT_COLORS_RAINBOW.thumb;
  if (landmarkIndex >= 5 && landmarkIndex <= 8) return JOINT_COLORS_RAINBOW.index;
  if (landmarkIndex >= 9 && landmarkIndex <= 12) return JOINT_COLORS_RAINBOW.middle;
  if (landmarkIndex >= 13 && landmarkIndex <= 16) return JOINT_COLORS_RAINBOW.ring;
  if (landmarkIndex >= 17 && landmarkIndex <= 20) return JOINT_COLORS_RAINBOW.pinky;
  return '#ffffff';
}

/**
 * Pure Three.js hand skeleton visualization
 *
 * Visualizes all 21 MediaPipe hand landmarks as spheres
 * with connections between them as cylinders.
 *
 * @example
 * ```ts
 * const skeleton = new HandSkeleton3D({ colorScheme: 'rainbow' });
 * scene.add(skeleton.group);
 *
 * // Update on every frame
 * skeleton.update(hand);
 *
 * // Toggle visibility
 * skeleton.setVisible(false);
 *
 * // Cleanup
 * skeleton.dispose();
 * ```
 */
export class HandSkeleton3D {
  public readonly group: THREE.Group;
  private joints: THREE.Mesh[] = [];
  private bones: THREE.Mesh[] = [];
  private options: Required<HandSkeleton3DOptions>;

  // Geometry pools (reused for performance)
  private jointGeometry: THREE.SphereGeometry;
  private boneGeometry: THREE.CylinderGeometry;

  constructor(options: HandSkeleton3DOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.group = new THREE.Group();

    // Create reusable geometries
    this.jointGeometry = new THREE.SphereGeometry(this.options.jointSize, 8, 8);
    this.boneGeometry = new THREE.CylinderGeometry(
      this.options.boneThickness,
      this.options.boneThickness,
      1,
      6
    );

    // Create 21 joint meshes
    for (let i = 0; i < 21; i++) {
      const material = new THREE.MeshStandardMaterial({
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: this.options.opacity,
      });
      const mesh = new THREE.Mesh(this.jointGeometry, material);
      this.joints.push(mesh);
      this.group.add(mesh);
    }

    // Create bone meshes for connections
    for (let i = 0; i < HAND_CONNECTIONS.length; i++) {
      const material = new THREE.MeshStandardMaterial({
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: this.options.opacity,
      });
      const mesh = new THREE.Mesh(this.boneGeometry, material);
      this.bones.push(mesh);
      this.group.add(mesh);
    }
  }

  /**
   * Update skeleton based on hand data
   *
   * @param hand - Hand tracking data
   */
  update(hand: Hand): void {
    // Update joint positions and colors
    hand.landmarks.forEach((landmark, index) => {
      const position3D = mapHandTo3D(landmark);
      const joint = this.joints[index];

      if (joint) {
        joint.position.set(position3D.x, position3D.y, position3D.z);

        // Update color
        const color = getJointColor(
          index,
          this.options.colorScheme,
          hand.handedness,
          this.options.baseColor
        );
        const material = joint.material as THREE.MeshStandardMaterial;
        material.color.set(color);
        material.emissive.set(color);
      }
    });

    // Update bone positions and orientations
    HAND_CONNECTIONS.forEach(([startIdx, endIdx], index) => {
      if (startIdx === undefined || endIdx === undefined) return;

      const startLandmark = hand.landmarks[startIdx];
      const endLandmark = hand.landmarks[endIdx];

      if (!startLandmark || !endLandmark) return;

      const start3D = mapHandTo3D(startLandmark);
      const end3D = mapHandTo3D(endLandmark);

      const startVec = new THREE.Vector3(start3D.x, start3D.y, start3D.z);
      const endVec = new THREE.Vector3(end3D.x, end3D.y, end3D.z);

      const direction = new THREE.Vector3().subVectors(endVec, startVec);
      const length = direction.length();
      const midpoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

      const bone = this.bones[index];
      if (bone) {
        bone.position.copy(midpoint);
        bone.scale.y = length;

        // Align bone with direction
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.normalize()
        );
        bone.quaternion.copy(quaternion);

        // Update color
        const color = getJointColor(
          startIdx,
          this.options.colorScheme,
          hand.handedness,
          this.options.baseColor
        );
        const material = bone.material as THREE.MeshStandardMaterial;
        material.color.set(color);
        material.emissive.set(color);
      }
    });
  }

  /**
   * Toggle skeleton visibility
   */
  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  /**
   * Update color scheme
   */
  setColorScheme(colorScheme: 'rainbow' | 'monochrome' | 'handedness'): void {
    this.options.colorScheme = colorScheme;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.jointGeometry.dispose();
    this.boneGeometry.dispose();

    this.joints.forEach(joint => {
      (joint.material as THREE.Material).dispose();
    });

    this.bones.forEach(bone => {
      (bone.material as THREE.Material).dispose();
    });
  }
}
