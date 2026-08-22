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

// MoveNet keypoint indices (COCO format - 17 keypoints)
// Note: MoveNet uses COCO format which has fewer keypoints than MediaPipe
export const PoseLandmarks = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
} as const;
