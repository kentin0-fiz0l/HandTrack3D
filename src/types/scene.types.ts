export interface SceneObject {
  id: string;
  type: 'box' | 'sphere' | 'torus';
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
