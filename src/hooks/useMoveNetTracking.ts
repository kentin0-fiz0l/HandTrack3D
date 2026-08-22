/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { usePoseTrackingStore } from '@/stores/poseTrackingStore';
import { useSettingsStore } from '@/stores/settingsStore';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

/**
 * Hook to initialize and manage MoveNet pose tracking for body context
 * Uses TensorFlow.js MoveNet model instead of MediaPipe Pose
 */
export function useMoveNetTracking(videoElement: HTMLVideoElement | null) {
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const [isReady, setIsReady] = useState(false);
  const setPose = usePoseTrackingStore((state) => state.setPose);
  const setIsTracking = usePoseTrackingStore((state) => state.setIsTracking);
  const setError = usePoseTrackingStore((state) => state.setError);
  const setInitializing = usePoseTrackingStore((state) => state.setInitializing);
  const detectionConfidence = useSettingsStore((state) => state.detectionConfidence);

  useEffect(() => {
    if (!videoElement) return;

    let rafId: number;
    let isActive = true;

    console.log('[MoveNet] Initializing pose detector...');
    setInitializing(true);

    // Initialize MoveNet detector
    const initializeDetector = async () => {
      try {
        // Set backend to WebGL explicitly BEFORE calling ready()
        // This ensures TensorFlow doesn't try to initialize webgpu first
        await tf.setBackend('webgl');

        // Wait for TensorFlow.js backend to be ready
        await tf.ready();

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            minPoseScore: detectionConfidence,
          }
        );

        if (!isActive) {
          detector.dispose();
          return;
        }

        detectorRef.current = detector;
        setIsReady(true);
        setInitializing(false);
        console.log('[MoveNet] Pose detector initialized successfully');

        // Start detection loop with FPS decoupling
        let frameCount = 0;
        const POSE_FRAME_SKIP = 3; // Run every 3rd frame (30 FPS → 10 FPS)

        const detect = async () => {
          if (!isActive || !detectorRef.current || !videoElement) return;

          frameCount++;

          try {
            // Only run pose estimation every POSE_FRAME_SKIP frames
            // This reduces CPU usage while maintaining smooth hand tracking
            if (frameCount % POSE_FRAME_SKIP === 0 && videoElement.readyState >= 2) {
              const poses = await detectorRef.current.estimatePoses(videoElement);

              if (poses.length > 0 && poses[0].keypoints) {
                const pose = poses[0];

                // MEMORY OPTIMIZATION: Only store the 6 keypoints needed for arm tracking
                // This reduces memory by 65% and speeds up state updates
                const armKeypoints = [5, 6, 7, 8, 9, 10]; // Shoulders, elbows, wrists

                // Create sparse array with only arm keypoints
                // This maintains original indices for coordinateMapping.ts compatibility
                const landmarks: any[] = new Array(17);
                pose.keypoints.forEach((kp, index) => {
                  if (armKeypoints.includes(index)) {
                    landmarks[index] = {
                      x: kp.x / videoElement.videoWidth,  // Normalize to 0-1
                      y: kp.y / videoElement.videoHeight, // Normalize to 0-1
                      z: 0, // MoveNet doesn't provide Z, we'll use 0
                      visibility: kp.score,
                    };
                  }
                });

                setPose({
                  landmarks,
                  timestamp: Date.now(),
                });
                setIsTracking(true);
              } else {
                setPose(null);
                setIsTracking(false);
              }
            }
            // On skipped frames, previous pose state is automatically reused
          } catch (error) {
            console.warn('[MoveNet] Detection error:', error);
            setError({
              message: 'Pose detection failed. Retrying...',
              code: 'DETECTION_ERROR',
              timestamp: Date.now(),
              recoverable: true,
            });
          }

          if (isActive) {
            rafId = requestAnimationFrame(detect);
          }
        };

        detect();
      } catch (error) {
        console.error('[MoveNet] Failed to initialize pose detector:', error);
        setInitializing(false);
        setError({
          message: error instanceof Error ? error.message : 'Failed to initialize pose tracking',
          code: 'INITIALIZATION_ERROR',
          timestamp: Date.now(),
          recoverable: true,
        });
        setPose(null);
        setIsTracking(false);
      }
    };

    initializeDetector();

    return () => {
      isActive = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (detectorRef.current) {
        detectorRef.current.dispose();
        detectorRef.current = null;
      }
      setPose(null);
      setIsTracking(false);
      setIsReady(false);
      console.log('[MoveNet] Pose detector disposed');
    };
  }, [videoElement, setPose, setIsTracking, detectionConfidence]);

  return detectorRef.current;
}
