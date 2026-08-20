// @ts-nocheck
import { OrbitControls, Grid } from '@react-three/drei';
import { useSceneStore } from '@/stores/sceneStore';
import { useHandTo3DMapping, useHandCursorStore } from '@/hooks/useHandTo3DMapping';
import { useGestureRecognition } from '@/hooks/useGestureRecognition';
import { HandMesh } from './HandMesh';
import { InteractiveObject } from './InteractiveObject';

export function Scene3D() {
  const objects = useSceneStore((state) => state.objects);
  const cursors = useHandCursorStore((state) => state.cursors);

  // Map hand positions to 3D space
  useHandTo3DMapping();

  // Detect gestures
  useGestureRecognition();

  return (
    <>
      {/* Camera controls */}
      <OrbitControls makeDefault />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />

      {/* Grid */}
      <Grid
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#3b82f6"
        fadeDistance={20}
        fadeStrength={1}
        position={[0, -1, 0]}
      />

      {/* Interactive scene objects */}
      {objects.map((object) => (
        <InteractiveObject key={object.id} object={object} />
      ))}

      {/* Hand cursors */}
      {cursors.map((cursor) => (
        <HandMesh
          key={cursor.id}
          handId={cursor.id}
          position={cursor.position}
          handedness={cursor.handedness}
        />
      ))}
    </>
  );
}
