import { create } from 'zustand';

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
  
  resetHints: () => void;
}

// Load initial state from localStorage
const loadSessionCount = (): number => {
  const stored = localStorage.getItem('hints_session_count');
  return stored ? parseInt(stored, 10) : 0;
};

const loadShownHints = (): Set<string> => {
  const stored = localStorage.getItem('hints_shown');
  return stored ? new Set(JSON.parse(stored)) : new Set();
};

export const useHintsStore = create<HintsStore>((set, get) => ({
  // Initial state
  cameraRotations: 0,
  gestureCount: {},
  objectsSpawned: 0,
  sessionCount: loadSessionCount(),
  shownHints: loadShownHints(),
  activeHints: new Set(),
  
  // Increment counters
  incrementCameraRotations: () => set((state) => ({ 
    cameraRotations: state.cameraRotations + 1 
  })),
  
  incrementGestureCount: (gesture) => set((state) => ({
    gestureCount: {
      ...state.gestureCount,
      [gesture]: (state.gestureCount[gesture] || 0) + 1,
    },
  })),
  
  incrementObjectsSpawned: () => set((state) => ({ 
    objectsSpawned: state.objectsSpawned + 1 
  })),
  
  incrementSessionCount: () => {
    const newCount = get().sessionCount + 1;
    localStorage.setItem('hints_session_count', newCount.toString());
    set({ sessionCount: newCount });
  },
  
  // Hint display management
  markHintAsShown: (hintId) => {
    const newShownHints = new Set(get().shownHints);
    newShownHints.add(hintId);
    
    // Save to localStorage
    localStorage.setItem('hints_shown', JSON.stringify([...newShownHints]));
    
    set({ shownHints: newShownHints });
  },
  
  addActiveHint: (hintId) => set((state) => ({
    activeHints: new Set([...state.activeHints, hintId]),
  })),
  
  removeActiveHint: (hintId) => {
    const newActiveHints = new Set(get().activeHints);
    newActiveHints.delete(hintId);
    set({ activeHints: newActiveHints });
  },
  
  // Reset all hints (for testing)
  resetHints: () => {
    localStorage.removeItem('hints_shown');
    localStorage.removeItem('hints_session_count');
    set({
      cameraRotations: 0,
      gestureCount: {},
      objectsSpawned: 0,
      sessionCount: 0,
      shownHints: new Set(),
      activeHints: new Set(),
    });
  },
}));

// Increment session count on app start
useHintsStore.getState().incrementSessionCount();
