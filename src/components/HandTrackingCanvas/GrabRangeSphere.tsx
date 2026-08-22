// @ts-nocheck
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSceneStore } from '@/stores/sceneStore';
import { useSettingsStore } from '@/stores/settingsStore';
import * as THREE from 'three';

interface GrabRangeSphereProps {
  position: THREE.Vector3;
  handId: string;
}

export function GrabRangeSphere({ position, handId }: GrabRangeSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const grabRange = useSettingsStore((state) => state.grabRange);
  const grabbedObjects = useSceneStore((state) => state.grabbedObjects);
  const getNearObjects = useSceneStore((state) => state.getNearObjects);

  // Determine sphere state based on proximity and grab status
  const sphereState = useMemo(() => {
    const isGrabbing = grabbedObjects.has(handId);
    if (isGrabbing) {
      return { color: '#f97316', opacity: 0.2, scale: 1.0 }; // Orange - grabbed
    }

    const nearObjects = getNearObjects(position, grabRange);
    if (nearObjects.length > 0) {
      return { color: '#10b981', opacity: 0.15, scale: 1.05 }; // Green - grabbable
    }

    return { color: '#3b82f6', opacity: 0.08, scale: 1.0 }; // Blue - no objects
  }, [position, grabRange, grabbedObjects, handId, getNearObjects]);

  // Pulsing animation for grabbable state
  useFrame(({ clock }) => {
    if (meshRef.current && sphereState.color === '#10b981') {
      const pulseScale = 1.0 + Math.sin(clock.getElapsedTime() * 3) * 0.05;
      meshRef.current.scale.setScalar(grabRange * pulseScale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(grabRange * sphereState.scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[grabRange, 32, 32]} />
      <meshBasicMaterial
        color={sphereState.color}
        transparent
        opacity={sphereState.opacity}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
