/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Hand, HandLandmark } from '../types/hand';

/**
 * MediaPipe hand tracking configuration
 */
export interface MediaPipeConfig {
  /** Maximum number of hands to detect (1-2) */
  maxNumHands?: number;
  /** Model complexity (0-1, higher = more accurate but slower) */
  modelComplexity?: number;
  /** Minimum detection confidence (0-1) */
  minDetectionConfidence?: number;
  /** Minimum tracking confidence (0-1) */
  minTrackingConfidence?: number;
  /** CDN base URL for MediaPipe files */
  cdnBaseUrl?: string;
}

/**
 * Default MediaPipe configuration
 */
export const DEFAULT_MEDIAPIPE_CONFIG: Required<MediaPipeConfig> = {
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
  cdnBaseUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
};

/**
 * Callback type for hand tracking results
 */
export type HandTrackingCallback = (hands: Hand[]) => void;

/**
 * Callback type for errors
 */
export type ErrorCallback = (error: Error) => void;

/**
 * MediaPipe Hands API (loaded from CDN)
 */
declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

/**
 * Framework-agnostic hand tracker using MediaPipe
 */
export class HandTracker {
  private handsInstance: any = null;
  private cameraInstance: any = null;
  private config: Required<MediaPipeConfig>;
  private onResultsCallback?: HandTrackingCallback;
  private onErrorCallback?: ErrorCallback;
  private isInitialized = false;

  /**
   * Create a new hand tracker
   * @param config - MediaPipe configuration
   */
  constructor(config: MediaPipeConfig = {}) {
    this.config = { ...DEFAULT_MEDIAPIPE_CONFIG, ...config };
  }

  /**
   * Wait for MediaPipe to load from CDN
   * @returns Promise that resolves when MediaPipe is ready
   */
  private async waitForMediaPipe(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.Hands) {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        if (typeof window !== 'undefined' && window.Hands) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('MediaPipe failed to load from CDN. Make sure to include the MediaPipe script tag.'));
      }, 10000);
    });
  }

  /**
   * Initialize MediaPipe hand tracking
   * @param onResults - Callback for hand tracking results
   * @param onError - Optional callback for errors
   * @returns Promise that resolves when initialized
   */
  async initialize(
    onResults: HandTrackingCallback,
    onError?: ErrorCallback
  ): Promise<void> {
    try {
      this.onResultsCallback = onResults;
      this.onErrorCallback = onError;

      // Wait for MediaPipe to load from CDN
      await this.waitForMediaPipe();

      // Close existing instance if any
      if (this.handsInstance) {
        this.handsInstance.close();
      }

      // Create new MediaPipe Hands instance
      this.handsInstance = new window.Hands({
        locateFile: (file: string) => {
          return `${this.config.cdnBaseUrl}/${file}`;
        },
      });

      // Configure options
      this.handsInstance.setOptions({
        maxNumHands: this.config.maxNumHands,
        modelComplexity: this.config.modelComplexity,
        minDetectionConfidence: this.config.minDetectionConfidence,
        minTrackingConfidence: this.config.minTrackingConfidence,
      });

      // Set up results callback
      this.handsInstance.onResults((results: any) => {
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

        if (this.onResultsCallback) {
          this.onResultsCallback(hands);
        }
      });

      this.isInitialized = true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.onErrorCallback) {
        this.onErrorCallback(err);
      }
      throw err;
    }
  }

  /**
   * Start tracking with a video element
   * @param videoElement - HTML video element (webcam feed)
   * @param options - Optional camera options
   * @returns Promise that resolves when camera starts
   */
  async startCamera(
    videoElement: HTMLVideoElement,
    options: { width?: number; height?: number } = {}
  ): Promise<void> {
    if (!this.isInitialized || !this.handsInstance) {
      throw new Error('HandTracker not initialized. Call initialize() first.');
    }

    if (typeof window === 'undefined' || !window.Camera) {
      throw new Error('MediaPipe Camera utility not loaded. Make sure to include the camera_utils script tag.');
    }

    try {
      // Create camera instance
      this.cameraInstance = new window.Camera(videoElement, {
        onFrame: async () => {
          if (videoElement && this.handsInstance) {
            await this.handsInstance.send({ image: videoElement });
          }
        },
        width: options.width ?? 1280,
        height: options.height ?? 720,
      });

      // Start camera
      await this.cameraInstance.start();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.onErrorCallback) {
        this.onErrorCallback(err);
      }
      throw err;
    }
  }

  /**
   * Process a single image or video frame
   * @param imageOrVideo - Image or video element to process
   * @returns Promise that resolves when processing is complete
   */
  async processFrame(imageOrVideo: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<void> {
    if (!this.isInitialized || !this.handsInstance) {
      throw new Error('HandTracker not initialized. Call initialize() first.');
    }

    try {
      await this.handsInstance.send({ image: imageOrVideo });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.onErrorCallback) {
        this.onErrorCallback(err);
      }
      throw err;
    }
  }

  /**
   * Update tracking configuration
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<MediaPipeConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.handsInstance) {
      this.handsInstance.setOptions({
        maxNumHands: this.config.maxNumHands,
        modelComplexity: this.config.modelComplexity,
        minDetectionConfidence: this.config.minDetectionConfidence,
        minTrackingConfidence: this.config.minTrackingConfidence,
      });
    }
  }

  /**
   * Get current configuration
   * @returns Current MediaPipe configuration
   */
  getConfig(): Required<MediaPipeConfig> {
    return { ...this.config };
  }

  /**
   * Stop the camera
   */
  stopCamera(): void {
    if (this.cameraInstance) {
      this.cameraInstance.stop();
      this.cameraInstance = null;
    }
  }

  /**
   * Close and clean up MediaPipe instance
   */
  close(): void {
    this.stopCamera();

    if (this.handsInstance) {
      this.handsInstance.close();
      this.handsInstance = null;
    }

    this.isInitialized = false;
    this.onResultsCallback = undefined;
    this.onErrorCallback = undefined;
  }

  /**
   * Check if tracker is initialized
   * @returns True if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}
