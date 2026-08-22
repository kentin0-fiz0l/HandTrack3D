/**
 * Settings presets for quick configuration
 */

export interface SettingsPreset {
  id: 'responsive' | 'balanced' | 'precise';
  name: string;
  description: string;
  icon: string;
  settings: {
    // Gesture Settings
    pinchThreshold: number;
    fingerExtensionAngle: number;
    fistCurlThreshold: number;
    pointExtensionAngle: number;
    swipeVelocityThreshold: number;
    swipeCooldown: number;
    // Physics Settings
    grabRange: number;
    restitution: number;
    friction: number;
    // Tracking Settings
    detectionConfidence: number;
    trackingConfidence: number;
  };
}

export const PRESETS: SettingsPreset[] = [
  {
    id: 'responsive',
    name: 'Responsive',
    description: 'Low thresholds for quick, easy interactions',
    icon: '⚡',
    settings: {
      // Gestures - Lower thresholds for easier detection
      pinchThreshold: 0.03,
      fingerExtensionAngle: 150,
      fistCurlThreshold: 0.12,
      pointExtensionAngle: 150,
      swipeVelocityThreshold: 0.3,
      swipeCooldown: 300,
      // Physics - Larger grab range
      grabRange: 2.0,
      restitution: 0.5,
      friction: 0.7,
      // Tracking - Lower confidence for more detections
      detectionConfidence: 0.4,
      trackingConfidence: 0.4,
    },
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Default settings for general use',
    icon: '⚖️',
    settings: {
      // Gestures - Moderate thresholds
      pinchThreshold: 0.05,
      fingerExtensionAngle: 160,
      fistCurlThreshold: 0.15,
      pointExtensionAngle: 160,
      swipeVelocityThreshold: 0.5,
      swipeCooldown: 500,
      // Physics - Medium grab range
      grabRange: 1.5,
      restitution: 0.5,
      friction: 0.7,
      // Tracking - Balanced confidence
      detectionConfidence: 0.5,
      trackingConfidence: 0.5,
    },
  },
  {
    id: 'precise',
    name: 'Precise',
    description: 'High thresholds for accurate, controlled interactions',
    icon: '🎯',
    settings: {
      // Gestures - Higher thresholds for stricter detection
      pinchThreshold: 0.07,
      fingerExtensionAngle: 170,
      fistCurlThreshold: 0.18,
      pointExtensionAngle: 170,
      swipeVelocityThreshold: 0.7,
      swipeCooldown: 700,
      // Physics - Smaller grab range
      grabRange: 1.2,
      restitution: 0.5,
      friction: 0.7,
      // Tracking - Higher confidence for stability
      detectionConfidence: 0.7,
      trackingConfidence: 0.7,
    },
  },
];

/**
 * Get preset by ID
 */
export function getPresetById(id: string): SettingsPreset | undefined {
  return PRESETS.find((preset) => preset.id === id);
}

/**
 * Check if current settings match a preset
 */
export function matchesPreset(
  currentSettings: SettingsPreset['settings'],
  preset: SettingsPreset
): boolean {
  const keys = Object.keys(preset.settings) as Array<keyof SettingsPreset['settings']>;
  return keys.every((key) => currentSettings[key] === preset.settings[key]);
}
