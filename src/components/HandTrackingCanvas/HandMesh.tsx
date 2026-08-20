// @ts-nocheck
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';

interface HandMeshProps {
  position: THREE.Vector3;
  handedness: 'Left' | 'Right';
}

export function HandMesh({ position, handedness }: HandMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPosition = useRef(new THREE.Vector3());

  // Smooth interpolation to target position
  useFrame(() => {
    if (meshRef.current) {
      targetPosition.current.lerp(position, 0.3);
      meshRef.current.position.copy(targetPosition.current);
    }
  });

  const color = handedness === 'Left' ? '#10b981' : '#3b82f6';

  return (
    <Trail
      width={0.5}
      length={10}
      color={color}
      attenuation={(t) => t * t}
    >
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
        {/* Glow effect */}
        <pointLight color={color} intensity={1} distance={2} />
      </mesh>
    </Trail>
  );
}
