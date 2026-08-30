export interface SceneObject {
  id: string;
  type: 'box' | 'sphere' | 'torus' | 'cylinder' | 'cone' | 'capsule';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
}

export interface GrabbedObject {
  id: string;
  handId: string;
  offset: [number, number, number];
}

export interface ObjectProperties {
  // Physics properties
  mass: number; // 0.1 - 10.0
  restitution: number; // 0.0 - 1.0 (bounciness)
  friction: number; // 0.0 - 1.0
  linearDamping: number; // 0.0 - 2.0
  angularDamping: number; // 0.0 - 2.0
  gravityScale: number; // 0.0 - 2.0 (1.0 = normal gravity)

  // Visual properties
  color: string;
  emissiveIntensity: number; // 0.0 - 1.0
  metalness: number; // 0.0 - 1.0
  roughness: number; // 0.0 - 1.0

  // Interaction properties
  locked: boolean; // Cannot be grabbed when true
  visible: boolean;
  isStatic?: boolean; // Object is fixed in space (immune to physics)
}
