/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import { initializeMediaPipe, closeMediaPipe } from '@/services/mediapipeService';
import { useHandTrackingStore } from '@/stores/handTrackingStore';

// Camera utils loaded from CDN
declare global {
  interface Window {
    Camera: any;
  }
}

export function useHandTracking(
  videoElement: HTMLVideoElement | null,
  isReady: boolean
) {
  const cameraRef = useRef<any>(null);
  const updateHands = useHandTrackingStore((state) => state.updateHands);

  useEffect(() => {
    if (!videoElement || !isReady || !window.Camera) return;

    let active = true;

    async function init() {
      try {
        const hands = await initializeMediaPipe(updateHands);

        if (!active) return;

        const camera = new window.Camera(videoElement, {
          onFrame: async () => {
            if (videoElement && hands) {
              await hands.send({ image: videoElement });
            }
          },
          width: 1280,
          height: 720,
        });

        camera.start();
        cameraRef.current = camera;
      } catch (error) {
        console.error('Hand tracking initialization failed:', error);
      }
    }

    init();

    return () => {
      active = false;
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      closeMediaPipe();
      cameraRef.current = null;
    };
  }, [videoElement, isReady, updateHands]);
}
