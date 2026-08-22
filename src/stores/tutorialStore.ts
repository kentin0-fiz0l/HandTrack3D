import { create } from 'zustand';

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

export const useTutorialStore = create<TutorialStore>((set, get) => ({
  // Initial state
  gestureDetected: null,
  nearObject: false,
  objectGrabbed: false,
  handDetected: false,
  webcamEnabled: false,
  
  currentStep: 0,
  completed: false,
  dismissed: false,
  
  // Update tutorial state (called by components when conditions change)
  updateTutorialState: (updates) => set((state) => ({ ...state, ...updates })),
  
  // Advance to next step
  advanceStep: () => set((state) => ({ 
    currentStep: state.currentStep + 1 
  })),
  
  // Reset tutorial to beginning
  resetTutorial: () => set({
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
  dismissTutorial: () => {
    set({ dismissed: true });
    localStorage.setItem('tutorial_dismissed', 'true');
  },
  
  // Complete tutorial (reached final step)
  completeTutorial: () => {
    set({ completed: true, dismissed: true });
    localStorage.setItem('tutorial_completed', 'true');
  },
}));

/**
 * Check if tutorial should be shown
 */
export function shouldShowTutorial(): boolean {
  const completed = localStorage.getItem('tutorial_completed');
  const dismissed = localStorage.getItem('tutorial_dismissed');
  return !completed && !dismissed;
}

/**
 * Clear tutorial progress (for testing)
 */
export function clearTutorialProgress(): void {
  localStorage.removeItem('tutorial_completed');
  localStorage.removeItem('tutorial_dismissed');
  useTutorialStore.getState().resetTutorial();
}
