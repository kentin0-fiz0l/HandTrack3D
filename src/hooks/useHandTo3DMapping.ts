import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useHandTrackingStore } from '@/stores/handTrackingStore';
import { mapHandTo3D, getIndexFingerTip } from '@/utils/coordinateMapping';
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
      const position = mapHandTo3D(indexTip, camera, size.width, size.height);

      return {
        id: hand.id,
        position,
        handedness: hand.handedness,
      };
    });

    setCursors(cursors);
  }, [hands, camera, size, setCursors]);
}
