/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Hand, HandLandmark } from '@/types/hand.types';
import { getSettings } from '@/stores/settingsStore';

// MediaPipe Hands is loaded via CDN script tag in index.html
declare global {
  interface Window {
    Hands: any;
  }
}

let handsInstance: any = null;

export async function waitForMediaPipe(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Hands) {
      resolve();
      return;
    }

    const checkInterval = setInterval(() => {
      if (window.Hands) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error('MediaPipe failed to load from CDN'));
    }, 10000);
  });
}

export async function initializeMediaPipe(
  onResults: (hands: Hand[]) => void
): Promise<any> {
  // Wait for MediaPipe to load from CDN
  await waitForMediaPipe();

  if (handsInstance) {
    handsInstance.close();
  }

  handsInstance = new window.Hands({
    locateFile: (file: string) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    },
  });

  // Get settings from store
  const settings = getSettings();

  handsInstance.setOptions({
    maxNumHands: settings.maxHands,
    modelComplexity: 1,
    minDetectionConfidence: settings.detectionConfidence,
    minTrackingConfidence: settings.trackingConfidence,
  });

  handsInstance.onResults((results: any) => {
    const hands: Hand[] = [];

    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i].map(
          (lm: any): HandLandmark => ({
            x: lm.x,
            y: lm.y,
            z: lm.z ?? 0,
          })
        );

        const worldLandmarks = results.multiHandWorldLandmarks?.[i]?.map(
          (lm: any): HandLandmark => ({
            x: lm.x,
            y: lm.y,
            z: lm.z ?? 0,
          })
        ) ?? landmarks;

        // Flip handedness because webcam is mirrored
        const rawHandedness = results.multiHandedness[i].label as 'Left' | 'Right';
        const handedness = rawHandedness === 'Left' ? 'Right' : 'Left';

        hands.push({
          id: `hand-${handedness.toLowerCase()}-${i}`,
          handedness,
          landmarks,
          worldLandmarks,
        });
      }
    }

    onResults(hands);
  });

  return handsInstance;
}

export function closeMediaPipe() {
  if (handsInstance) {
    handsInstance.close();
    handsInstance = null;
  }
}

// Update MediaPipe options when tracking settings change
export function updateMediaPipeOptions() {
  if (!handsInstance) {
    return;
  }

  const settings = getSettings();

  handsInstance.setOptions({
    maxNumHands: settings.maxHands,
    modelComplexity: 1,
    minDetectionConfidence: settings.detectionConfidence,
    minTrackingConfidence: settings.trackingConfidence,
  });
}
