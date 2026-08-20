import { create } from 'zustand';
import type { Hand } from '@/types/hand.types';

interface HandTrackingStore {
  hands: Hand[];
  fps: number;
  lastUpdate: number;
  setHands: (hands: Hand[]) => void;
  setFps: (fps: number) => void;
  updateHands: (hands: Hand[]) => void;
}

export const useHandTrackingStore = create<HandTrackingStore>((set) => ({
  hands: [],
  fps: 0,
  lastUpdate: Date.now(),
  setHands: (hands) => set({ hands, lastUpdate: Date.now() }),
  setFps: (fps) => set({ fps }),
  updateHands: (hands) => {
    const now = Date.now();
    set((state) => {
      const delta = now - state.lastUpdate;
      const fps = delta > 0 ? Math.round(1000 / delta) : 0;
      return { hands, fps, lastUpdate: now };
    });
  },
}));
