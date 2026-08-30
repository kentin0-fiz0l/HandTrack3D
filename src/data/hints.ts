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
    id: 'settings-shortcut',
    message: 'Press S to open settings',
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
    message: 'Press B for Build Mode - precise object placement',
    position: 'bottom-right',
    trigger: {
      type: 'objects-spawned',
      count: 5, // After spawning 5 objects
    },
    icon: '🏗️',
    dismissible: true,
  },

  {
    id: 'object-edit',
    message: 'Right-click on objects to edit their properties',
    position: 'bottom-left',
    trigger: {
      type: 'gesture-count',
      gesture: 'grab',
      count: 3, // After 3 successful grabs
    },
    icon: '✏️',
    dismissible: true,
  },

  {
    id: 'scene-templates',
    message: 'Explore scene templates for quick setups',
    position: 'top-left',
    trigger: {
      type: 'objects-spawned',
      count: 3, // After spawning 3 objects
    },
    icon: '🎨',
    dismissible: true,
  },

  {
    id: 'save-scene',
    message: 'Save your scene! It will be restored next time.',
    position: 'top-right',
    trigger: {
      type: 'objects-spawned',
      count: 10, // After spawning 10 objects
    },
    icon: '💾',
    dismissible: true,
  },

  {
    id: 'clap-gesture',
    message: 'Try the clap gesture! Bring your hands together.',
    position: 'bottom-center',
    trigger: {
      type: 'gesture-count',
      gesture: 'pinch',
      count: 10, // After 10 gestures total
    },
    icon: '👏',
    dismissible: true,
  },

  {
    id: 'two-hand-scale',
    message: 'Use two hands for scaling objects',
    position: 'top-center',
    trigger: {
      type: 'gesture-count',
      gesture: 'pinch',
      count: 15, // After using pinch 15x
    },
    icon: '🤲',
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

  {
    id: 'performance-monitor',
    message: 'Performance Monitor shows FPS and tracking latency',
    position: 'bottom-right',
    trigger: {
      type: 'timer',
      delay: 60000, // After 1 minute
    },
    icon: '⚡',
    dismissible: true,
  },

  {
    id: 'keyboard-shortcuts',
    message: 'Press ? to see all keyboard shortcuts',
    position: 'bottom-center',
    trigger: {
      type: 'session-count',
      count: 3, // After 3 sessions
    },
    icon: '⌨️',
    dismissible: true,
  },

  {
    id: 'webcam-toggle',
    message: 'Toggle webcam preview with the camera icon',
    position: 'bottom-left',
    trigger: {
      type: 'timer',
      delay: 45000, // After 45 seconds
    },
    icon: '📹',
    dismissible: true,
  },

  {
    id: 'depth-debug',
    message: 'Press D to toggle depth breakdown (debug)',
    position: 'top-right',
    trigger: {
      type: 'gesture-count',
      gesture: 'grab',
      count: 10, // After 10 grabs
    },
    icon: '🔍',
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
