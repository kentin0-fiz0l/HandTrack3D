import { describe, it, expect } from 'vitest';
import { PRESETS, getPresetById, matchesPreset, type SettingsPreset } from '../settingsPresets';

describe('settingsPresets', () => {
  describe('PRESETS', () => {
    it('contains 3 presets', () => {
      expect(PRESETS).toHaveLength(3);
    });

    it('has responsive, balanced, and precise presets', () => {
      const ids = PRESETS.map((p) => p.id);
      expect(ids).toContain('responsive');
      expect(ids).toContain('balanced');
      expect(ids).toContain('precise');
    });

    it('each preset has required properties', () => {
      PRESETS.forEach((preset) => {
        expect(preset).toHaveProperty('id');
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('description');
        expect(preset).toHaveProperty('icon');
        expect(preset).toHaveProperty('settings');
      });
    });

    it('each preset has all required settings', () => {
      const requiredSettings = [
        'pinchThreshold',
        'fingerExtensionAngle',
        'fistCurlThreshold',
        'pointExtensionAngle',
        'swipeVelocityThreshold',
        'swipeCooldown',
        'grabRange',
        'restitution',
        'friction',
        'detectionConfidence',
        'trackingConfidence',
      ];

      PRESETS.forEach((preset) => {
        requiredSettings.forEach((setting) => {
          expect(preset.settings).toHaveProperty(setting);
        });
      });
    });
  });

  describe('Responsive Preset', () => {
    const responsive = PRESETS.find((p) => p.id === 'responsive')!;

    it('has low thresholds', () => {
      expect(responsive.settings.pinchThreshold).toBe(0.03);
      expect(responsive.settings.detectionConfidence).toBe(0.4);
      expect(responsive.settings.trackingConfidence).toBe(0.4);
    });

    it('has larger grab range', () => {
      expect(responsive.settings.grabRange).toBe(2.0);
    });

    it('has lower angle thresholds', () => {
      expect(responsive.settings.fingerExtensionAngle).toBe(150);
      expect(responsive.settings.pointExtensionAngle).toBe(150);
    });
  });

  describe('Balanced Preset', () => {
    const balanced = PRESETS.find((p) => p.id === 'balanced')!;

    it('has moderate thresholds', () => {
      expect(balanced.settings.pinchThreshold).toBe(0.05);
      expect(balanced.settings.detectionConfidence).toBe(0.5);
      expect(balanced.settings.trackingConfidence).toBe(0.5);
    });

    it('has medium grab range', () => {
      expect(balanced.settings.grabRange).toBe(1.5);
    });

    it('has moderate angle thresholds', () => {
      expect(balanced.settings.fingerExtensionAngle).toBe(160);
      expect(balanced.settings.pointExtensionAngle).toBe(160);
    });
  });

  describe('Precise Preset', () => {
    const precise = PRESETS.find((p) => p.id === 'precise')!;

    it('has high thresholds', () => {
      expect(precise.settings.pinchThreshold).toBe(0.07);
      expect(precise.settings.detectionConfidence).toBe(0.7);
      expect(precise.settings.trackingConfidence).toBe(0.7);
    });

    it('has smaller grab range', () => {
      expect(precise.settings.grabRange).toBe(1.2);
    });

    it('has higher angle thresholds', () => {
      expect(precise.settings.fingerExtensionAngle).toBe(170);
      expect(precise.settings.pointExtensionAngle).toBe(170);
    });
  });

  describe('getPresetById', () => {
    it('returns the correct preset by id', () => {
      const responsive = getPresetById('responsive');
      expect(responsive?.id).toBe('responsive');
      expect(responsive?.name).toBe('Responsive');
    });

    it('returns undefined for invalid id', () => {
      const invalid = getPresetById('invalid');
      expect(invalid).toBeUndefined();
    });

    it('works for all preset ids', () => {
      PRESETS.forEach((preset) => {
        const found = getPresetById(preset.id);
        expect(found).toBe(preset);
      });
    });
  });

  describe('matchesPreset', () => {
    const balanced = PRESETS.find((p) => p.id === 'balanced')!;

    it('returns true when settings match exactly', () => {
      const currentSettings = { ...balanced.settings };
      expect(matchesPreset(currentSettings, balanced)).toBe(true);
    });

    it('returns false when one setting differs', () => {
      const currentSettings = {
        ...balanced.settings,
        pinchThreshold: 0.99, // Different from balanced
      };
      expect(matchesPreset(currentSettings, balanced)).toBe(false);
    });

    it('returns false when multiple settings differ', () => {
      const responsive = PRESETS.find((p) => p.id === 'responsive')!;
      const currentSettings = { ...balanced.settings };
      expect(matchesPreset(currentSettings, responsive)).toBe(false);
    });

    it('works for all presets', () => {
      PRESETS.forEach((preset) => {
        const exactSettings = { ...preset.settings };
        expect(matchesPreset(exactSettings, preset)).toBe(true);
      });
    });
  });

  describe('Preset Relationships', () => {
    const responsive = PRESETS.find((p) => p.id === 'responsive')!;
    const balanced = PRESETS.find((p) => p.id === 'balanced')!;
    const precise = PRESETS.find((p) => p.id === 'precise')!;

    it('responsive has lower pinch threshold than balanced', () => {
      expect(responsive.settings.pinchThreshold).toBeLessThan(
        balanced.settings.pinchThreshold
      );
    });

    it('precise has higher pinch threshold than balanced', () => {
      expect(precise.settings.pinchThreshold).toBeGreaterThan(
        balanced.settings.pinchThreshold
      );
    });

    it('responsive has larger grab range than balanced', () => {
      expect(responsive.settings.grabRange).toBeGreaterThan(balanced.settings.grabRange);
    });

    it('precise has smaller grab range than balanced', () => {
      expect(precise.settings.grabRange).toBeLessThan(balanced.settings.grabRange);
    });

    it('responsive has lower confidence than balanced', () => {
      expect(responsive.settings.detectionConfidence).toBeLessThan(
        balanced.settings.detectionConfidence
      );
    });

    it('precise has higher confidence than balanced', () => {
      expect(precise.settings.detectionConfidence).toBeGreaterThan(
        balanced.settings.detectionConfidence
      );
    });
  });
});
