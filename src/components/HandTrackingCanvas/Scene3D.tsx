// @ts-nocheck
import { OrbitControls, Grid } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useSceneStore } from '@/stores/sceneStore';
import { useBuildModeStore } from '@/stores/buildModeStore';
import { useHandTo3DMapping, useHandCursorStore } from '@/hooks/useHandTo3DMapping';
import { useGestureRecognition, useGestureStore } from '@/hooks/useGestureRecognition';
import { useSettingsStore } from '@/stores/settingsStore';
import { useHandTrackingStore } from '@/stores/handTrackingStore';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useHintsStore } from '@/stores/hintsStore';
import { HandMesh } from './HandMesh';
import { HandSkeleton } from '@/components/HandSkeleton/HandSkeleton';
import { InteractiveObject } from './InteractiveObject';
import { PerformanceTracker } from '@/components/PerformanceMonitor/PerformanceTracker';
import { BuildModeController } from '@/components/BuildMode/BuildModeController';
import { GhostObject } from '@/components/BuildMode/GhostObject';
import { SpotlightTracker } from '@/components/Tutorial/SpotlightTracker';
import { mapHandTo3D } from '@/utils/coordinateMapping';
import { useThree } from '@react-three/fiber';
import { useMemo, useEffect, useRef, useCallback, Profiler } from 'react';
import { shallow } from 'zustand/shallow';
import type { SceneObject } from '@/types/scene.types';

// Performance measurement callback for React Profiler
const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  if (phase === 'update' && actualDuration > 16) {
    // Log only updates that take longer than one frame (16ms at 60fps)
    console.log(`[Scene3D Profiler] ${phase}: ${actualDuration.toFixed(2)}ms`);
  }
};

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
  // Optimized store subscriptions with selectors and shallow equality
  const { objects, grabbedObjects } = useSceneStore(
    (state) => ({
      objects: state.objects,
      grabbedObjects: state.grabbedObjects,
    }),
    shallow
  );

  const buildMode = useBuildModeStore((state) => state.enabled);

  const cursors = useHandCursorStore((state) => state.cursors);
  const gravityEnabled = useSettingsStore((state) => state.gravityEnabled);
  const hands = useHandTrackingStore((state) => state.hands);
  const gestures = useGestureStore((state) => state.gestures);
  const grabRange = useSettingsStore((state) => state.grabRange);

  // Action subscriptions (functions don't need reactive subscriptions)
  const updateTutorialState = useTutorialStore((state) => state.updateTutorialState);
  const incrementGestureCount = useHintsStore((state) => state.incrementGestureCount);
  const incrementCameraRotations = useHintsStore((state) => state.incrementCameraRotations);

  const { camera, size } = useThree();

  // Track previous gestures to detect changes
  const prevGesturesRef = useRef<Map<string, string>>(new Map());

  // Get getNearObjects function using getState() to avoid subscription
  const getNearObjects = useCallback(() => {
    return useSceneStore.getState().getNearObjects;
  }, []);

  // Development: Track render count
  const renderCountRef = useRef(0);
  useEffect(() => {
    renderCountRef.current += 1;
    if (renderCountRef.current % 10 === 0) {
      console.log(`[Scene3D] Rendered ${renderCountRef.current} times`);
    }
  });

  // Map hand positions to 3D space
  useHandTo3DMapping();

  // Detect gestures
  useGestureRecognition();

  // Tutorial state tracking
  useEffect(() => {
    // Track hand detection
    updateTutorialState({ handDetected: cursors.length > 0 });
  }, [cursors.length, updateTutorialState]);

  useEffect(() => {
    // Track gesture detection for tutorial
    const currentGesture = gestures[0]?.gesture || null;
    updateTutorialState({ gestureDetected: currentGesture });

    // Track gesture counts for hints (only on gesture change)
    gestures.forEach((gesture) => {
      const prevGesture = prevGesturesRef.current.get(gesture.handId);

      // Increment count when:
      // 1. Transitioning from 'none' to a gesture
      // 2. Transitioning from one gesture to a different gesture
      if (gesture.gesture !== 'none' && gesture.gesture !== prevGesture) {
        incrementGestureCount(gesture.gesture);
      }

      prevGesturesRef.current.set(gesture.handId, gesture.gesture);
    });
  }, [gestures, updateTutorialState, incrementGestureCount]);

  useEffect(() => {
    // Track near object and grabbed object
    if (cursors.length > 0) {
      const nearObjects = getNearObjects()(cursors[0].position, grabRange);
      const isGrabbing = grabbedObjects.size > 0;
      updateTutorialState({
        nearObject: nearObjects.length > 0,
        objectGrabbed: isGrabbing,
      });
    } else {
      updateTutorialState({
        nearObject: false,
        objectGrabbed: false,
      });
    }
  }, [cursors, grabbedObjects, getNearObjects, grabRange, updateTutorialState]);

  // Map all hand landmarks to 3D space for skeleton visualization
  const handSkeletons = useMemo(() => {
    return hands.map((hand) => ({
      id: hand.id,
      handedness: hand.handedness,
      landmarks: hand.landmarks.map((lm) =>
        mapHandTo3D(
          lm,
          hand.landmarks,   // All landmarks for hand size calculation
          hand.id,          // Hand ID for smoothing
          hand.handedness,  // Handedness for arm extension from pose
          camera,
          size.width,
          size.height
        )
      ),
    }));
  }, [hands, camera, size.width, size.height]);

  return (
    <Profiler id="Scene3D" onRender={onRenderCallback}>
      {/* Spotlight tracker - updates global camera/canvas reference for tutorial spotlight */}
      <SpotlightTracker />

      {/* Performance tracking */}
      <PerformanceTracker />

      {/* Camera controls */}
      <OrbitControls
        makeDefault
        enableRotate={true}
        enablePan={true}
        target={[0, 1.6, -5]} // Look forward
        onChange={() => incrementCameraRotations()}
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
          <GhostObject />
        </>
      )}
    </Profiler>
  );
}
