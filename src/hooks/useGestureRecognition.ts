import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { useHandTrackingStore } from '@/stores/handTrackingStore';
import { detectGesture } from '@/services/gestureDetector';
import { getSettings } from '@/stores/settingsStore';
import type { HandGesture, GestureType, SwipeDetectionState } from '@/types/gesture.types';

interface GestureStore {
  gestures: HandGesture[];
  setGestures: (gestures: HandGesture[]) => void;
}

export const useGestureStore = create<GestureStore>((set) => ({
  gestures: [],
  setGestures: (gestures) => set({ gestures }),
}));

const DEBOUNCE_MS = 100;
const POSITION_HISTORY_SIZE = 12; // Track last 12 frames (~200ms at 60fps)

/**
 * Detect swipe gesture from position history
 */
function detectSwipe(
  state: SwipeDetectionState,
  currentTime: number
): GestureType | null {
  const settings = getSettings();

  // Check cooldown
  if (currentTime - state.lastSwipeTimestamp < settings.swipeCooldown) {
    return null;
  }

  const history = state.positionHistory;
  if (history.length < 5) {
    return null; // Need enough history
  }

  // Calculate velocity from first to last position
  const first = history[0];
  const last = history[history.length - 1];
  const deltaTime = (last.timestamp - first.timestamp) / 1000; // Convert to seconds

  if (deltaTime < 0.05) {
    return null; // Too short time span
  }

  const velocityX = (last.x - first.x) / deltaTime;
  const velocityY = (last.y - first.y) / deltaTime;

  // Find dominant direction
  const absVelX = Math.abs(velocityX);
  const absVelY = Math.abs(velocityY);

  // Check if velocity exceeds threshold
  const maxVelocity = Math.max(absVelX, absVelY);
  if (maxVelocity < settings.swipeVelocityThreshold) {
    return null;
  }

  // Determine swipe direction
  if (absVelX > absVelY) {
    return velocityX > 0 ? 'swipeRight' : 'swipeLeft';
  } else {
    return velocityY > 0 ? 'swipeDown' : 'swipeUp';
  }
}

/**
 * Hook to detect gestures from hand tracking data
 */
export function useGestureRecognition() {
  const hands = useHandTrackingStore((state) => state.hands);
  const setGestures = useGestureStore((state) => state.setGestures);
  const lastUpdateRef = useRef<number>(0);
  const previousGesturesRef = useRef<Map<string, GestureType>>(new Map());
  const swipeStateRef = useRef<Map<string, SwipeDetectionState>>(new Map());

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
      swipeStateRef.current.clear();
      return;
    }

    const gestures: HandGesture[] = hands.map((hand) => {
      // Get or create swipe state for this hand
      let swipeState = swipeStateRef.current.get(hand.id);
      if (!swipeState) {
        swipeState = {
          positionHistory: [],
          lastSwipeTimestamp: 0,
        };
        swipeStateRef.current.set(hand.id, swipeState);
      }

      // Get palm position (wrist landmark)
      const palmPosition = hand.landmarks[0];

      // Add current position to history
      swipeState.positionHistory.push({
        x: palmPosition.x,
        y: palmPosition.y,
        z: palmPosition.z,
        timestamp: now,
      });

      // Keep only recent history
      if (swipeState.positionHistory.length > POSITION_HISTORY_SIZE) {
        swipeState.positionHistory.shift();
      }

      // Detect swipe gesture
      const swipeGesture = detectSwipe(swipeState, now);

      let gesture: GestureType;
      if (swipeGesture) {
        gesture = swipeGesture;
        swipeState.lastSwipeTimestamp = now;
        // Clear history after swipe is detected
        swipeState.positionHistory = [];
      } else {
        // Detect static gestures
        gesture = detectGesture(hand.landmarks);
      }

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
