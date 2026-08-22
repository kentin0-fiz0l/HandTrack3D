import { create } from 'zustand';

const TUTORIAL_COMPLETED_KEY = 'handtrack3d_tutorial_completed';
const TUTORIAL_SKIPPED_KEY = 'handtrack3d_tutorial_skipped';

export interface TutorialStore {
  // State
  isActive: boolean;
  currentStep: number;
  completedSteps: Set<number>;
  hasCompletedTutorial: boolean;
  hasSkippedTutorial: boolean;

  // Actions
  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
  markStepComplete: (step: number) => void;
}

// Load initial state from localStorage
const loadTutorialState = () => {
  try {
    const completed = localStorage.getItem(TUTORIAL_COMPLETED_KEY) === 'true';
    const skipped = localStorage.getItem(TUTORIAL_SKIPPED_KEY) === 'true';
    return { completed, skipped };
  } catch (error) {
    console.error('Failed to load tutorial state:', error);
    return { completed: false, skipped: false };
  }
};

const initialState = loadTutorialState();

export const useTutorialStore = create<TutorialStore>((set, get) => ({
  // Initial state
  isActive: !initialState.completed && !initialState.skipped,
  currentStep: 0,
  completedSteps: new Set<number>(),
  hasCompletedTutorial: initialState.completed,
  hasSkippedTutorial: initialState.skipped,

  // Start tutorial (for replay functionality)
  startTutorial: () =>
    set({
      isActive: true,
      currentStep: 0,
      completedSteps: new Set<number>(),
    }),

  // Advance to next step
  nextStep: () => {
    const { currentStep, completedSteps } = get();
    const newCompletedSteps = new Set(completedSteps);
    newCompletedSteps.add(currentStep);

    // Tutorial has 6 steps (0-5), step 5 is the last
    if (currentStep >= 5) {
      // Tutorial complete
      get().completeTutorial();
    } else {
      set({
        currentStep: currentStep + 1,
        completedSteps: newCompletedSteps,
      });
    }
  },

  // Mark a specific step as complete (for conditional progress)
  markStepComplete: (step: number) => {
    const { completedSteps } = get();
    const newCompletedSteps = new Set(completedSteps);
    newCompletedSteps.add(step);
    set({ completedSteps: newCompletedSteps });
  },

  // Skip tutorial entirely
  skipTutorial: () => {
    try {
      localStorage.setItem(TUTORIAL_SKIPPED_KEY, 'true');
      set({
        isActive: false,
        hasSkippedTutorial: true,
      });
    } catch (error) {
      console.error('Failed to save tutorial skip state:', error);
    }
  },

  // Complete tutorial
  completeTutorial: () => {
    try {
      localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
      set({
        isActive: false,
        hasCompletedTutorial: true,
      });
    } catch (error) {
      console.error('Failed to save tutorial completion state:', error);
    }
  },

  // Reset tutorial (clear localStorage and restart)
  resetTutorial: () => {
    try {
      localStorage.removeItem(TUTORIAL_COMPLETED_KEY);
      localStorage.removeItem(TUTORIAL_SKIPPED_KEY);
      set({
        isActive: true,
        currentStep: 0,
        completedSteps: new Set<number>(),
        hasCompletedTutorial: false,
        hasSkippedTutorial: false,
      });
    } catch (error) {
      console.error('Failed to reset tutorial state:', error);
    }
  },
}));
