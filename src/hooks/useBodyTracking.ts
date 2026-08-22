/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { usePoseTrackingStore } from '@/stores/poseTrackingStore';
import { useSettingsStore } from '@/stores/settingsStore';

// MediaPipe Pose is loaded via CDN script tag in index.html
declare global {
  interface Window {
    Pose: any;
  }
}

/**
 * Wait for MediaPipe Pose to load from CDN
 */
async function waitForPose(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Pose) {
      resolve();
      return;
    }

    const checkInterval = setInterval(() => {
      if (window.Pose) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error('MediaPipe Pose failed to load from CDN'));
    }, 10000);
  });
}

/**
 * Hook to initialize and manage MediaPipe Pose tracking for body context
 */
export function useBodyTracking(videoElement: HTMLVideoElement | null) {
  const poseRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const setPose = usePoseTrackingStore((state) => state.setPose);
  const setIsTracking = usePoseTrackingStore((state) => state.setIsTracking);
  const detectionConfidence = useSettingsStore((state) => state.detectionConfidence);
  const trackingConfidence = useSettingsStore((state) => state.trackingConfidence);

  useEffect(() => {
    if (!videoElement) return;

    console.log('[Pose] Waiting for MediaPipe Pose to load...');

    // Wait for MediaPipe Pose to load, then initialize
    waitForPose()
      .then(() => {
        if (!videoElement) return;

        console.log('[Pose] MediaPipe Pose loaded, initializing...');

        // Initialize MediaPipe Pose
        const pose = new window.Pose({
          locateFile: (file: string) => {
            const url = `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            console.log('[Pose] Loading file:', url);
            return url;
          },
        });

        pose.setOptions({
          modelComplexity: 1, // 0=lite, 1=full, 2=heavy
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: detectionConfidence,
          minTrackingConfidence: trackingConfidence,
        });

        pose.onResults((results: any) => {
          if (results.poseLandmarks) {
            setPose({
              landmarks: results.poseLandmarks.map((lm: any) => ({
                x: lm.x,
                y: lm.y,
                z: lm.z ?? 0,
                visibility: lm.visibility,
              })),
              timestamp: Date.now(),
            });
            setIsTracking(true);
          } else {
            setPose(null);
            setIsTracking(false);
          }
        });

        poseRef.current = pose;
        setIsReady(true);
        console.log('[Pose] Pose tracking initialized successfully');

        // Send video frames to pose tracking
        const sendFrame = async () => {
          if (videoElement && videoElement.readyState >= 2 && poseRef.current) {
            try {
              await poseRef.current.send({ image: videoElement });
            } catch (error) {
              console.warn('Pose tracking frame error:', error);
            }
          }
          requestAnimationFrame(sendFrame);
        };

        sendFrame();
      })
      .catch((error) => {
        console.error('Failed to initialize MediaPipe Pose:', error);
        setPose(null);
        setIsTracking(false);
      });

    return () => {
      if (poseRef.current) {
        try {
          poseRef.current.close();
        } catch (error) {
          console.warn('Error closing pose tracker:', error);
        }
        poseRef.current = null;
      }
      setPose(null);
      setIsTracking(false);
      setIsReady(false);
    };
  }, [videoElement, setPose, setIsTracking, detectionConfidence, trackingConfidence]);

  return poseRef.current;
}
