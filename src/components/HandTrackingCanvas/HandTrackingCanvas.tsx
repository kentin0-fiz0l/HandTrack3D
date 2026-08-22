import { Canvas } from '@react-three/fiber';
import { Scene3D } from './Scene3D';
import type { SceneObject } from '@/types/scene.types';

interface HandTrackingCanvasProps {
  selectedType?: SceneObject['type'];
  selectedColor?: string;
  selectedSize?: number;
}

export function HandTrackingCanvas({
  selectedType,
  selectedColor,
  selectedSize,
}: HandTrackingCanvasProps) {
  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{
          position: [0, 1.6, 0], // Eye level height, first-person position
          fov: 75,
          rotation: [0, 0, 0], // Looking straight ahead
        }}
        shadows
      >
        <Scene3D
          selectedType={selectedType}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
        />
      </Canvas>
    </div>
  );
}
