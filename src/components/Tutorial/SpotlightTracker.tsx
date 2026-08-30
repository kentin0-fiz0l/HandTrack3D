import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * SpotlightTracker - Component that must be placed inside <Canvas>
 * Tracks 3D camera and canvas size, updating global references that Spotlight can access
 *
 * This is a workaround for the limitation that Spotlight component exists outside
 * the Canvas and cannot directly access the Three.js camera via useThree()
 */
export function SpotlightTracker() {
  const { camera, size } = useThree();

  useEffect(() => {
    // Store camera and canvas size in window object for Spotlight access
    window.__spotlight_camera = camera;
    window.__spotlight_canvas = {
      width: size.width,
      height: size.height,
    };

    // Cleanup on unmount
    return () => {
      delete window.__spotlight_camera;
      delete window.__spotlight_canvas;
    };
  }, [camera, size]);

  // This component doesn't render anything
  return null;
}
