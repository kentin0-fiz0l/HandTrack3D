import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    // Reset store to defaults before each test
    useSettingsStore.getState().reset();
  });

  describe('Initial state', () => {
    it('should have correct default gesture settings', () => {
      const state = useSettingsStore.getState();
      expect(state.pinchThreshold).toBe(0.05);
      expect(state.fingerExtensionAngle).toBe(160);
      expect(state.fistCurlThreshold).toBe(0.15);
    });

    it('should have correct default physics settings', () => {
      const state = useSettingsStore.getState();
      expect(state.gravityEnabled).toBe(true);
      expect(state.grabRange).toBe(1.5);
      expect(state.restitution).toBe(0.5);
      expect(state.friction).toBe(0.7);
    });

    it('should have correct default tracking settings', () => {
      const state = useSettingsStore.getState();
      expect(state.maxHands).toBe(2);
      expect(state.detectionConfidence).toBe(0.5);
      expect(state.trackingConfidence).toBe(0.5);
    });

    it('should have correct default visual settings', () => {
      const state = useSettingsStore.getState();
      expect(state.showTrails).toBe(true);
      expect(state.showWebcam).toBe(false);
    });
  });

  describe('updateGestureSetting', () => {
    it('should update pinch threshold', () => {
      const { updateGestureSetting } = useSettingsStore.getState();
      updateGestureSetting('pinchThreshold', 0.07);
      expect(useSettingsStore.getState().pinchThreshold).toBe(0.07);
    });

    it('should update finger extension angle', () => {
      const { updateGestureSetting } = useSettingsStore.getState();
      updateGestureSetting('fingerExtensionAngle', 170);
      expect(useSettingsStore.getState().fingerExtensionAngle).toBe(170);
    });

    it('should update fist curl threshold', () => {
      const { updateGestureSetting } = useSettingsStore.getState();
      updateGestureSetting('fistCurlThreshold', 0.18);
      expect(useSettingsStore.getState().fistCurlThreshold).toBe(0.18);
    });
  });

  describe('updatePhysicsSetting', () => {
    it('should toggle gravity', () => {
      const { updatePhysicsSetting } = useSettingsStore.getState();
      updatePhysicsSetting('gravityEnabled', false);
      expect(useSettingsStore.getState().gravityEnabled).toBe(false);
    });

    it('should update grab range', () => {
      const { updatePhysicsSetting } = useSettingsStore.getState();
      updatePhysicsSetting('grabRange', 2.5);
      expect(useSettingsStore.getState().grabRange).toBe(2.5);
    });

    it('should update restitution', () => {
      const { updatePhysicsSetting } = useSettingsStore.getState();
      updatePhysicsSetting('restitution', 0.8);
      expect(useSettingsStore.getState().restitution).toBe(0.8);
    });

    it('should update friction', () => {
      const { updatePhysicsSetting } = useSettingsStore.getState();
      updatePhysicsSetting('friction', 0.3);
      expect(useSettingsStore.getState().friction).toBe(0.3);
    });
  });

  describe('updateTrackingSetting', () => {
    it('should update max hands', () => {
      const { updateTrackingSetting } = useSettingsStore.getState();
      updateTrackingSetting('maxHands', 1);
      expect(useSettingsStore.getState().maxHands).toBe(1);
    });

    it('should update detection confidence', () => {
      const { updateTrackingSetting } = useSettingsStore.getState();
      updateTrackingSetting('detectionConfidence', 0.7);
      expect(useSettingsStore.getState().detectionConfidence).toBe(0.7);
    });

    it('should update tracking confidence', () => {
      const { updateTrackingSetting } = useSettingsStore.getState();
      updateTrackingSetting('trackingConfidence', 0.8);
      expect(useSettingsStore.getState().trackingConfidence).toBe(0.8);
    });
  });

  describe('updateVisualSetting', () => {
    it('should toggle trails', () => {
      const { updateVisualSetting } = useSettingsStore.getState();
      updateVisualSetting('showTrails', false);
      expect(useSettingsStore.getState().showTrails).toBe(false);
    });

    it('should toggle webcam', () => {
      const { updateVisualSetting } = useSettingsStore.getState();
      updateVisualSetting('showWebcam', true);
      expect(useSettingsStore.getState().showWebcam).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset all settings to defaults', () => {
      const { updateGestureSetting, updatePhysicsSetting, updateVisualSetting, reset } =
        useSettingsStore.getState();

      // Change some settings
      updateGestureSetting('pinchThreshold', 0.08);
      updatePhysicsSetting('gravityEnabled', false);
      updateVisualSetting('showTrails', false);

      // Verify changes
      expect(useSettingsStore.getState().pinchThreshold).toBe(0.08);
      expect(useSettingsStore.getState().gravityEnabled).toBe(false);
      expect(useSettingsStore.getState().showTrails).toBe(false);

      // Reset
      reset();

      // Verify defaults restored
      const state = useSettingsStore.getState();
      expect(state.pinchThreshold).toBe(0.05);
      expect(state.gravityEnabled).toBe(true);
      expect(state.showTrails).toBe(true);
    });
  });
});
