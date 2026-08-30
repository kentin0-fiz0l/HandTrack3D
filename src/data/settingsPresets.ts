/**
 * Settings Presets for HandTrack3D
 * 
 * Three predefined configurations optimized for different use cases:
 * - Responsive: Low thresholds, fast gesture detection
 * - Balanced: Default settings, optimized for most users
 * - Precise: High thresholds, stable/accurate detection
 */

export interface SettingsPreset {
  id: string;
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

export const SETTINGS_PRESETS: Record<string, SettingsPreset> = {
  responsive: {
    id: 'responsive',
    name: 'Responsive',
    description: 'Low thresholds, fast gesture detection. Best for quick interactions and demos.',
    icon: '⚡',
    settings: {
      // Gesture Settings - Lower thresholds = faster detection
      pinchThreshold: 0.03, // Very sensitive (fingers barely touching)
      fingerExtensionAngle: 150, // Easier to trigger open hand
      fistCurlThreshold: 0.10, // Loose fist acceptable
      pointExtensionAngle: 150, // Easier to trigger point
      swipeVelocityThreshold: 0.3, // Low velocity needed for swipes
      swipeCooldown: 300, // Fast repeat swipes (300ms)

      // Physics - Larger grab range, more responsive
      grabRange: 2.0, // Can grab from farther away
      restitution: 0.6, // Bouncier objects
      friction: 0.5, // Lower friction for smoother movement

      // Tracking - Lower confidence for faster response
      detectionConfidence: 0.4, // Accept lower quality hands
      trackingConfidence: 0.4, // Less strict tracking
    },
  },

  balanced: {
    id: 'balanced',
    name: 'Balanced',
    description: 'Default settings optimized for most use cases. Good balance of speed and accuracy.',
    icon: '⚖️',
    settings: {
      // Gesture Settings - Moderate thresholds
      pinchThreshold: 0.05, // Standard pinch distance
      fingerExtensionAngle: 160, // Balanced open hand
      fistCurlThreshold: 0.15, // Standard fist
      pointExtensionAngle: 160, // Balanced point
      swipeVelocityThreshold: 0.5, // Moderate swipe velocity
      swipeCooldown: 500, // Standard cooldown (500ms)

      // Physics - Standard settings
      grabRange: 1.5, // Moderate grab distance
      restitution: 0.5, // Normal bounciness
      friction: 0.7, // Realistic friction

      // Tracking - Standard confidence
      detectionConfidence: 0.5, // Standard quality
      trackingConfidence: 0.5, // Standard tracking
    },
  },

  precise: {
    id: 'precise',
    name: 'Precise',
    description: 'High thresholds, stable detection. Best for accuracy and minimizing false positives.',
    icon: '🎯',
    settings: {
      // Gesture Settings - Higher thresholds = more precise
      pinchThreshold: 0.07, // Requires clear pinch
      fingerExtensionAngle: 170, // Very strict open hand (fingers must be straight)
      fistCurlThreshold: 0.20, // Tight fist required
      pointExtensionAngle: 170, // Very strict point (index must be straight)
      swipeVelocityThreshold: 0.8, // High velocity needed (reduces accidental swipes)
      swipeCooldown: 1000, // Slower repeat (1000ms prevents accidental swipes)

      // Physics - Smaller grab range, more realistic
      grabRange: 1.2, // Must be close to grab
      restitution: 0.3, // Less bouncy (more realistic)
      friction: 0.9, // High friction for stability

      // Tracking - High confidence for accuracy
      detectionConfidence: 0.7, // Only high-quality hands
      trackingConfidence: 0.7, // Strict tracking (more stable)
    },
  },
};

/**
 * Get preset by ID
 */
export function getPreset(id: string): SettingsPreset | undefined {
  return SETTINGS_PRESETS[id];
}

/**
 * Get preset by ID (alias for compatibility with tests)
 */
export function getPresetById(id: string): SettingsPreset | undefined {
  return getPreset(id);
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

/**
 * Get all presets as array
 */
export function getAllPresets(): SettingsPreset[] {
  return Object.values(SETTINGS_PRESETS);
}

/**
 * Get preset display name with icon
 */
export function getPresetDisplayName(preset: SettingsPreset): string {
  return `${preset.icon} ${preset.name}`;
}

/**
 * Alias for backward compatibility
 */
export const PRESETS = getAllPresets();
