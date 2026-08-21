import { useEffect, useRef, useState, useCallback } from 'react';
import {
  HandTracker,
  type Hand,
  type MediaPipeConfig,
} from '@handtrack3d/core';

/**
 * Options for hand tracking hook
 */
export interface UseHandTrackingOptions extends MediaPipeConfig {
  /** Whether to start tracking automatically */
  autoStart?: boolean;
}

/**
 * Return type for useHandTracking hook
 */
export interface UseHandTrackingReturn {
  /** Array of detected hands */
  hands: Hand[];
  /** Whether tracking is active */
  isTracking: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Start tracking with a video element */
  startTracking: (videoElement: HTMLVideoElement) => Promise<void>;
  /** Stop tracking */
  stopTracking: () => void;
  /** Update tracker configuration */
  updateConfig: (config: Partial<MediaPipeConfig>) => void;
}

/**
 * Hook to track hands from a video source using MediaPipe
 *
 * @param options - Hand tracking configuration options
 * @returns Hand tracking state and controls
 *
 * @example
 * ```tsx
 * function App() {
 *   const { videoRef } = useWebcam();
 *   const { hands, isTracking, startTracking } = useHandTracking({
 *     maxNumHands: 2,
 *     minDetectionConfidence: 0.7
 *   });
 *
 *   useEffect(() => {
 *     if (videoRef.current) {
 *       startTracking(videoRef.current);
 *     }
 *   }, [videoRef.current]);
 *
 *   return (
 *     <div>
 *       <video ref={videoRef} />
 *       <p>Hands: {hands.length}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useHandTracking(
  options: UseHandTrackingOptions = {}
): UseHandTrackingReturn {
  const { autoStart = false, ...mediaPipeConfig } = options;

  const trackerRef = useRef<HandTracker | null>(null);
  const [hands, setHands] = useState<Hand[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize tracker on mount
  useEffect(() => {
    trackerRef.current = new HandTracker(mediaPipeConfig);

    return () => {
      if (trackerRef.current) {
        trackerRef.current.close();
        trackerRef.current = null;
      }
    };
  }, []); // Only create once

  const startTracking = useCallback(
    async (videoElement: HTMLVideoElement) => {
      const tracker = trackerRef.current;
      if (!tracker) {
        const err = new Error('HandTracker not initialized');
        setError(err);
        throw err;
      }

      try {
        setError(null);

        // Initialize if not already initialized
        if (!tracker.isReady()) {
          await tracker.initialize(
            (detectedHands) => {
              setHands(detectedHands);
            },
            (err) => {
              setError(err);
              console.error('Hand tracking error:', err);
            }
          );
        }

        // Start camera
        await tracker.startCamera(videoElement);
        setIsTracking(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsTracking(false);
        throw error;
      }
    },
    []
  );

  const stopTracking = useCallback(() => {
    const tracker = trackerRef.current;
    if (tracker) {
      tracker.stopCamera();
      setIsTracking(false);
      setHands([]);
    }
  }, []);

  const updateConfig = useCallback((config: Partial<MediaPipeConfig>) => {
    const tracker = trackerRef.current;
    if (tracker) {
      tracker.updateConfig(config);
    }
  }, []);

  return {
    hands,
    isTracking,
    error,
    startTracking,
    stopTracking,
    updateConfig,
  };
}
