import { Canvas } from '@react-three/fiber';
import { Scene3D } from './Scene3D';

export function HandTrackingCanvas() {
  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{
          position: [0, 2, 5],
          fov: 75,
        }}
        shadows
      >
        <Scene3D />
      </Canvas>
    </div>
  );
}
