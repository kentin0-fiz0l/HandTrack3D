import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useWebcam } from '../hooks/useWebcam';
import { useHandTracking } from '../hooks/useHandTracking';
import type { Hand } from '@handtrack3d/core';

/**
 * Props for WebcamView component
 */
export interface WebcamViewProps {
  /** Callback when hands are detected */
  onHands?: (hands: Hand[]) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Whether to mirror the video (default: true) */
  mirrored?: boolean;
  /** Video width */
  width?: number;
  /** Video height */
  height?: number;
  /** Max number of hands to detect */
  maxHands?: number;
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

/**
 * WebcamView component
 *
 * Simple component that displays webcam feed with hand tracking.
 * Automatically handles webcam access and hand detection.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <WebcamView
 *       onHands={(hands) => console.log(`Detected ${hands.length} hands`)}
 *       mirrored={true}
 *       maxHands={2}
 *     />
 *   );
 * }
 * ```
 */
export function WebcamView({
  onHands,
  onError,
  mirrored = true,
  width = 640,
  height = 480,
  maxHands = 2,
  className,
  style,
}: WebcamViewProps) {
  const { videoRef, isReady, error: webcamError } = useWebcam({
    width: width * 2, // Request higher resolution
    height: height * 2,
  });

  const {
    hands,
    error: trackingError,
    startTracking,
  } = useHandTracking({
    maxNumHands: maxHands,
  });

  // Start tracking when webcam is ready
  useEffect(() => {
    if (isReady && videoRef.current) {
      startTracking(videoRef.current);
    }
  }, [isReady, videoRef.current, startTracking]);

  // Call onHands callback when hands change
  useEffect(() => {
    if (onHands) {
      onHands(hands);
    }
  }, [hands, onHands]);

  // Call onError callback when errors occur
  useEffect(() => {
    const error = webcamError || trackingError;
    if (error && onError) {
      if (typeof webcamError === 'string') {
        onError(new Error(webcamError));
      } else if (trackingError) {
        onError(trackingError);
      }
    }
  }, [webcamError, trackingError, onError]);

  const videoStyle: CSSProperties = {
    width,
    height,
    transform: mirrored ? 'scaleX(-1)' : undefined,
    objectFit: 'cover',
    ...style,
  };

  return (
    <video
      ref={videoRef}
      className={className}
      style={videoStyle}
      autoPlay
      playsInline
      muted
    />
  );
}
