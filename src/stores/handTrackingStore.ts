import { create } from 'zustand';
import type { Hand } from '@/types/hand.types';

export interface TrackingError {
  message: string;
  code: string;
  timestamp: number;
  recoverable: boolean;
}

interface HandTrackingStore {
  hands: Hand[];
  fps: number;
  lastUpdate: number;
  error: TrackingError | null;
  isInitializing: boolean;
  setHands: (hands: Hand[]) => void;
  setFps: (fps: number) => void;
  updateHands: (hands: Hand[]) => void;
  setError: (error: TrackingError | null) => void;
  setInitializing: (isInitializing: boolean) => void;
  clearError: () => void;
}

export const useHandTrackingStore = create<HandTrackingStore>((set) => ({
  hands: [],
  fps: 0,
  lastUpdate: Date.now(),
  error: null,
  isInitializing: false,
  setHands: (hands) => set({ hands, lastUpdate: Date.now() }),
  setFps: (fps) => set({ fps }),
  updateHands: (hands) => {
    const now = Date.now();
    set((state) => {
      const delta = now - state.lastUpdate;
      const fps = delta > 0 ? Math.round(1000 / delta) : 0;
      return { hands, fps, lastUpdate: now, error: null }; // Clear error on successful update
    });
  },
  setError: (error) => set({ error }),
  setInitializing: (isInitializing) => set({ isInitializing }),
  clearError: () => set({ error: null }),
}));
