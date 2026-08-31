import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Vector3 } from 'three';

/**
 * WiFi Router configuration for positioning
 */
export interface RouterConfig {
  id: string;
  name: string;
  bssid: string;
  position: [number, number, number]; // Room coordinates (x, y, z in meters)
  referenceRssi?: number; // RSSI at 1 meter (for calibration)
}

/**
 * Positioning state and status
 */
export interface PositioningState {
  // Connection status
  isConnected: boolean;
  connectionError: string | null;

  // Router configuration
  routers: RouterConfig[];

  // Current position (room-scale coordinates)
  roomPosition: [number, number, number] | null;
  positionAccuracy: number | null; // Estimated error in meters

  // Raw RSSI data (for debugging)
  lastRssiData: Array<{ bssid: string; rssi: number; ssid: string }>;
  lastUpdateTime: number | null;

  // Calibration mode
  isCalibrating: boolean;
  calibrationStep: number; // 0 = not started, 1-4 = router 1-4

  // Settings
  enablePositioning: boolean;
  positioningMode: 'wifi-only' | 'uwb-only' | 'fusion' | 'disabled';
  updateInterval: number; // milliseconds
}

/**
 * Positioning store actions
 */
export interface PositioningActions {
  // Connection
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;

  // Router management
  addRouter: (router: RouterConfig) => void;
  updateRouter: (id: string, updates: Partial<RouterConfig>) => void;
  removeRouter: (id: string) => void;
  setRouters: (routers: RouterConfig[]) => void;

  // Position updates
  updatePosition: (position: [number, number, number], accuracy: number) => void;
  updateRssiData: (data: Array<{ bssid: string; rssi: number; ssid: string }>) => void;

  // Calibration
  startCalibration: () => void;
  nextCalibrationStep: () => void;
  finishCalibration: () => void;
  cancelCalibration: () => void;

  // Settings
  togglePositioning: () => void;
  setPositioningMode: (mode: PositioningState['positioningMode']) => void;
  updateSetting: <K extends keyof PositioningState>(
    key: K,
    value: PositioningState[K]
  ) => void;

  // Reset
  reset: () => void;
}

export type PositioningStore = PositioningState & PositioningActions;

/**
 * Default router configurations (empty - user must calibrate)
 */
const DEFAULT_ROUTERS: RouterConfig[] = [];

/**
 * Initial positioning state
 */
const initialState: PositioningState = {
  isConnected: false,
  connectionError: null,
  routers: DEFAULT_ROUTERS,
  roomPosition: null,
  positionAccuracy: null,
  lastRssiData: [],
  lastUpdateTime: null,
  isCalibrating: false,
  calibrationStep: 0,
  enablePositioning: false,
  positioningMode: 'disabled',
  updateInterval: 500, // 500ms = 2Hz
};

/**
 * Positioning store with persistence
 */
export const usePositioningStore = create<PositioningStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Connection
      setConnected: (connected) => set({ isConnected: connected }),
      setConnectionError: (error) => set({ connectionError: error }),

      // Router management
      addRouter: (router) => {
        const routers = [...get().routers, router];
        set({ routers });
      },

      updateRouter: (id, updates) => {
        const routers = get().routers.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        );
        set({ routers });
      },

      removeRouter: (id) => {
        const routers = get().routers.filter((r) => r.id !== id);
        set({ routers });
      },

      setRouters: (routers) => set({ routers }),

      // Position updates
      updatePosition: (position, accuracy) => {
        set({
          roomPosition: position,
          positionAccuracy: accuracy,
          lastUpdateTime: Date.now(),
        });
      },

      updateRssiData: (data) => {
        set({
          lastRssiData: data,
          lastUpdateTime: Date.now(),
        });
      },

      // Calibration
      startCalibration: () => {
        set({
          isCalibrating: true,
          calibrationStep: 1,
          routers: [], // Clear existing routers
        });
      },

      nextCalibrationStep: () => {
        const step = get().calibrationStep;
        if (step < 4) {
          set({ calibrationStep: step + 1 });
        }
      },

      finishCalibration: () => {
        set({
          isCalibrating: false,
          calibrationStep: 0,
          enablePositioning: true, // Auto-enable after calibration
          positioningMode: 'fusion', // Default to fusion mode
        });
      },

      cancelCalibration: () => {
        set({
          isCalibrating: false,
          calibrationStep: 0,
        });
      },

      // Settings
      togglePositioning: () => {
        set({ enablePositioning: !get().enablePositioning });
      },

      setPositioningMode: (mode) => {
        set({ positioningMode: mode });
      },

      updateSetting: (key, value) => {
        set({ [key]: value } as any);
      },

      // Reset
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'positioning-storage',
      // Only persist router configurations and settings, not transient state
      partialize: (state) => ({
        routers: state.routers,
        enablePositioning: state.enablePositioning,
        positioningMode: state.positioningMode,
        updateInterval: state.updateInterval,
      }),
    }
  )
);
