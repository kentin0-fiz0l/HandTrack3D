import { Canvas } from '@react-three/fiber';
import { Scene3D } from './Scene3D';

export function HandTrackingCanvas() {
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
        <Scene3D />
      </Canvas>
    </div>
  );
}
