import { create } from 'zustand';

interface BuildModeStore {
  enabled: boolean;
  selectedObjectType: string;
  gridSnapEnabled: boolean;
  gridSnapSize: number;
  toggleBuildMode: () => void;
  setBuildMode: (enabled: boolean) => void;
  selectObjectType: (type: string) => void;
  toggleGridSnap: () => void;
  setGridSnapSize: (size: number) => void;
}

export const useBuildModeStore = create<BuildModeStore>((set) => ({
  enabled: false,
  selectedObjectType: 'box',
  gridSnapEnabled: true,
  gridSnapSize: 0.5,

  toggleBuildMode: () =>
    set((state) => ({
      enabled: !state.enabled,
    })),

  setBuildMode: (enabled) =>
    set({
      enabled,
    }),

  selectObjectType: (type) =>
    set({
      selectedObjectType: type,
    }),

  toggleGridSnap: () =>
    set((state) => ({
      gridSnapEnabled: !state.gridSnapEnabled,
    })),

  setGridSnapSize: (size) =>
    set({
      gridSnapSize: size,
    }),
}));
