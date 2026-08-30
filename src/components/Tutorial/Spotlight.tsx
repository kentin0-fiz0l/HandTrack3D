import { useEffect, useState, useRef } from 'react';
import { useSceneStore } from '@/stores/sceneStore';
import { useHandCursorStore } from '@/hooks/useHandTo3DMapping';
import { getSpotlightTargetPosition, formatGradientPosition, getElementCenter } from '@/utils/domHelpers';
import * as THREE from 'three';

/**
 * Spotlight effect that highlights specific elements during tutorial
 * Creates a dark overlay with a transparent "spotlight" area
 */

interface SpotlightProps {
  target: string; // 'nearest-object' | 'grabbed-object' | specific element selector
}

// Global reference for camera and canvas size (set by SpotlightTracker in Scene3D)
declare global {
  interface Window {
    __spotlight_camera?: THREE.Camera;
    __spotlight_canvas?: { width: number; height: number };
  }
}

export function Spotlight({ target }: SpotlightProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const rafRef = useRef<number>();

  useEffect(() => {
    // Update dimensions on window resize
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Update spotlight position on every frame for smooth tracking
    const updatePosition = () => {
      // Helper functions to get object data
      const getObjectPosition = (id: string): [number, number, number] | null => {
        const object = useSceneStore.getState().objects.find((obj) => obj.id === id);
        return object ? object.position : null;
      };

      const getNearestObjectId = (): string | null => {
        const cursors = useHandCursorStore.getState().cursors;
        if (cursors.length === 0) return null;

        const objects = useSceneStore.getState().objects;
        const grabRange = 10; // Large range to find any nearby object

        // Find the nearest object to the first cursor
        const cursorPos = cursors[0].position;
        let nearestId: string | null = null;
        let minDistance = Infinity;

        objects.forEach((obj) => {
          const objPos = new THREE.Vector3(...obj.position);
          const distance = cursorPos.distanceTo(objPos);
          if (distance < minDistance && distance <= grabRange) {
            minDistance = distance;
            nearestId = obj.id;
          }
        });

        return nearestId;
      };

      const getGrabbedObjectId = (): string | null => {
        const grabbedObjects = useSceneStore.getState().grabbedObjects;
        // Get the first grabbed object
        for (const grabbed of grabbedObjects.values()) {
          return grabbed.id;
        }
        return null;
      };

      // Get camera and canvas from global (set by SpotlightTracker)
      const camera = window.__spotlight_camera;
      const canvasSize = window.__spotlight_canvas;

      if (target === 'nearest-object' || target === 'grabbed-object') {
        // Handle 3D object targeting
        if (!camera || !canvasSize) {
          // Camera not available yet - retry on next frame
          rafRef.current = requestAnimationFrame(updatePosition);
          return;
        }

        const coords = getSpotlightTargetPosition(
          target,
          camera,
          canvasSize.width,
          canvasSize.height,
          getObjectPosition,
          getNearestObjectId,
          getGrabbedObjectId
        );

        setPosition(coords);
      } else {
        // Handle DOM element targeting (CSS selector)
        const coords = getElementCenter(target);
        setPosition(coords);
      }

      rafRef.current = requestAnimationFrame(updatePosition);
    };

    rafRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target]);

  // Calculate gradient position
  const gradientPosition = position
    ? formatGradientPosition(position, dimensions.width, dimensions.height)
    : 'center';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40"
      style={{
        background: `radial-gradient(circle at ${gradientPosition}, transparent 12%, rgba(0,0,0,0.75) 45%)`,
        transition: 'background 0.3s ease-out',
      }}
    >
      {/* Animated ring around spotlight */}
      {position && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <div className="w-72 h-72 rounded-full border-4 border-blue-500/40 animate-pulse" />
        </div>
      )}
    </div>
  );
}
