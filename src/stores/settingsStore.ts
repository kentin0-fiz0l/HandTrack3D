import { create } from 'zustand';

interface SettingsStore {
  // Gesture Settings
  pinchThreshold: number; // 0.03 - 0.08 (lower = closer fingers needed)
  fingerExtensionAngle: number; // 140 - 175 (higher = more strict "open hand")
  fistCurlThreshold: number; // 0.10 - 0.20 (lower = tighter fist required)
  pointExtensionAngle: number; // 140 - 175 (higher = stricter point detection)
  swipeVelocityThreshold: number; // 0.3 - 1.0 (minimum velocity to trigger swipe)
  swipeCooldown: number; // 300 - 1000ms (cooldown between swipes)

  // Physics Settings
  gravityEnabled: boolean; // Toggle physics on/off
  grabRange: number; // 1.0 - 3.0 (how close hand must be to grab)
  restitution: number; // 0.0 - 1.0 (bounciness)
  friction: number; // 0.0 - 1.0 (surface friction)

  // Hand Tracking Settings
  maxHands: number; // 1 - 2 (number of hands to detect)
  detectionConfidence: number; // 0.3 - 0.9 (higher = fewer false positives)
  trackingConfidence: number; // 0.3 - 0.9 (higher = more stable tracking)

  // Visual Settings
  showTrails: boolean; // Toggle visual trails on hand cursors
  showWebcam: boolean; // Toggle debug webcam preview
  showHandSkeleton: boolean; // Toggle hand skeleton visualization
  showPerformance: boolean; // Toggle performance monitoring dashboard

  // Actions
  reset: () => void;
  updateGestureSetting: <K extends keyof Pick<SettingsStore, 'pinchThreshold' | 'fingerExtensionAngle' | 'fistCurlThreshold' | 'pointExtensionAngle' | 'swipeVelocityThreshold' | 'swipeCooldown'>>(
    key: K,
    value: SettingsStore[K]
  ) => void;
  updatePhysicsSetting: <K extends keyof Pick<SettingsStore, 'gravityEnabled' | 'grabRange' | 'restitution' | 'friction'>>(
    key: K,
    value: SettingsStore[K]
  ) => void;
  updateTrackingSetting: <K extends keyof Pick<SettingsStore, 'maxHands' | 'detectionConfidence' | 'trackingConfidence'>>(
    key: K,
    value: SettingsStore[K]
  ) => void;
  updateVisualSetting: <K extends keyof Pick<SettingsStore, 'showTrails' | 'showWebcam' | 'showHandSkeleton' | 'showPerformance'>>(
    key: K,
    value: SettingsStore[K]
  ) => void;
}

// Default values matching current hardcoded values
const DEFAULT_SETTINGS = {
  // Gestures
  pinchThreshold: 0.05,
  fingerExtensionAngle: 160,
  fistCurlThreshold: 0.15,
  pointExtensionAngle: 160,
  swipeVelocityThreshold: 0.5,
  swipeCooldown: 500,

  // Physics
  gravityEnabled: true,
  grabRange: 1.5,
  restitution: 0.5,
  friction: 0.7,

  // Tracking
  maxHands: 2,
  detectionConfidence: 0.5,
  trackingConfidence: 0.5,

  // Visual
  showTrails: true,
  showWebcam: false,
  showHandSkeleton: true,
  showPerformance: true,
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...DEFAULT_SETTINGS,

  reset: () => set(DEFAULT_SETTINGS),

  updateGestureSetting: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
    })),

  updatePhysicsSetting: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
    })),

  updateTrackingSetting: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
    })),

  updateVisualSetting: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
    })),
}));

// Helper function to get settings outside of React components
export const getSettings = () => useSettingsStore.getState();
