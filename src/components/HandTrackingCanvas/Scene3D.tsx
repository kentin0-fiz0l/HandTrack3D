// @ts-nocheck
import { OrbitControls, Grid } from '@react-three/drei';
import { useSceneStore } from '@/stores/sceneStore';
import { useHandTo3DMapping, useHandCursorStore } from '@/hooks/useHandTo3DMapping';
import { HandMesh } from './HandMesh';
import type { SceneObject } from '@/types/scene.types';

function SceneObjectRenderer({ object }: { object: SceneObject }) {
  const { type, position, rotation, scale, color } = object;

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      {type === 'box' && <boxGeometry args={[1, 1, 1]} />}
      {type === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
      {type === 'torus' && <torusGeometry args={[0.5, 0.2, 16, 32]} />}
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function Scene3D() {
  const objects = useSceneStore((state) => state.objects);
  const cursors = useHandCursorStore((state) => state.cursors);

  // Map hand positions to 3D space
  useHandTo3DMapping();

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

      {/* Scene objects */}
      {objects.map((object) => (
        <SceneObjectRenderer key={object.id} object={object} />
      ))}

      {/* Hand cursors */}
      {cursors.map((cursor) => (
        <HandMesh
          key={cursor.id}
          position={cursor.position}
          handedness={cursor.handedness}
        />
      ))}
    </>
  );
}
