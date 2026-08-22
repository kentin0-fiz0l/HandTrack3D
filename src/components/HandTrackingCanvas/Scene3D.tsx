// @ts-nocheck
import { OrbitControls, Grid } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useSceneStore } from '@/stores/sceneStore';
import { useHandTo3DMapping, useHandCursorStore } from '@/hooks/useHandTo3DMapping';
import { useGestureRecognition } from '@/hooks/useGestureRecognition';
import { useSettingsStore } from '@/stores/settingsStore';
import { useHandTrackingStore } from '@/stores/handTrackingStore';
import { HandMesh } from './HandMesh';
import { HandSkeleton } from '@/components/HandSkeleton/HandSkeleton';
import { InteractiveObject } from './InteractiveObject';
import { PerformanceTracker } from '@/components/PerformanceMonitor/PerformanceTracker';
import { BuildModeController } from '@/components/BuildMode/BuildModeController';
import { GhostPreview } from '@/components/BuildMode/GhostPreview';
import { mapHandTo3D } from '@/utils/coordinateMapping';
import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import type { SceneObject } from '@/types/scene.types';

interface Scene3DProps {
  selectedType?: SceneObject['type'];
  selectedColor?: string;
  selectedSize?: number;
}

export function Scene3D({
  selectedType = 'box',
  selectedColor = '#3b82f6',
  selectedSize = 1.0,
}: Scene3DProps) {
  const objects = useSceneStore((state) => state.objects);
  const cursors = useHandCursorStore((state) => state.cursors);
  const gravityEnabled = useSettingsStore((state) => state.gravityEnabled);
  const buildMode = useSceneStore((state) => state.buildMode);
  const hands = useHandTrackingStore((state) => state.hands);
  const { camera, size } = useThree();

  // Map hand positions to 3D space
  useHandTo3DMapping();

  // Detect gestures
  useGestureRecognition();

  // Map all hand landmarks to 3D space for skeleton visualization
  const handSkeletons = useMemo(() => {
    return hands.map((hand) => ({
      id: hand.id,
      handedness: hand.handedness,
      landmarks: hand.landmarks.map((lm) =>
        mapHandTo3D(lm, camera, size.width, size.height)
      ),
    }));
  }, [hands, camera, size.width, size.height]);

  return (
    <>
      {/* Performance tracking */}
      <PerformanceTracker />

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

      {/* Hand skeletons */}
      {handSkeletons.map((skeleton) => (
        <HandSkeleton
          key={`skeleton-${skeleton.id}`}
          landmarks={skeleton.landmarks}
          handedness={skeleton.handedness}
        />
      ))}

      {/* Build mode controller and ghost preview */}
      {buildMode && (
        <>
          <BuildModeController
            selectedType={selectedType}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
          />
          <GhostPreview />
        </>
      )}
    </>
  );
}
