// @ts-nocheck
import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, BallCollider, CylinderCollider, CapsuleCollider } from '@react-three/rapier';
import { Cylinder, Cone, Capsule } from '@react-three/drei';
import { useHandCursorStore } from '@/hooks/useHandTo3DMapping';
import { useGestureStore } from '@/hooks/useGestureRecognition';
import { isInGrabRange } from '@/utils/collisionDetection';
import { useSettingsStore } from '@/stores/settingsStore';
import { GrabPlugin, RapierAdapter } from '@handtrack3d/rapier';
import type { HandState } from '@handtrack3d/rapier';
import * as THREE from 'three';
import type { SceneObject } from '@/types/scene.types';

interface InteractiveObjectProps {
  object: SceneObject;
}

export function InteractiveObject({ object }: InteractiveObjectProps) {
  const rigidBodyRef = useRef<any>(null);
  const cursors = useHandCursorStore((state) => state.cursors);
  const gestures = useGestureStore((state) => state.gestures);
  const restitution = useSettingsStore((state) => state.restitution);
  const friction = useSettingsStore((state) => state.friction);

  const [isNearHand, setIsNearHand] = useState(false);

  // Create grab plugin instance (memoized for performance)
  const grabPlugin = useMemo(() => {
    const adapter = new RapierAdapter();
    return new GrabPlugin(adapter, {
      grabRadius: 0.5,
      throwVelocityScale: 60,
    });
  }, []);

  useFrame(() => {
    if (!rigidBodyRef.current) return;

    const currentPos = rigidBodyRef.current.translation();
    const objectPos = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);
    let nearHand = false;

    // Check each hand cursor
    cursors.forEach((cursor) => {
      const inRange = isInGrabRange(cursor.position, objectPos);

      if (inRange) {
        nearHand = true;
      }

      // Get gesture for this hand
      const handGesture = gestures.find((g) => g.handId === cursor.id);
      const gesture = handGesture?.gesture || 'none';

      // Create hand state for plugin
      const hand: HandState = {
        id: cursor.id,
        position: cursor.position,
        gesture,
      };

      // Create rigid bodies map for this object
      const rigidBodies = new Map([[object.id, rigidBodyRef.current]]);

      // Update grab plugin (handles grab, hold, release, throw)
      grabPlugin.update(hand, rigidBodies);
    });

    setIsNearHand(nearHand);
  });

  const { type, position, rotation, scale, color } = object;

  // Visual feedback
  const isGrabbed = grabPlugin.isGrabbed(object.id);
  const highlightColor = isGrabbed
    ? '#fbbf24' // Yellow when grabbed
    : isNearHand
    ? '#60a5fa' // Light blue when near hand
    : color;

  const emissiveIntensity = isGrabbed ? 0.5 : isNearHand ? 0.3 : 0;

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      rotation={rotation}
      mass={1}
      restitution={restitution} // Bounciness
      friction={friction}
      linearDamping={0.5}
      angularDamping={0.5}
    >
      {type === 'box' && <CuboidCollider args={[0.5, 0.5, 0.5]} />}
      {type === 'sphere' && <BallCollider args={[0.5]} />}
      {type === 'torus' && <CylinderCollider args={[0.1, 0.5]} />}
      {type === 'cylinder' && <CylinderCollider args={[0.5, 0.25]} />}
      {type === 'cone' && <CylinderCollider args={[0.5, 0.25]} />}
      {type === 'capsule' && <CapsuleCollider args={[0.5, 0.25]} />}

      <mesh scale={scale} castShadow>
        {type === 'box' && <boxGeometry args={[1, 1, 1]} />}
        {type === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
        {type === 'torus' && <torusGeometry args={[0.5, 0.2, 16, 32]} />}
        {type === 'cylinder' && (
          <Cylinder args={[0.25, 0.25, 1, 32]}>
            <meshStandardMaterial
              color={highlightColor}
              emissive={highlightColor}
              emissiveIntensity={emissiveIntensity}
            />
          </Cylinder>
        )}
        {type === 'cone' && (
          <Cone args={[0.25, 1, 32]}>
            <meshStandardMaterial
              color={highlightColor}
              emissive={highlightColor}
              emissiveIntensity={emissiveIntensity}
            />
          </Cone>
        )}
        {type === 'capsule' && (
          <Capsule args={[0.25, 0.5, 4, 16]}>
            <meshStandardMaterial
              color={highlightColor}
              emissive={highlightColor}
              emissiveIntensity={emissiveIntensity}
            />
          </Capsule>
        )}
        {!['cylinder', 'cone', 'capsule'].includes(type) && (
          <meshStandardMaterial
            color={highlightColor}
            emissive={highlightColor}
            emissiveIntensity={emissiveIntensity}
          />
        )}
      </mesh>
    </RigidBody>
  );
}
