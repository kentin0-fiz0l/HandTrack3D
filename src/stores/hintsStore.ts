import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type HintType =
  | 'welcome'
  | 'firstGrab'
  | 'buildMode'
  | 'objectSpawned'
  | 'cameraControls'
  | 'settingsPanel'
  | 'propertyEditor';

interface HintState {
  shown: Set<HintType>;
  dismissed: Set<HintType>;
}

interface HintsStore extends HintState {
  markShown: (hint: HintType) => void;
  dismissHint: (hint: HintType) => void;
  shouldShow: (hint: HintType) => boolean;
  resetHints: () => void;
}

const initialState: HintState = {
  shown: new Set(),
  dismissed: new Set(),
};

export const useHintsStore = create<HintsStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      markShown: (hint) =>
        set((state) => ({
          shown: new Set([...state.shown, hint]),
        })),
      dismissHint: (hint) =>
        set((state) => ({
          dismissed: new Set([...state.dismissed, hint]),
        })),
      shouldShow: (hint) => {
        const { shown, dismissed } = get();
        return !shown.has(hint) && !dismissed.has(hint);
      },
      resetHints: () => set(initialState),
    }),
    {
      name: 'handtrack3d-hints',
      // Custom serialization to handle Sets
      partialize: (state) => ({
        shown: Array.from(state.shown),
        dismissed: Array.from(state.dismissed),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        shown: new Set(persistedState?.shown || []),
        dismissed: new Set(persistedState?.dismissed || []),
      }),
    }
  )
);
