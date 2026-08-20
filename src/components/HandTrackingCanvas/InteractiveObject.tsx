// @ts-nocheck
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSceneStore } from '@/stores/sceneStore';
import { useHandCursorStore } from '@/hooks/useHandTo3DMapping';
import { useGestureStore } from '@/hooks/useGestureRecognition';
import { isInGrabRange, calculateGrabOffset } from '@/utils/collisionDetection';
import * as THREE from 'three';
import type { SceneObject } from '@/types/scene.types';

interface InteractiveObjectProps {
  object: SceneObject;
}

export function InteractiveObject({ object }: InteractiveObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const isGrabbed = useSceneStore((state) => state.isObjectGrabbed(object.id));
  const grabbedObjects = useSceneStore((state) => state.grabbedObjects);
  const grabObject = useSceneStore((state) => state.grabObject);
  const releaseObject = useSceneStore((state) => state.releaseObject);
  const updateObjectPosition = useSceneStore((state) => state.updateObjectPosition);
  const cursors = useHandCursorStore((state) => state.cursors);
  const gestures = useGestureStore((state) => state.gestures);

  const [isNearHand, setIsNearHand] = useRef(false);

  useFrame(() => {
    if (!meshRef.current) return;

    let nearHand = false;

    // Check each hand cursor
    cursors.forEach((cursor) => {
      const objectPos = new THREE.Vector3(...object.position);
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
      }

      // Release logic
      if (currentlyGrabbed?.id === object.id && isOpen) {
        releaseObject(cursor.id);
      }

      // Update position if grabbed
      if (currentlyGrabbed?.id === object.id) {
        const offset = new THREE.Vector3(...currentlyGrabbed.offset);
        const newPos = cursor.position.clone().add(offset);
        updateObjectPosition(object.id, newPos.toArray() as [number, number, number]);
      }
    });

    setIsNearHand.current = nearHand;
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
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      {type === 'box' && <boxGeometry args={[1, 1, 1]} />}
      {type === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
      {type === 'torus' && <torusGeometry args={[0.5, 0.2, 16, 32]} />}
      <meshStandardMaterial
        color={highlightColor}
        emissive={highlightColor}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}
