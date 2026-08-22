import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../settingsStore';
import { PRESETS } from '@/data/settingsPresets';

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

    it('should reset currentPreset to balanced', () => {
      const { reset } = useSettingsStore.getState();

      // Apply different preset
      const responsivePreset = PRESETS.find((p) => p.id === 'responsive');
      if (responsivePreset) {
        useSettingsStore.getState().applyPreset(responsivePreset);
      }

      expect(useSettingsStore.getState().currentPreset).toBe('responsive');

      // Reset
      reset();

      expect(useSettingsStore.getState().currentPreset).toBe('balanced');
    });
  });

  describe('Preset System', () => {
    describe('applyPreset', () => {
      it('should apply responsive preset correctly', () => {
        const responsivePreset = PRESETS.find((p) => p.id === 'responsive');
        if (!responsivePreset) throw new Error('Responsive preset not found');

        useSettingsStore.getState().applyPreset(responsivePreset);

        const state = useSettingsStore.getState();
        expect(state.pinchThreshold).toBe(responsivePreset.settings.pinchThreshold);
        expect(state.grabRange).toBe(responsivePreset.settings.grabRange);
        expect(state.detectionConfidence).toBe(responsivePreset.settings.detectionConfidence);
        expect(state.currentPreset).toBe('responsive');
      });

      it('should apply balanced preset correctly', () => {
        const balancedPreset = PRESETS.find((p) => p.id === 'balanced');
        if (!balancedPreset) throw new Error('Balanced preset not found');

        useSettingsStore.getState().applyPreset(balancedPreset);

        const state = useSettingsStore.getState();
        expect(state.pinchThreshold).toBe(balancedPreset.settings.pinchThreshold);
        expect(state.grabRange).toBe(balancedPreset.settings.grabRange);
        expect(state.detectionConfidence).toBe(balancedPreset.settings.detectionConfidence);
        expect(state.currentPreset).toBe('balanced');
      });

      it('should apply precise preset correctly', () => {
        const precisePreset = PRESETS.find((p) => p.id === 'precise');
        if (!precisePreset) throw new Error('Precise preset not found');

        useSettingsStore.getState().applyPreset(precisePreset);

        const state = useSettingsStore.getState();
        expect(state.pinchThreshold).toBe(precisePreset.settings.pinchThreshold);
        expect(state.grabRange).toBe(precisePreset.settings.grabRange);
        expect(state.detectionConfidence).toBe(precisePreset.settings.detectionConfidence);
        expect(state.currentPreset).toBe('precise');
      });

      it('should update all gesture settings from preset', () => {
        const responsivePreset = PRESETS.find((p) => p.id === 'responsive');
        if (!responsivePreset) throw new Error('Responsive preset not found');

        useSettingsStore.getState().applyPreset(responsivePreset);

        const state = useSettingsStore.getState();
        expect(state.pinchThreshold).toBe(responsivePreset.settings.pinchThreshold);
        expect(state.fingerExtensionAngle).toBe(responsivePreset.settings.fingerExtensionAngle);
        expect(state.fistCurlThreshold).toBe(responsivePreset.settings.fistCurlThreshold);
        expect(state.pointExtensionAngle).toBe(responsivePreset.settings.pointExtensionAngle);
        expect(state.swipeVelocityThreshold).toBe(responsivePreset.settings.swipeVelocityThreshold);
        expect(state.swipeCooldown).toBe(responsivePreset.settings.swipeCooldown);
      });

      it('should update physics settings from preset', () => {
        const precisePreset = PRESETS.find((p) => p.id === 'precise');
        if (!precisePreset) throw new Error('Precise preset not found');

        useSettingsStore.getState().applyPreset(precisePreset);

        const state = useSettingsStore.getState();
        expect(state.grabRange).toBe(precisePreset.settings.grabRange);
        expect(state.restitution).toBe(precisePreset.settings.restitution);
        expect(state.friction).toBe(precisePreset.settings.friction);
      });

      it('should update tracking confidence settings from preset', () => {
        const precisePreset = PRESETS.find((p) => p.id === 'precise');
        if (!precisePreset) throw new Error('Precise preset not found');

        useSettingsStore.getState().applyPreset(precisePreset);

        const state = useSettingsStore.getState();
        expect(state.detectionConfidence).toBe(precisePreset.settings.detectionConfidence);
        expect(state.trackingConfidence).toBe(precisePreset.settings.trackingConfidence);
      });

      it('should preserve visual settings when applying preset', () => {
        // Set custom visual settings
        useSettingsStore.getState().updateVisualSetting('showTrails', false);
        useSettingsStore.getState().updateVisualSetting('showWebcam', true);

        // Apply preset
        const responsivePreset = PRESETS.find((p) => p.id === 'responsive');
        if (responsivePreset) {
          useSettingsStore.getState().applyPreset(responsivePreset);
        }

        // Visual settings should be reset to defaults, not preserved
        const state = useSettingsStore.getState();
        expect(state.showTrails).toBe(true); // Reset to default
        expect(state.showWebcam).toBe(false); // Reset to default
      });
    });

    describe('Custom preset detection', () => {
      it('should set currentPreset to null when gesture setting is manually changed', () => {
        // Start with a preset
        const balancedPreset = PRESETS.find((p) => p.id === 'balanced');
        if (balancedPreset) {
          useSettingsStore.getState().applyPreset(balancedPreset);
        }
        expect(useSettingsStore.getState().currentPreset).toBe('balanced');

        // Manually change a setting
        useSettingsStore.getState().updateGestureSetting('pinchThreshold', 0.06);

        // Should now be custom
        expect(useSettingsStore.getState().currentPreset).toBeNull();
      });

      it('should set currentPreset to null when physics setting is manually changed', () => {
        // Start with a preset
        const precisePreset = PRESETS.find((p) => p.id === 'precise');
        if (precisePreset) {
          useSettingsStore.getState().applyPreset(precisePreset);
        }
        expect(useSettingsStore.getState().currentPreset).toBe('precise');

        // Manually change a setting
        useSettingsStore.getState().updatePhysicsSetting('grabRange', 1.8);

        // Should now be custom
        expect(useSettingsStore.getState().currentPreset).toBeNull();
      });

      it('should set currentPreset to null when tracking setting is manually changed', () => {
        // Start with a preset
        const responsivePreset = PRESETS.find((p) => p.id === 'responsive');
        if (responsivePreset) {
          useSettingsStore.getState().applyPreset(responsivePreset);
        }
        expect(useSettingsStore.getState().currentPreset).toBe('responsive');

        // Manually change a setting
        useSettingsStore.getState().updateTrackingSetting('detectionConfidence', 0.6);

        // Should now be custom
        expect(useSettingsStore.getState().currentPreset).toBeNull();
      });

      it('should NOT change currentPreset when visual setting is changed', () => {
        // Start with a preset
        const balancedPreset = PRESETS.find((p) => p.id === 'balanced');
        if (balancedPreset) {
          useSettingsStore.getState().applyPreset(balancedPreset);
        }
        expect(useSettingsStore.getState().currentPreset).toBe('balanced');

        // Change visual settings
        useSettingsStore.getState().updateVisualSetting('showTrails', false);
        useSettingsStore.getState().updateVisualSetting('showWebcam', true);

        // Should still be balanced (visual settings don't affect preset)
        expect(useSettingsStore.getState().currentPreset).toBe('balanced');
      });
    });

    describe('Preset switching', () => {
      it('should switch between presets correctly', () => {
        const { applyPreset } = useSettingsStore.getState();

        // Apply responsive
        const responsivePreset = PRESETS.find((p) => p.id === 'responsive');
        if (responsivePreset) {
          applyPreset(responsivePreset);
        }
        expect(useSettingsStore.getState().currentPreset).toBe('responsive');
        expect(useSettingsStore.getState().grabRange).toBe(2.0);

        // Switch to precise
        const precisePreset = PRESETS.find((p) => p.id === 'precise');
        if (precisePreset) {
          applyPreset(precisePreset);
        }
        expect(useSettingsStore.getState().currentPreset).toBe('precise');
        expect(useSettingsStore.getState().grabRange).toBe(1.2);

        // Switch back to balanced
        const balancedPreset = PRESETS.find((p) => p.id === 'balanced');
        if (balancedPreset) {
          applyPreset(balancedPreset);
        }
        expect(useSettingsStore.getState().currentPreset).toBe('balanced');
        expect(useSettingsStore.getState().grabRange).toBe(1.5);
      });
    });
  });
});
