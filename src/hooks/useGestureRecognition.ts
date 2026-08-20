import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { useHandTrackingStore } from '@/stores/handTrackingStore';
import { detectGesture } from '@/services/gestureDetector';
import type { HandGesture, GestureType } from '@/types/gesture.types';

interface GestureStore {
  gestures: HandGesture[];
  setGestures: (gestures: HandGesture[]) => void;
}

export const useGestureStore = create<GestureStore>((set) => ({
  gestures: [],
  setGestures: (gestures) => set({ gestures }),
}));

const DEBOUNCE_MS = 100;

/**
 * Hook to detect gestures from hand tracking data
 */
export function useGestureRecognition() {
  const hands = useHandTrackingStore((state) => state.hands);
  const setGestures = useGestureStore((state) => state.setGestures);
  const lastUpdateRef = useRef<number>(0);
  const previousGesturesRef = useRef<Map<string, GestureType>>(new Map());

  useEffect(() => {
    const now = Date.now();
    
    // Debounce: only update every DEBOUNCE_MS milliseconds
    if (now - lastUpdateRef.current < DEBOUNCE_MS) {
      return;
    }

    lastUpdateRef.current = now;

    if (hands.length === 0) {
      setGestures([]);
      previousGesturesRef.current.clear();
      return;
    }

    const gestures: HandGesture[] = hands.map((hand) => {
      const gesture = detectGesture(hand.landmarks);
      const previousGesture = previousGesturesRef.current.get(hand.id);

      // Store current gesture for next comparison
      previousGesturesRef.current.set(hand.id, gesture);

      // Calculate confidence based on gesture stability
      let confidence = 1.0;
      if (previousGesture && previousGesture !== gesture) {
        confidence = 0.7; // Lower confidence on gesture change
      }

      return {
        handId: hand.id,
        gesture,
        confidence,
      };
    });

    setGestures(gestures);
  }, [hands, setGestures]);
}
