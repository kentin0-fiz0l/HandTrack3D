import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { usePositioningStore } from '@/stores/positioningStore';
import { useSensorFusion } from '@/hooks/useSensorFusion';

/**
 * Room origin marker showing 3D coordinate system
 *
 * Displays:
 * - Red arrow: +X axis (right)
 * - Green arrow: +Y axis (up)
 * - Blue arrow: +Z axis (forward)
 * - Labels for each axis
 *
 * Visible when:
 * - Positioning is enabled
 * - Fusion mode is active
 * - Camera pose is available
 */
export function RoomOriginMarker() {
  const { enablePositioning, positioningMode, roomPosition } = usePositioningStore();
  const { isFusionActive } = useSensorFusion();
  const groupRef = useRef<THREE.Group>(null);

  // Don't render if positioning disabled or not in fusion mode
  if (!enablePositioning || positioningMode !== 'fusion' || !roomPosition) {
    return null;
  }

  // Axis length
  const axisLength = 0.5; // 50cm arrows

  // Pulse animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 2) * 0.1;
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* X Axis (Red) */}
      <Line
        points={[
          [0, 0, 0],
          [axisLength, 0, 0],
        ]}
        color="red"
        lineWidth={3}
      />
      <mesh position={[axisLength + 0.1, 0, 0]}>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <Text
        position={[axisLength + 0.3, 0, 0]}
        fontSize={0.1}
        color="red"
        anchorX="left"
        anchorY="middle"
      >
        +X
      </Text>

      {/* Y Axis (Green) */}
      <Line
        points={[
          [0, 0, 0],
          [0, axisLength, 0],
        ]}
        color="green"
        lineWidth={3}
      />
      <mesh position={[0, axisLength + 0.1, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <Text
        position={[0, axisLength + 0.3, 0]}
        fontSize={0.1}
        color="green"
        anchorX="center"
        anchorY="bottom"
      >
        +Y
      </Text>

      {/* Z Axis (Blue) */}
      <Line
        points={[
          [0, 0, 0],
          [0, 0, axisLength],
        ]}
        color="blue"
        lineWidth={3}
      />
      <mesh position={[0, 0, axisLength + 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <Text
        position={[0, 0, axisLength + 0.3]}
        fontSize={0.1}
        color="blue"
        anchorX="left"
        anchorY="middle"
      >
        +Z
      </Text>

      {/* Origin marker (small sphere) */}
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
      </mesh>

      {/* Grid plane (XZ plane at Y=0) */}
      <gridHelper args={[5, 10, 0x444444, 0x222222]} position={[0, 0.01, 0]} />

      {/* Label */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.08}
        color="white"
        anchorX="center"
        anchorY="top"
      >
        Room Origin
      </Text>
    </group>
  );
}
