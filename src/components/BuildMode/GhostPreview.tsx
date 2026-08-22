import { useSceneStore } from '@/stores/sceneStore';

export function GhostPreview() {
  const ghostPreview = useSceneStore((state) => state.ghostPreview);

  if (!ghostPreview) return null;

  const { type, position, scale, color } = ghostPreview;

  // Common material props for ghost preview
  const materialProps = {
    color,
    transparent: true,
    opacity: 0.4,
    wireframe: false,
  };

  // Render the appropriate geometry based on type
  const renderGeometry = () => {
    switch (type) {
      case 'box':
        return (
          <mesh position={position}>
            <boxGeometry args={[scale, scale, scale]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        );
      case 'sphere':
        return (
          <mesh position={position}>
            <sphereGeometry args={[scale / 2, 32, 32]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        );
      case 'torus':
        return (
          <mesh position={position}>
            <torusGeometry args={[scale / 2, scale / 4, 16, 100]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        );
      case 'cylinder':
        return (
          <mesh position={position}>
            <cylinderGeometry args={[scale / 2, scale / 2, scale, 32]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        );
      case 'cone':
        return (
          <mesh position={position}>
            <coneGeometry args={[scale / 2, scale, 32]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        );
      case 'capsule':
        return (
          <mesh position={position}>
            <capsuleGeometry args={[scale / 2, scale, 4, 8]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        );
      default:
        return null;
    }
  };

  return <>{renderGeometry()}</>;
}
