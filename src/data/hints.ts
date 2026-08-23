/**
 * First-Time User Hints
 * 
 * Smart contextual hints that appear once based on user behavior.
 * Help users discover hidden features without being overwhelming.
 */

export type HintTriggerType = 
  | 'timer'           // Show after X seconds
  | 'event'           // Show after event occurs X times
  | 'gesture-count'   // Show after gesture detected X times
  | 'objects-spawned' // Show after X objects spawned
  | 'session-count';  // Show after X sessions

export interface HintTrigger {
  type: HintTriggerType;
  delay?: number;          // For 'timer' type (milliseconds)
  event?: string;          // For 'event' type
  gesture?: string;        // For 'gesture-count' type
  count?: number;          // For event/gesture/objects/session types
}

export interface Hint {
  id: string;
  message: string;
  position: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  trigger: HintTrigger;
  icon?: string;
  dismissible?: boolean;
}

export const HINTS: Hint[] = [
  {
    id: 'status-panel-shortcut',
    message: 'Press H to toggle the status panel',
    position: 'top-right',
    trigger: {
      type: 'timer',
      delay: 10000, // After 10 seconds
    },
    icon: '💡',
    dismissible: true,
  },
  
  {
    id: 'camera-pan',
    message: 'Right-click + drag to pan the camera view',
    position: 'bottom-center',
    trigger: {
      type: 'event',
      event: 'camera-rotated',
      count: 3, // After 3 camera rotations
    },
    icon: '🎥',
    dismissible: true,
  },
  
  {
    id: 'try-swipe',
    message: 'Try a swipe gesture! Quickly move your hand left or right.',
    position: 'top-left',
    trigger: {
      type: 'gesture-count',
      gesture: 'pinch',
      count: 5, // After 5 successful pinches
    },
    icon: '👋',
    dismissible: true,
  },
  
  {
    id: 'settings-presets',
    message: 'Tip: Try the Settings Presets (Responsive/Balanced/Precise) for quick configuration',
    position: 'top-center',
    trigger: {
      type: 'timer',
      delay: 30000, // After 30 seconds
    },
    icon: '⚙️',
    dismissible: true,
  },
  
  {
    id: 'build-mode',
    message: 'Press B to toggle Build Mode for precise object placement',
    position: 'bottom-right',
    trigger: {
      type: 'objects-spawned',
      count: 3, // After spawning 3 objects manually
    },
    icon: '🏗️',
    dismissible: true,
  },
  
  {
    id: 'gesture-widget',
    message: 'The gesture widget shows real-time detection confidence. Press G for compact mode.',
    position: 'top-left',
    trigger: {
      type: 'session-count',
      count: 2, // After 2 sessions
    },
    icon: '📊',
    dismissible: true,
  },
];

/**
 * Get hint by ID
 */
export function getHint(id: string): Hint | undefined {
  return HINTS.find(hint => hint.id === id);
}

/**
 * Get all hints
 */
export function getAllHints(): Hint[] {
  return HINTS;
}
