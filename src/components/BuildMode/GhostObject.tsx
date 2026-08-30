import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSceneStore } from '@/stores/sceneStore';
import type { Mesh } from 'three';

/**
 * GhostObject Component
 *
 * Renders a semi-transparent preview of the object that will be placed.
 * Features:
 * - Pulsing animation for visibility
 * - Wireframe overlay for better depth perception
 * - Color indication for valid placement
 */
export function GhostObject() {
  const ghostPreview = useSceneStore((state) => state.ghostPreview);
  const meshRef = useRef<Mesh>(null);
  const wireframeRef = useRef<Mesh>(null);

  // Pulsing animation
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.5;
      meshRef.current.material.opacity = pulse;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  if (!ghostPreview) return null;

  const { type, position, scale, color } = ghostPreview;

  // Common material props for ghost preview
  const materialProps = {
    color,
    transparent: true,
    opacity: 0.5,
    wireframe: false,
    emissive: color,
    emissiveIntensity: 0.3,
  };

  const wireframeMaterialProps = {
    color: '#ffffff',
    transparent: true,
    opacity: 0.2,
    wireframe: true,
  };

  // Render the appropriate geometry based on type
  const renderGeometry = () => {
    switch (type) {
      case 'box':
        return (
          <group position={position}>
            <mesh ref={meshRef}>
              <boxGeometry args={[scale, scale, scale]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh ref={wireframeRef}>
              <boxGeometry args={[scale * 1.01, scale * 1.01, scale * 1.01]} />
              <meshBasicMaterial {...wireframeMaterialProps} />
            </mesh>
          </group>
        );
      case 'sphere':
        return (
          <group position={position}>
            <mesh ref={meshRef}>
              <sphereGeometry args={[scale / 2, 32, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh ref={wireframeRef}>
              <sphereGeometry args={[(scale / 2) * 1.01, 16, 16]} />
              <meshBasicMaterial {...wireframeMaterialProps} />
            </mesh>
          </group>
        );
      case 'torus':
        return (
          <group position={position}>
            <mesh ref={meshRef}>
              <torusGeometry args={[scale / 2, scale / 4, 16, 100]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh ref={wireframeRef}>
              <torusGeometry args={[(scale / 2) * 1.01, (scale / 4) * 1.01, 8, 50]} />
              <meshBasicMaterial {...wireframeMaterialProps} />
            </mesh>
          </group>
        );
      case 'cylinder':
        return (
          <group position={position}>
            <mesh ref={meshRef}>
              <cylinderGeometry args={[scale / 2, scale / 2, scale, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh ref={wireframeRef}>
              <cylinderGeometry args={[(scale / 2) * 1.01, (scale / 2) * 1.01, scale * 1.01, 16]} />
              <meshBasicMaterial {...wireframeMaterialProps} />
            </mesh>
          </group>
        );
      case 'cone':
        return (
          <group position={position}>
            <mesh ref={meshRef}>
              <coneGeometry args={[scale / 2, scale, 32]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh ref={wireframeRef}>
              <coneGeometry args={[(scale / 2) * 1.01, scale * 1.01, 16]} />
              <meshBasicMaterial {...wireframeMaterialProps} />
            </mesh>
          </group>
        );
      case 'capsule':
        return (
          <group position={position}>
            <mesh ref={meshRef}>
              <capsuleGeometry args={[scale / 2, scale, 4, 8]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh ref={wireframeRef}>
              <capsuleGeometry args={[(scale / 2) * 1.01, scale * 1.01, 2, 4]} />
              <meshBasicMaterial {...wireframeMaterialProps} />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  };

  return <>{renderGeometry()}</>;
}
