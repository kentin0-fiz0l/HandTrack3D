// @ts-nocheck
import { OrbitControls, Grid } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useSceneStore } from '@/stores/sceneStore';
import { useHandTo3DMapping, useHandCursorStore } from '@/hooks/useHandTo3DMapping';
import { useGestureRecognition } from '@/hooks/useGestureRecognition';
import { useSettingsStore } from '@/stores/settingsStore';
import { HandMesh } from './HandMesh';
import { InteractiveObject } from './InteractiveObject';

export function Scene3D() {
  const objects = useSceneStore((state) => state.objects);
  const cursors = useHandCursorStore((state) => state.cursors);
  const gravityEnabled = useSettingsStore((state) => state.gravityEnabled);

  // Map hand positions to 3D space
  useHandTo3DMapping();

  // Detect gestures
  useGestureRecognition();

  return (
    <>
      {/* Camera controls - disabled rotation for first-person view */}
      <OrbitControls
        makeDefault
        enableRotate={false}
        enablePan={false}
        target={[0, 1.6, -5]} // Look forward
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />

      {/* Grid - ground plane at foot level */}
      <Grid
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#3b82f6"
        fadeDistance={25}
        fadeStrength={1}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]} // Horizontal ground
      />

      {/* Physics simulation */}
      <Physics gravity={gravityEnabled ? [0, -9.81, 0] : [0, 0, 0]}>
        {/* Ground plane collider */}
        <RigidBody type="fixed" position={[0, 0, 0]}>
          <CuboidCollider args={[50, 0.1, 50]} />
        </RigidBody>

        {/* Interactive scene objects */}
        {objects.map((object) => (
          <InteractiveObject key={object.id} object={object} />
        ))}
      </Physics>

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
