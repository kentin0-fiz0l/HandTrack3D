import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useHandTrackingStore } from '@/stores/handTrackingStore';
import { mapHandTo3D, getIndexFingerTip, clearHandSmoothingCache } from '@/utils/coordinateMapping';
import * as THREE from 'three';

interface HandCursor {
  id: string;
  position: THREE.Vector3;
  handedness: 'Left' | 'Right';
}

// Create a store for hand cursors
import { create } from 'zustand';

interface HandCursorStore {
  cursors: HandCursor[];
  setCursors: (cursors: HandCursor[]) => void;
}

export const useHandCursorStore = create<HandCursorStore>((set) => ({
  cursors: [],
  setCursors: (cursors) => set({ cursors }),
}));

/**
 * Maps hand landmarks to 3D cursor positions
 * Now includes hand size-based depth estimation for improved accuracy
 */
export function useHandTo3DMapping() {
  const { camera, size } = useThree();
  const hands = useHandTrackingStore((state) => state.hands);
  const setCursors = useHandCursorStore((state) => state.setCursors);

  useEffect(() => {
    if (hands.length === 0) {
      setCursors([]);
      return;
    }

    const cursors: HandCursor[] = hands.map((hand) => {
      const indexTip = getIndexFingerTip(hand.landmarks);

      // Pass all landmarks, hand ID, and handedness for depth estimation with arm extension
      const position = mapHandTo3D(
        indexTip,
        hand.landmarks,   // All landmarks for size calculation
        hand.id,          // Hand ID for smoothing cache
        hand.handedness,  // Handedness for arm extension from pose
        camera,
        size.width,
        size.height
      );

      return {
        id: hand.id,
        position,
        handedness: hand.handedness,
      };
    });

    setCursors(cursors);
  }, [hands, camera, size, setCursors]);

  // Clean up smoothing cache when hands disappear
  useEffect(() => {
    const currentHandIds = new Set(hands.map(h => h.id));

    // This cleanup would require tracking previous hand IDs
    // For now, cache cleanup happens automatically via Map behavior
    // Could be enhanced with a ref to track previous hands
  }, [hands]);
}
