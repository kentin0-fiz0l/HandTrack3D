import { useEffect, useState, useRef } from 'react';
import {
  GestureDetector,
  type Hand,
  type GestureType,
  type GestureSettings,
  type HandGesture,
} from '@handtrack3d/core';

/**
 * Options for gesture recognition hook
 */
export interface UseGestureRecognitionOptions extends Partial<GestureSettings> {
  /** Debounce time in milliseconds */
  debounceMs?: number;
}

/**
 * Return type for useGestureRecognition hook
 */
export interface UseGestureRecognitionReturn {
  /** Current detected gesture */
  gesture: GestureType;
  /** Gesture confidence (0-1) */
  confidence: number;
  /** Update gesture detection settings */
  updateSettings: (settings: Partial<GestureSettings>) => void;
}

/**
 * Hook to recognize gestures from a single hand
 *
 * @param hand - Hand to detect gestures from (or undefined/null)
 * @param options - Gesture detection options
 * @returns Detected gesture and controls
 *
 * @example
 * ```tsx
 * function App() {
 *   const { hands } = useHandTracking();
 *   const { gesture, confidence } = useGestureRecognition(hands[0], {
 *     pinchThreshold: 0.05,
 *     debounceMs: 100
 *   });
 *
 *   return (
 *     <div>
 *       <p>Gesture: {gesture}</p>
 *       <p>Confidence: {(confidence * 100).toFixed(0)}%</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGestureRecognition(
  hand: Hand | undefined | null,
  options: UseGestureRecognitionOptions = {}
): UseGestureRecognitionReturn {
  const { debounceMs = 100, ...gestureSettings } = options;

  const detectorRef = useRef<GestureDetector>(
    new GestureDetector(gestureSettings)
  );
  const [gesture, setGesture] = useState<GestureType>('none');
  const [confidence, setConfidence] = useState<number>(1.0);
  const previousGestureRef = useRef<GestureType>('none');
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!hand) {
      setGesture('none');
      setConfidence(1.0);
      previousGestureRef.current = 'none';
      return;
    }

    const now = Date.now();

    // Debounce: only update every debounceMs milliseconds
    if (now - lastUpdateRef.current < debounceMs) {
      return;
    }

    lastUpdateRef.current = now;

    // Detect gesture
    const detectedGesture = detectorRef.current.detectGesture(hand.landmarks);

    // Calculate confidence based on gesture stability
    let newConfidence = 1.0;
    if (previousGestureRef.current !== detectedGesture) {
      newConfidence = 0.7; // Lower confidence on gesture change
    }

    setGesture(detectedGesture);
    setConfidence(newConfidence);
    previousGestureRef.current = detectedGesture;
  }, [hand, debounceMs]);

  const updateSettings = (settings: Partial<GestureSettings>) => {
    detectorRef.current.updateSettings(settings);
  };

  return {
    gesture,
    confidence,
    updateSettings,
  };
}

/**
 * Hook to recognize gestures from multiple hands
 *
 * @param hands - Array of hands to detect gestures from
 * @param options - Gesture detection options
 * @returns Array of detected gestures
 *
 * @example
 * ```tsx
 * function App() {
 *   const { hands } = useHandTracking();
 *   const gestures = useMultiHandGestures(hands);
 *
 *   return (
 *     <div>
 *       {gestures.map((g, i) => (
 *         <p key={i}>{g.handId}: {g.gesture}</p>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMultiHandGestures(
  hands: Hand[],
  options: UseGestureRecognitionOptions = {}
): HandGesture[] {
  const { debounceMs = 100, ...gestureSettings } = options;

  const detectorRef = useRef<GestureDetector>(
    new GestureDetector(gestureSettings)
  );
  const [gestures, setGestures] = useState<HandGesture[]>([]);
  const previousGesturesRef = useRef<Map<string, GestureType>>(new Map());
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (hands.length === 0) {
      setGestures([]);
      previousGesturesRef.current.clear();
      return;
    }

    const now = Date.now();

    // Debounce
    if (now - lastUpdateRef.current < debounceMs) {
      return;
    }

    lastUpdateRef.current = now;

    const detectedGestures: HandGesture[] = hands.map((hand) => {
      const gesture = detectorRef.current.detectGesture(hand.landmarks);
      const previousGesture = previousGesturesRef.current.get(hand.id);

      // Calculate confidence
      let confidence = 1.0;
      if (previousGesture && previousGesture !== gesture) {
        confidence = 0.7;
      }

      previousGesturesRef.current.set(hand.id, gesture);

      return {
        handId: hand.id,
        gesture,
        confidence,
      };
    });

    setGestures(detectedGestures);
  }, [hands, debounceMs]);

  return gestures;
}
