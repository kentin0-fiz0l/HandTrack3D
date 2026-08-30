// @ts-nocheck
import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider, BallCollider, CylinderCollider, CapsuleCollider } from '@react-three/rapier';
import { Cylinder, Cone, Capsule } from '@react-three/drei';
import { useHandCursorStore } from '@/hooks/useHandTo3DMapping';
import { useGestureStore } from '@/hooks/useGestureRecognition';
import { isInGrabRange } from '@/utils/collisionDetection';
import { useSceneStore } from '@/stores/sceneStore';
import { useBuildModeStore } from '@/stores/buildModeStore';
import { useHintsStore } from '@/stores/hintsStore';
import { GrabPlugin, RapierAdapter } from '@handtrack3d/rapier';
import type { HandState } from '@handtrack3d/rapier';
import * as THREE from 'three';
import type { SceneObject } from '@/types/scene.types';

interface InteractiveObjectProps {
  object: SceneObject;
}

export function InteractiveObject({ object }: InteractiveObjectProps) {
  const rigidBodyRef = useRef<any>(null);
  const meshRef = useRef<any>(null);
  const cursors = useHandCursorStore((state) => state.cursors);
  const gestures = useGestureStore((state) => state.gestures);
  const { camera, raycaster, pointer } = useThree();

  // Get per-object properties from store
  const getObjectProperties = useSceneStore((state) => state.getObjectProperties);
  const selectObject = useSceneStore((state) => state.selectObject);
  const selectedObjectId = useSceneStore((state) => state.selectedObjectId);
  const incrementGestureCount = useHintsStore((state) => state.incrementGestureCount);

  const [isNearHand, setIsNearHand] = useState(false);
  const [wasGrabbed, setWasGrabbed] = useState(false);

  // Get properties for this object
  const properties = getObjectProperties(object.id);

  // Create grab plugin instance (memoized for performance)
  const grabPlugin = useMemo(() => {
    const adapter = new RapierAdapter();
    return new GrabPlugin(adapter, {
      grabRadius: 0.5,
      throwVelocityScale: 60,
    });
  }, []);

  // Handle right-click for selection
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (event.button !== 2) return; // Only right-click
      if (!meshRef.current) return;

      // Update raycaster from camera
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      // Check intersection with this object's mesh
      const intersects = raycaster.intersectObject(meshRef.current, true);

      if (intersects.length > 0) {
        event.preventDefault();
        selectObject(object.id);
      }
    };

    const canvas = document.querySelector('canvas');
    canvas?.addEventListener('pointerdown', handlePointerDown);

    return () => {
      canvas?.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [object.id, camera, raycaster, pointer, selectObject]);

  useFrame(() => {
    if (!rigidBodyRef.current) return;

    // Skip interaction if object is locked, static, or in build mode
    const buildMode = useBuildModeStore.getState().enabled;
    if (properties.locked || properties.isStatic || buildMode) {
      setIsNearHand(false);
      return;
    }

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

    // Track grab events for hints
    const isGrabbed = grabPlugin.isGrabbed(object.id);
    if (isGrabbed && !wasGrabbed) {
      // Object just got grabbed
      incrementGestureCount('grab');
      setWasGrabbed(true);
    } else if (!isGrabbed && wasGrabbed) {
      // Object was released
      setWasGrabbed(false);
    }
  });

  const { type, position, rotation, scale: objectScale } = object;

  // Don't render if invisible
  if (!properties.visible) {
    return null;
  }

  // Visual feedback
  const isGrabbed = grabPlugin.isGrabbed(object.id);
  const isSelected = selectedObjectId === object.id;

  const highlightColor = isGrabbed
    ? '#fbbf24' // Yellow when grabbed
    : isSelected
    ? '#ec4899' // Pink when selected
    : isNearHand
    ? '#60a5fa' // Light blue when near hand
    : properties.color;

  const emissiveIntensity = isGrabbed
    ? 0.5
    : isSelected
    ? 0.4
    : isNearHand
    ? 0.3
    : properties.emissiveIntensity;

  // Apply property scale on top of object scale
  const finalScale = objectScale * properties.scale;

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      rotation={rotation}
      type={properties.isStatic ? 'fixed' : 'dynamic'}
      mass={properties.mass}
      restitution={properties.restitution}
      friction={properties.friction}
      linearDamping={properties.linearDamping}
      angularDamping={properties.angularDamping}
      gravityScale={properties.gravityScale}
    >
      {type === 'box' && <CuboidCollider args={[0.5, 0.5, 0.5]} />}
      {type === 'sphere' && <BallCollider args={[0.5]} />}
      {type === 'torus' && <CylinderCollider args={[0.1, 0.5]} />}
      {type === 'cylinder' && <CylinderCollider args={[0.5, 0.25]} />}
      {type === 'cone' && <CylinderCollider args={[0.5, 0.25]} />}
      {type === 'capsule' && <CapsuleCollider args={[0.5, 0.25]} />}

      <mesh ref={meshRef} scale={finalScale} castShadow>
        {type === 'box' && <boxGeometry args={[1, 1, 1]} />}
        {type === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
        {type === 'torus' && <torusGeometry args={[0.5, 0.2, 16, 32]} />}
        {type === 'cylinder' && (
          <Cylinder args={[0.25, 0.25, 1, 32]}>
            <meshStandardMaterial
              color={highlightColor}
              emissive={highlightColor}
              emissiveIntensity={emissiveIntensity}
              metalness={properties.metalness}
              roughness={properties.roughness}
              transparent={properties.opacity < 1.0}
              opacity={properties.opacity}
            />
          </Cylinder>
        )}
        {type === 'cone' && (
          <Cone args={[0.25, 1, 32]}>
            <meshStandardMaterial
              color={highlightColor}
              emissive={highlightColor}
              emissiveIntensity={emissiveIntensity}
              metalness={properties.metalness}
              roughness={properties.roughness}
              transparent={properties.opacity < 1.0}
              opacity={properties.opacity}
            />
          </Cone>
        )}
        {type === 'capsule' && (
          <Capsule args={[0.25, 0.5, 4, 16]}>
            <meshStandardMaterial
              color={highlightColor}
              emissive={highlightColor}
              emissiveIntensity={emissiveIntensity}
              metalness={properties.metalness}
              roughness={properties.roughness}
              transparent={properties.opacity < 1.0}
              opacity={properties.opacity}
            />
          </Capsule>
        )}
        {!['cylinder', 'cone', 'capsule'].includes(type) && (
          <meshStandardMaterial
            color={highlightColor}
            emissive={highlightColor}
            emissiveIntensity={emissiveIntensity}
            metalness={properties.metalness}
            roughness={properties.roughness}
            transparent={properties.opacity < 1.0}
            opacity={properties.opacity}
          />
        )}
      </mesh>
    </RigidBody>
  );
}
