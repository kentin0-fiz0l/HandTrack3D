import { create } from 'zustand';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseData {
  landmarks: PoseLandmark[];
  timestamp: number;
}

interface PoseTrackingStore {
  pose: PoseData | null;
  isTracking: boolean;
  setPose: (pose: PoseData | null) => void;
  setIsTracking: (isTracking: boolean) => void;
}

export const usePoseTrackingStore = create<PoseTrackingStore>((set) => ({
  pose: null,
  isTracking: false,
  setPose: (pose) => set({ pose }),
  setIsTracking: (isTracking) => set({ isTracking }),
}));

// MediaPipe Pose landmark indices
export const PoseLandmarks = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
} as const;
