import { useMemo } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import type { HandLandmarks } from '@/types/hand.types';
import * as THREE from 'three';

interface HandSkeletonProps {
  landmarks: HandLandmarks;
  handedness: 'Left' | 'Right';
}

// MediaPipe hand landmark indices (0-20)
// Reference: https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
const HAND_CONNECTIONS = [
  // Wrist to palm base
  [0, 1], [0, 5], [0, 9], [0, 13], [0, 17],

  // Thumb
  [1, 2], [2, 3], [3, 4],

  // Index finger
  [5, 6], [6, 7], [7, 8],

  // Middle finger
  [9, 10], [10, 11], [11, 12],

  // Ring finger
  [13, 14], [14, 15], [15, 16],

  // Pinky
  [17, 18], [18, 19], [19, 20],

  // Palm connections
  [5, 9], [9, 13], [13, 17],
];

// Color-code joints by finger
const JOINT_COLORS = {
  wrist: '#ffffff',    // White for wrist (0)
  thumb: '#ef4444',    // Red for thumb (1-4)
  index: '#3b82f6',    // Blue for index (5-8)
  middle: '#10b981',   // Green for middle (9-12)
  ring: '#f59e0b',     // Yellow/orange for ring (13-16)
  pinky: '#a855f7',    // Purple for pinky (17-20)
};

function getJointColor(landmarkIndex: number): string {
  if (landmarkIndex === 0) return JOINT_COLORS.wrist;
  if (landmarkIndex >= 1 && landmarkIndex <= 4) return JOINT_COLORS.thumb;
  if (landmarkIndex >= 5 && landmarkIndex <= 8) return JOINT_COLORS.index;
  if (landmarkIndex >= 9 && landmarkIndex <= 12) return JOINT_COLORS.middle;
  if (landmarkIndex >= 13 && landmarkIndex <= 16) return JOINT_COLORS.ring;
  if (landmarkIndex >= 17 && landmarkIndex <= 20) return JOINT_COLORS.pinky;
  return '#ffffff';
}

export function HandSkeleton({ landmarks, handedness }: HandSkeletonProps) {
  const showHandSkeleton = useSettingsStore((state) => state.showHandSkeleton);

  // Create sphere instances for joints
  const jointPositions = useMemo(() => {
    return landmarks.map((lm) => new THREE.Vector3(lm.x, lm.y, lm.z));
  }, [landmarks]);

  // Create bone connections
  const bones = useMemo(() => {
    return HAND_CONNECTIONS.map(([start, end]) => {
      const startPos = landmarks[start];
      const endPos = landmarks[end];

      if (!startPos || !endPos) return null;

      const start3D = new THREE.Vector3(startPos.x, startPos.y, startPos.z);
      const end3D = new THREE.Vector3(endPos.x, endPos.y, endPos.z);

      const direction = new THREE.Vector3().subVectors(end3D, start3D);
      const length = direction.length();
      const midpoint = new THREE.Vector3().addVectors(start3D, end3D).multiplyScalar(0.5);

      // Calculate rotation to align cylinder with bone direction
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
      );

      return {
        position: midpoint,
        quaternion,
        length,
        color: getJointColor(start),
      };
    }).filter((bone): bone is NonNullable<typeof bone> => bone !== null);
  }, [landmarks]);

  if (!showHandSkeleton) return null;

  return (
    <group name={`hand-skeleton-${handedness}`}>
      {/* Render joints as small spheres */}
      {jointPositions.map((position, index) => (
        <mesh key={`joint-${index}`} position={position}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshStandardMaterial
            color={getJointColor(index)}
            emissive={getJointColor(index)}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Render bones as thin cylinders */}
      {bones.map((bone, index) => (
        <mesh
          key={`bone-${index}`}
          position={bone.position}
          quaternion={bone.quaternion}
        >
          <cylinderGeometry args={[0.005, 0.005, bone.length, 6]} />
          <meshStandardMaterial
            color={bone.color}
            emissive={bone.color}
            emissiveIntensity={0.3}
            opacity={0.8}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}
