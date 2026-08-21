// @ts-nocheck
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, BallCollider, CylinderCollider, CapsuleCollider } from '@react-three/rapier';
import { Cylinder, Cone, Capsule } from '@react-three/drei';
import { useSceneStore } from '@/stores/sceneStore';
import { useHandCursorStore } from '@/hooks/useHandTo3DMapping';
import { useGestureStore } from '@/hooks/useGestureRecognition';
import { isInGrabRange, calculateGrabOffset } from '@/utils/collisionDetection';
import { useSettingsStore } from '@/stores/settingsStore';
import * as THREE from 'three';
import type { SceneObject } from '@/types/scene.types';

interface InteractiveObjectProps {
  object: SceneObject;
}

export function InteractiveObject({ object }: InteractiveObjectProps) {
  const rigidBodyRef = useRef<any>(null);
  const isGrabbed = useSceneStore((state) => state.isObjectGrabbed(object.id));
  const grabbedObjects = useSceneStore((state) => state.grabbedObjects);
  const grabObject = useSceneStore((state) => state.grabObject);
  const releaseObject = useSceneStore((state) => state.releaseObject);
  const updateObjectPosition = useSceneStore((state) => state.updateObjectPosition);
  const cursors = useHandCursorStore((state) => state.cursors);
  const gestures = useGestureStore((state) => state.gestures);
  const restitution = useSettingsStore((state) => state.restitution);
  const friction = useSettingsStore((state) => state.friction);

  const [isNearHand, setIsNearHand] = useState(false);
  const prevPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(...object.position));

  useFrame(() => {
    if (!rigidBodyRef.current) return;

    const currentPos = rigidBodyRef.current.translation();
    let nearHand = false;

    // Check each hand cursor
    cursors.forEach((cursor) => {
      const objectPos = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);
      const inRange = isInGrabRange(cursor.position, objectPos);

      if (inRange) {
        nearHand = true;
      }

      // Get gesture for this hand
      const handGesture = gestures.find((g) => g.handId === cursor.id);
      const isPinching = handGesture?.gesture === 'pinch';
      const isOpen = handGesture?.gesture === 'open';

      const currentlyGrabbed = grabbedObjects.get(cursor.id);

      // Grab logic
      if (inRange && isPinching && !currentlyGrabbed) {
        // Grab this object
        const offset = calculateGrabOffset(cursor.position, objectPos);
        grabObject(cursor.id, object.id, offset.toArray() as [number, number, number]);
        // Make kinematic (controlled by hand, not physics)
        rigidBodyRef.current.setBodyType(1, true); // 1 = kinematic
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }

      // Release logic
      if (currentlyGrabbed?.id === object.id && isOpen) {
        // Calculate velocity for throwing
        const velocity = new THREE.Vector3(
          currentPos.x - prevPositionRef.current.x,
          currentPos.y - prevPositionRef.current.y,
          currentPos.z - prevPositionRef.current.z
        ).multiplyScalar(60); // Multiply by frame rate approximation

        // Make dynamic again
        rigidBodyRef.current.setBodyType(0, true); // 0 = dynamic
        rigidBodyRef.current.setLinvel(velocity, true);

        releaseObject(cursor.id);
      }

      // Update position if grabbed
      if (currentlyGrabbed?.id === object.id) {
        const offset = new THREE.Vector3(...currentlyGrabbed.offset);
        const newPos = cursor.position.clone().add(offset);
        rigidBodyRef.current.setTranslation(newPos, true);
        updateObjectPosition(object.id, newPos.toArray() as [number, number, number]);
      }
    });

    // Track previous position for velocity calculation
    prevPositionRef.current.set(currentPos.x, currentPos.y, currentPos.z);
    setIsNearHand(nearHand);
  });

  const { type, position, rotation, scale, color } = object;

  // Visual feedback
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
