// @ts-nocheck
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import { useGestureStore } from '@/hooks/useGestureRecognition';
import * as THREE from 'three';
import type { GestureType } from '@/types/gesture.types';

interface HandMeshProps {
  position: THREE.Vector3;
  handedness: 'Left' | 'Right';
  handId: string;
}

export function HandMesh({ position, handedness, handId }: HandMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPosition = useRef(new THREE.Vector3());
  const gestures = useGestureStore((state) => state.gestures);

  // Get current gesture for this hand
  const currentGesture = useMemo(() => {
    const handGesture = gestures.find((g) => g.handId === handId);
    return handGesture?.gesture || 'none';
  }, [gestures, handId]);

  // Visual properties based on gesture
  const { color, scale, emissiveIntensity } = useMemo(() => {
    const baseColor = handedness === 'Left' ? '#10b981' : '#3b82f6';

    switch (currentGesture) {
      case 'pinch':
        return { color: '#f59e0b', scale: 0.1, emissiveIntensity: 1.0 };
      case 'open':
        return { color: baseColor, scale: 0.2, emissiveIntensity: 0.3 };
      case 'fist':
        return { color: '#ef4444', scale: 0.12, emissiveIntensity: 0.8 };
      default:
        return { color: baseColor, scale: 0.15, emissiveIntensity: 0.5 };
    }
  }, [currentGesture, handedness]);

  // Smooth interpolation to target position
  useFrame(() => {
    if (meshRef.current) {
      targetPosition.current.lerp(position, 0.3);
      meshRef.current.position.copy(targetPosition.current);
    }
  });

  return (
    <Trail
      width={0.5}
      length={10}
      color={color}
      attenuation={(t) => t * t}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={0.8}
        />
        {/* Glow effect */}
        <pointLight color={color} intensity={emissiveIntensity * 2} distance={2} />
      </mesh>
    </Trail>
  );
}
