import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  HandTracker,
  type Hand,
  type MediaPipeConfig,
} from '@handtrack3d/core';

/**
 * Hand tracking context value
 */
export interface HandTrackingContextValue {
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
 * Props for HandTrackingProvider
 */
export interface HandTrackingProviderProps {
  /** Child components */
  children: ReactNode;
  /** MediaPipe configuration */
  config?: MediaPipeConfig;
}

// Create context
const HandTrackingContext = createContext<HandTrackingContextValue | null>(null);

/**
 * Provider component for hand tracking context
 *
 * Wraps your app to provide hand tracking state to all child components.
 * Use the useHandTrackingContext hook to access the tracking state.
 *
 * @example
 * ```tsx
 * import { HandTrackingProvider } from '@handtrack3d/react';
 *
 * function App() {
 *   return (
 *     <HandTrackingProvider config={{ maxNumHands: 2 }}>
 *       <YourApp />
 *     </HandTrackingProvider>
 *   );
 * }
 * ```
 */
export function HandTrackingProvider({
  children,
  config = {},
}: HandTrackingProviderProps) {
  const trackerRef = useRef<HandTracker | null>(null);
  const [hands, setHands] = useState<Hand[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize tracker on mount
  useEffect(() => {
    trackerRef.current = new HandTracker(config);

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

  const updateConfig = useCallback((newConfig: Partial<MediaPipeConfig>) => {
    const tracker = trackerRef.current;
    if (tracker) {
      tracker.updateConfig(newConfig);
    }
  }, []);

  const value: HandTrackingContextValue = {
    hands,
    isTracking,
    error,
    startTracking,
    stopTracking,
    updateConfig,
  };

  return (
    <HandTrackingContext.Provider value={value}>
      {children}
    </HandTrackingContext.Provider>
  );
}

/**
 * Hook to access hand tracking context
 *
 * Must be used within a HandTrackingProvider.
 *
 * @returns Hand tracking context value
 * @throws Error if used outside of HandTrackingProvider
 *
 * @example
 * ```tsx
 * function HandDisplay() {
 *   const { hands, isTracking } = useHandTrackingContext();
 *
 *   return (
 *     <div>
 *       <p>Tracking: {isTracking ? 'Yes' : 'No'}</p>
 *       <p>Hands: {hands.length}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useHandTrackingContext(): HandTrackingContextValue {
  const context = useContext(HandTrackingContext);
  if (!context) {
    throw new Error(
      'useHandTrackingContext must be used within a HandTrackingProvider'
    );
  }
  return context;
}
