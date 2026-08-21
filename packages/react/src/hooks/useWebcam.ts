import { useEffect, useRef, useState } from 'react';

/**
 * Options for webcam hook
 */
export interface UseWebcamOptions {
  /** Ideal video width */
  width?: number;
  /** Ideal video height */
  height?: number;
  /** Camera facing mode */
  facingMode?: 'user' | 'environment';
}

/**
 * Return type for useWebcam hook
 */
export interface UseWebcamReturn {
  /** Reference to the video element */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Whether the webcam is ready */
  isReady: boolean;
  /** Any error that occurred */
  error: string | null;
  /** MediaStream if available */
  stream: MediaStream | null;
}

/**
 * Hook to access and manage webcam stream
 *
 * @param options - Webcam configuration options
 * @returns Webcam state and video reference
 *
 * @example
 * ```tsx
 * function App() {
 *   const { videoRef, isReady, error } = useWebcam({
 *     width: 1280,
 *     height: 720
 *   });
 *
 *   if (error) return <div>Error: {error}</div>;
 *   if (!isReady) return <div>Loading webcam...</div>;
 *
 *   return <video ref={videoRef} />;
 * }
 * ```
 */
export function useWebcam(options: UseWebcamOptions = {}): UseWebcamReturn {
  const {
    width = 1280,
    height = 720,
    facingMode = 'user',
  } = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function initCamera() {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: width },
            height: { ideal: height },
            facingMode,
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsReady(true);
          };
        }

        setStream(currentStream);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to access webcam';
        setError(errorMessage);
        console.error('Webcam error:', err);
      }
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      setIsReady(false);
      setStream(null);
    };
  }, [width, height, facingMode]);

  return { videoRef, isReady, error, stream };
}
