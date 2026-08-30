import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Hints Store
 *
 * Tracks user actions and hint display state to show contextual hints
 * at the right time without being overwhelming.
 */

interface HintsStore {
  // User action counters
  cameraRotations: number;
  gestureCount: Record<string, number>; // { pinch: 5, open: 3, ... }
  objectsSpawned: number;
  sessionCount: number;

  // Shown hints tracking
  shownHints: Set<string>; // IDs of hints already shown
  activeHints: Set<string>; // IDs of currently visible hints

  // Actions
  incrementCameraRotations: () => void;
  incrementGestureCount: (gesture: string) => void;
  incrementObjectsSpawned: () => void;
  incrementSessionCount: () => void;

  markHintAsShown: (hintId: string) => void;
  addActiveHint: (hintId: string) => void;
  removeActiveHint: (hintId: string) => void;

  // Helper methods
  trackEvent: (eventName: string, count?: number) => void;
  shouldShowHint: (hintId: string) => boolean;

  resetHints: () => void;
}

// Migrate old localStorage keys to new format
const migrateOldHintsData = () => {
  const oldSessionCount = localStorage.getItem('hints_session_count');
  const oldShownHints = localStorage.getItem('hints_shown');

  if (oldSessionCount || oldShownHints) {
    const migrated = {
      sessionCount: oldSessionCount ? parseInt(oldSessionCount, 10) : 0,
      shownHints: oldShownHints ? new Set<string>(JSON.parse(oldShownHints)) : new Set<string>(),
    };

    // Clean up old keys
    localStorage.removeItem('hints_session_count');
    localStorage.removeItem('hints_shown');

    return migrated;
  }

  return null;
};

// Custom storage for Set serialization
const hintsStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    const parsed = JSON.parse(str);
    // Convert array back to Set for shownHints
    if (parsed.state?.shownHints) {
      parsed.state.shownHints = new Set(parsed.state.shownHints);
    }
    if (parsed.state?.activeHints) {
      parsed.state.activeHints = new Set(parsed.state.activeHints);
    }
    return parsed;
  },
  setItem: (name: string, value: any) => {
    const toStore = {
      ...value,
      state: {
        ...value.state,
        // Convert Set to array for JSON serialization
        shownHints: value.state.shownHints ? [...value.state.shownHints] : [],
        activeHints: value.state.activeHints ? [...value.state.activeHints] : [],
      },
    };
    localStorage.setItem(name, JSON.stringify(toStore));
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useHintsStore = create<HintsStore>()(
  persist(
    (set, get) => {
      // Try to migrate old data
      const migrated = migrateOldHintsData();

      return {
        // Initial state (or migrated state)
        cameraRotations: 0,
        gestureCount: {},
        objectsSpawned: 0,
        sessionCount: migrated?.sessionCount ?? 0,
        shownHints: migrated?.shownHints ?? new Set(),
        activeHints: new Set(),

      // Increment counters
      incrementCameraRotations: () =>
        set((state) => ({
          cameraRotations: state.cameraRotations + 1,
        })),

      incrementGestureCount: (gesture) =>
        set((state) => ({
          gestureCount: {
            ...state.gestureCount,
            [gesture]: (state.gestureCount[gesture] || 0) + 1,
          },
        })),

      incrementObjectsSpawned: () =>
        set((state) => ({
          objectsSpawned: state.objectsSpawned + 1,
        })),

      incrementSessionCount: () => set({ sessionCount: get().sessionCount + 1 }),

      // Hint display management
      markHintAsShown: (hintId) => {
        const newShownHints = new Set(get().shownHints);
        newShownHints.add(hintId);
        set({ shownHints: newShownHints });
      },

      addActiveHint: (hintId) =>
        set((state) => ({
          activeHints: new Set([...state.activeHints, hintId]),
        })),

      removeActiveHint: (hintId) => {
        const newActiveHints = new Set(get().activeHints);
        newActiveHints.delete(hintId);
        set({ activeHints: newActiveHints });
      },

      // Helper: Track generic events
      trackEvent: (eventName, count = 1) => {
        switch (eventName) {
          case 'camera-rotated':
            set((state) => ({
              cameraRotations: state.cameraRotations + count,
            }));
            break;
          case 'object-spawned':
            set((state) => ({
              objectsSpawned: state.objectsSpawned + count,
            }));
            break;
          default:
            // For custom events, could extend this
            console.warn(`Unknown event: ${eventName}`);
        }
      },

      // Helper: Check if a hint should be shown
      shouldShowHint: (hintId) => {
        return !get().shownHints.has(hintId);
      },

        // Reset all hints (for testing)
        resetHints: () =>
          set({
            cameraRotations: 0,
            gestureCount: {},
            objectsSpawned: 0,
            sessionCount: 0,
            shownHints: new Set(),
            activeHints: new Set(),
          }),
      };
    },
    {
      name: 'handtrack3d-hints',
      storage: hintsStorage,
    }
  )
);

// Increment session count on app start
useHintsStore.getState().incrementSessionCount();
