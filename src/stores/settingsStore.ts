import { create } from 'zustand';
import type { SettingsPreset } from '@/data/settingsPresets';

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
  showGrabRange: boolean; // Toggle grab range visualization spheres
  showPoseSkeleton: boolean; // Toggle pose/body skeleton overlay (MoveNet)
  showDepthBreakdown: boolean; // Toggle depth calculation debug panel
  showGestureWidget: boolean; // Toggle real-time gesture status widget
  compactGestureWidget: boolean; // Use compact mode for gesture widget

  // Performance Settings
  poseTrackingEnabled: boolean; // Toggle pose tracking (disable for better performance)

  // Current preset (null if custom)
  currentPreset: string | null;

  // Actions
  reset: () => void;
  applyPreset: (preset: SettingsPreset) => void;
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
  updateVisualSetting: <K extends keyof Pick<SettingsStore, 'showTrails' | 'showWebcam' | 'showHandSkeleton' | 'showPerformance' | 'showGrabRange' | 'showPoseSkeleton' | 'showDepthBreakdown' | 'showGestureWidget' | 'compactGestureWidget'>>(
    key: K,
    value: SettingsStore[K]
  ) => void;
  updatePerformanceSetting: <K extends keyof Pick<SettingsStore, 'poseTrackingEnabled'>>(
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
  showGrabRange: true,
  showPoseSkeleton: false, // Debug: pose skeleton overlay
  showDepthBreakdown: false, // Debug: depth calculation panel
  showGestureWidget: true, // Show real-time gesture status widget
  compactGestureWidget: false, // Use compact mode for gesture widget

  // Performance
  poseTrackingEnabled: true, // Enable pose tracking (disable for better performance on slow devices)
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...DEFAULT_SETTINGS,
  currentPreset: 'balanced', // Default preset

  reset: () => set({ ...DEFAULT_SETTINGS, currentPreset: 'balanced' }),

  applyPreset: (preset: SettingsPreset) =>
    set({
      ...preset.settings,
      // Visual settings are not affected by presets
      showTrails: true,
      showWebcam: false,
      showHandSkeleton: true,
      showPerformance: true,
      showGrabRange: true,
      showPoseSkeleton: false,
      showDepthBreakdown: false,
      showGestureWidget: true,
      compactGestureWidget: false,
      // Physics boolean settings not affected by presets
      gravityEnabled: true,
      // Tracking maxHands not affected by presets
      maxHands: 2,
      currentPreset: preset.id,
    }),

  updateGestureSetting: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
      currentPreset: null, // Mark as custom when manually changed
    })),

  updatePhysicsSetting: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
      currentPreset: null, // Mark as custom when manually changed
    })),

  updateTrackingSetting: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
      currentPreset: null, // Mark as custom when manually changed
    })),

  updateVisualSetting: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
      // Visual settings don't affect preset status
    })),

  updatePerformanceSetting: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
      // Performance settings don't affect preset status
    })),
}));

// Helper function to get settings outside of React components
export const getSettings = () => useSettingsStore.getState();
