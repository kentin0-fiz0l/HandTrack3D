import { useMemo } from 'react';
import {
  mapHandTo3D,
  getIndexFingerTip,
  getThumbTip,
  getWrist,
  getHandCentroid,
  type Hand,
  type Vector3D,
} from '@handtrack3d/core';

/**
 * Landmark to use for 3D mapping
 */
export type LandmarkType = 'indexTip' | 'thumbTip' | 'wrist' | 'centroid';

/**
 * Options for hand to 3D mapping
 */
export interface UseHandTo3DMappingOptions {
  /** Which landmark to map */
  landmark?: LandmarkType;
}

/**
 * Return type for useHandTo3DMapping hook
 */
export interface UseHandTo3DMappingReturn {
  /** 3D position in world space */
  position: Vector3D;
  /** Original 2D landmark (normalized 0-1) */
  landmark2D: { x: number; y: number; z: number };
}

/**
 * Hook to map hand coordinates to 3D space
 *
 * Maps normalized hand landmark coordinates (0-1) to 3D world coordinates.
 * Useful for positioning 3D objects based on hand position.
 *
 * @param hand - Hand to map (or undefined/null)
 * @param options - Mapping options
 * @returns 3D position and 2D landmark
 *
 * @example
 * ```tsx
 * function App() {
 *   const { hands } = useHandTracking();
 *   const { position, landmark2D } = useHandTo3DMapping(hands[0], {
 *     landmark: 'indexTip'
 *   });
 *
 *   return (
 *     <div>
 *       <p>3D Position: ({position.x}, {position.y}, {position.z})</p>
 *       <p>2D Position: ({landmark2D.x}, {landmark2D.y})</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useHandTo3DMapping(
  hand: Hand | undefined | null,
  options: UseHandTo3DMappingOptions = {}
): UseHandTo3DMappingReturn {
  const { landmark: landmarkType = 'indexTip' } = options;

  return useMemo(() => {
    if (!hand) {
      return {
        position: { x: 0, y: 0, z: 0 },
        landmark2D: { x: 0, y: 0, z: 0 },
      };
    }

    // Get the specified landmark
    let landmark2D;
    switch (landmarkType) {
      case 'indexTip':
        landmark2D = getIndexFingerTip(hand.landmarks);
        break;
      case 'thumbTip':
        landmark2D = getThumbTip(hand.landmarks);
        break;
      case 'wrist':
        landmark2D = getWrist(hand.landmarks);
        break;
      case 'centroid':
        landmark2D = getHandCentroid(hand.landmarks);
        break;
      default:
        landmark2D = getIndexFingerTip(hand.landmarks);
    }

    // Map to 3D space
    const position = mapHandTo3D(landmark2D);

    return {
      position,
      landmark2D,
    };
  }, [hand, landmarkType]);
}

/**
 * Hook to map multiple hands to 3D space
 *
 * @param hands - Array of hands to map
 * @param options - Mapping options
 * @returns Array of hand 3D positions
 *
 * @example
 * ```tsx
 * function App() {
 *   const { hands } = useHandTracking();
 *   const positions = useMultiHandMapping(hands);
 *
 *   return (
 *     <div>
 *       {positions.map((pos, i) => (
 *         <p key={i}>Hand {i}: ({pos.position.x.toFixed(2)}, {pos.position.y.toFixed(2)})</p>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMultiHandMapping(
  hands: Hand[],
  options: UseHandTo3DMappingOptions = {}
): Array<{ handId: string; position: Vector3D; landmark2D: { x: number; y: number; z: number } }> {
  const { landmark: landmarkType = 'indexTip' } = options;

  return useMemo(() => {
    return hands.map((hand) => {
      // Get the specified landmark
      let landmark2D;
      switch (landmarkType) {
        case 'indexTip':
          landmark2D = getIndexFingerTip(hand.landmarks);
          break;
        case 'thumbTip':
          landmark2D = getThumbTip(hand.landmarks);
          break;
        case 'wrist':
          landmark2D = getWrist(hand.landmarks);
          break;
        case 'centroid':
          landmark2D = getHandCentroid(hand.landmarks);
          break;
        default:
          landmark2D = getIndexFingerTip(hand.landmarks);
      }

      const position = mapHandTo3D(landmark2D);

      return {
        handId: hand.id,
        position,
        landmark2D,
      };
    });
  }, [hands, landmarkType]);
}
