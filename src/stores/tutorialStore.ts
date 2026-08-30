import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Tutorial Store
 *
 * Tracks tutorial progress and state for interactive onboarding.
 * Used by TutorialOverlay to determine when to advance steps.
 */

interface TutorialStore {
  // Current state
  gestureDetected: string | null;
  nearObject: boolean;
  objectGrabbed: boolean;
  handDetected: boolean;
  webcamEnabled: boolean;
  
  // Tutorial progress
  currentStep: number;
  completed: boolean;
  dismissed: boolean;
  
  // Actions
  updateTutorialState: (updates: Partial<Omit<TutorialStore, 'updateTutorialState' | 'advanceStep' | 'resetTutorial' | 'dismissTutorial' | 'completeTutorial'>>) => void;
  advanceStep: () => void;
  resetTutorial: () => void;
  dismissTutorial: () => void;
  completeTutorial: () => void;
}

// Migrate old localStorage keys to new format
const migrateOldTutorialData = () => {
  const oldCompleted = localStorage.getItem('tutorial_completed');
  const oldDismissed = localStorage.getItem('tutorial_dismissed');

  if (oldCompleted || oldDismissed) {
    const migrated = {
      completed: oldCompleted === 'true',
      dismissed: oldDismissed === 'true',
      currentStep: 0,
    };

    // Clean up old keys
    localStorage.removeItem('tutorial_completed');
    localStorage.removeItem('tutorial_dismissed');

    return migrated;
  }

  return null;
};

export const useTutorialStore = create<TutorialStore>()(
  persist(
    (set) => {
      // Try to migrate old data
      const migrated = migrateOldTutorialData();

      return {
        // Initial state (or migrated state)
        gestureDetected: null,
        nearObject: false,
        objectGrabbed: false,
        handDetected: false,
        webcamEnabled: false,

        currentStep: migrated?.currentStep ?? 0,
        completed: migrated?.completed ?? false,
        dismissed: migrated?.dismissed ?? false,

        // Update tutorial state (called by components when conditions change)
        updateTutorialState: (updates) => set((state) => ({ ...state, ...updates })),

        // Advance to next step
        advanceStep: () =>
          set((state) => ({
            currentStep: state.currentStep + 1,
          })),

        // Reset tutorial to beginning
        resetTutorial: () =>
          set({
            gestureDetected: null,
            nearObject: false,
            objectGrabbed: false,
            handDetected: false,
            webcamEnabled: false,
            currentStep: 0,
            completed: false,
            dismissed: false,
          }),

        // Dismiss tutorial (user clicked skip)
        dismissTutorial: () => set({ dismissed: true }),

        // Complete tutorial (reached final step)
        completeTutorial: () => set({ completed: true, dismissed: true }),
      };
    },
    {
      name: 'handtrack3d-tutorial',
      // Only persist completion/dismissal state, not temporary interaction state
      partialize: (state) => ({
        completed: state.completed,
        dismissed: state.dismissed,
        currentStep: state.currentStep,
      }),
    }
  )
);

/**
 * Check if tutorial should be shown
 */
export function shouldShowTutorial(): boolean {
  const { completed, dismissed } = useTutorialStore.getState();
  return !completed && !dismissed;
}

/**
 * Clear tutorial progress (for testing)
 */
export function clearTutorialProgress(): void {
  useTutorialStore.getState().resetTutorial();
}
