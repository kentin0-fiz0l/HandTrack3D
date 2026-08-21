import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  TwoHandScaleGesturePlugin,
  TwoHandRotateGesturePlugin,
  ClapGesturePlugin,
} from '../two-hand-scale';
import type { HandLandmark } from '../../../types/hand';
import type { GestureSettings } from '../../../types/gesture';

/**
 * Create mock hand landmarks at a specific position
 */
function createHandAt(x: number, y: number, z: number, pinching: boolean = false): HandLandmark[] {
  const landmarks: HandLandmark[] = [];

  // Wrist (0)
  landmarks.push({ x, y, z });

  // Other palm landmarks (1-4)
  for (let i = 1; i < 5; i++) {
    landmarks.push({
      x: x + i * 0.02,
      y: y + i * 0.02,
      z: z + i * 0.01,
    });
  }

  // Thumb tip (4)
  if (pinching) {
    landmarks[4] = { x: x + 0.05, y: y + 0.05, z: z + 0.01 }; // Close to index
  } else {
    landmarks[4] = { x: x + 0.15, y: y + 0.15, z: z + 0.01 }; // Far from index
  }

  // Index base landmarks (5-7)
  for (let i = 5; i < 8; i++) {
    landmarks.push({
      x: x + (i - 4) * 0.03,
      y: y + (i - 4) * 0.03,
      z: z + (i - 4) * 0.01,
    });
  }

  // Index tip (8)
  if (pinching) {
    landmarks.push({ x: x + 0.05, y: y + 0.05, z: z + 0.01 }); // Close to thumb
  } else {
    landmarks.push({ x: x + 0.2, y: y + 0.2, z: z + 0.01 }); // Far from thumb
  }

  // Other finger landmarks (9-20)
  for (let i = 9; i < 21; i++) {
    landmarks.push({
      x: x + (i - 8) * 0.02,
      y: y + (i - 8) * 0.02,
      z: z + (i - 8) * 0.01,
    });
  }

  return landmarks;
}

/**
 * Default gesture settings
 */
const defaultSettings: GestureSettings = {
  pinchThreshold: 0.05,
  pointExtensionThreshold: 0.1,
  fistCurlThreshold: 0.15,
  openHandSpreadThreshold: 0.12,
};

describe('TwoHandScaleGesturePlugin', () => {
  let plugin: TwoHandScaleGesturePlugin;

  beforeEach(() => {
    vi.useFakeTimers();
    plugin = new TwoHandScaleGesturePlugin();
  });

  it('should have correct metadata', () => {
    expect(plugin.name).toBe('two-hand:scale');
    expect(plugin.priority).toBe(70);
    expect(plugin.gestureType).toBe('scale');
    expect(plugin.requiredHands).toBe(2);
  });

  it('should not detect with less than 2 hands', () => {
    const hand1 = createHandAt(0, 0, 0, true);
    const hands = [hand1];

    const detected = plugin.detect(hands, defaultSettings);
    expect(detected).toBe(false);
  });

  it('should not detect when hands not pinching', () => {
    const hand1 = createHandAt(0, 0, 0, false); // Not pinching
    const hand2 = createHandAt(0.5, 0, 0, false); // Not pinching
    const hands = [hand1, hand2];

    const detected = plugin.detect(hands, defaultSettings);
    expect(detected).toBe(false);
  });

  it('should not detect when only one hand pinching', () => {
    const hand1 = createHandAt(0, 0, 0, true); // Pinching
    const hand2 = createHandAt(0.5, 0, 0, false); // Not pinching
    const hands = [hand1, hand2];

    const detected = plugin.detect(hands, defaultSettings);
    expect(detected).toBe(false);
  });

  it('should not detect when hands too close', () => {
    const hand1 = createHandAt(0, 0, 0, true);
    const hand2 = createHandAt(0.05, 0, 0, true); // Too close (< minDistance)
    const hands = [hand1, hand2];

    const detected = plugin.detect(hands, defaultSettings);
    expect(detected).toBe(false);
  });

  it('should detect scale gesture when distance changes', () => {
    const hands1 = [createHandAt(0, 0, 0, true), createHandAt(0.3, 0, 0, true)];
    const hands2 = [createHandAt(0, 0, 0, true), createHandAt(0.4, 0, 0, true)];
    const hands3 = [createHandAt(0, 0, 0, true), createHandAt(0.5, 0, 0, true)];

    // Build up history
    plugin.detect(hands1, defaultSettings);
    vi.advanceTimersByTime(100);

    plugin.detect(hands2, defaultSettings);
    vi.advanceTimersByTime(100);

    const detected = plugin.detect(hands3, defaultSettings);
    expect(detected).toBe(true);
  });

  it('should return positive scale delta for zoom in', () => {
    const hands1 = [createHandAt(0, 0, 0, true), createHandAt(0.3, 0, 0, true)];
    const hands2 = [createHandAt(0, 0, 0, true), createHandAt(0.5, 0, 0, true)];

    plugin.detect(hands1, defaultSettings);
    vi.advanceTimersByTime(100);
    plugin.detect(hands2, defaultSettings);

    const delta = plugin.getScaleDelta();
    expect(delta).toBeGreaterThan(0);
  });

  it('should return negative scale delta for zoom out', () => {
    const hands1 = [createHandAt(0, 0, 0, true), createHandAt(0.5, 0, 0, true)];
    const hands2 = [createHandAt(0, 0, 0, true), createHandAt(0.3, 0, 0, true)];

    plugin.detect(hands1, defaultSettings);
    vi.advanceTimersByTime(100);
    plugin.detect(hands2, defaultSettings);

    const delta = plugin.getScaleDelta();
    expect(delta).toBeLessThan(0);
  });

  it('should clear history when hands stop pinching', () => {
    const hands1 = [createHandAt(0, 0, 0, true), createHandAt(0.3, 0, 0, true)];
    const hands2 = [createHandAt(0, 0, 0, false), createHandAt(0.4, 0, 0, false)];

    plugin.detect(hands1, defaultSettings);
    plugin.detect(hands2, defaultSettings);

    // After clearing, delta should be 0
    const delta = plugin.getScaleDelta();
    expect(delta).toBe(0);
  });

  it('should dispose and clear history', () => {
    const hands = [createHandAt(0, 0, 0, true), createHandAt(0.3, 0, 0, true)];
    plugin.detect(hands, defaultSettings);

    plugin.dispose();

    const delta = plugin.getScaleDelta();
    expect(delta).toBe(0);
  });
});

describe('TwoHandRotateGesturePlugin', () => {
  let plugin: TwoHandRotateGesturePlugin;

  beforeEach(() => {
    vi.useFakeTimers();
    plugin = new TwoHandRotateGesturePlugin();
  });

  it('should have correct metadata', () => {
    expect(plugin.name).toBe('two-hand:rotate');
    expect(plugin.priority).toBe(70);
    expect(plugin.gestureType).toBe('rotate');
    expect(plugin.requiredHands).toBe(2);
  });

  it('should not detect with less than 2 hands', () => {
    const hand1 = createHandAt(0, 0, 0, true);
    const hands = [hand1];

    const detected = plugin.detect(hands, defaultSettings);
    expect(detected).toBe(false);
  });

  it('should detect rotation when angle changes', () => {
    // Hands at different angles
    const hands1 = [createHandAt(0, 0, 0, true), createHandAt(0.3, 0, 0, true)];
    const hands2 = [createHandAt(0, 0, 0, true), createHandAt(0.2, 0.2, 0, true)];
    const hands3 = [createHandAt(0, 0, 0, true), createHandAt(0, 0.3, 0, true)];

    // Build up history
    plugin.detect(hands1, defaultSettings);
    vi.advanceTimersByTime(100);

    plugin.detect(hands2, defaultSettings);
    vi.advanceTimersByTime(100);

    const detected = plugin.detect(hands3, defaultSettings);
    expect(detected).toBe(true);
  });

  it('should return rotation angle delta', () => {
    const hands1 = [createHandAt(0, 0, 0, true), createHandAt(0.3, 0, 0, true)];
    const hands2 = [createHandAt(0, 0, 0, true), createHandAt(0, 0.3, 0, true)];

    plugin.detect(hands1, defaultSettings);
    vi.advanceTimersByTime(100);
    plugin.detect(hands2, defaultSettings);

    const angle = plugin.getRotationAngle();
    expect(Math.abs(angle)).toBeGreaterThan(0);
  });

  it('should clear history when hands stop gripping', () => {
    const hands1 = [createHandAt(0, 0, 0, true), createHandAt(0.3, 0, 0, true)];
    const hands2 = [createHandAt(0, 0, 0, false), createHandAt(0.3, 0, 0, false)];

    plugin.detect(hands1, defaultSettings);
    plugin.detect(hands2, defaultSettings);

    const angle = plugin.getRotationAngle();
    expect(angle).toBe(0);
  });

  it('should dispose and clear history', () => {
    const hands = [createHandAt(0, 0, 0, true), createHandAt(0.3, 0, 0, true)];
    plugin.detect(hands, defaultSettings);

    plugin.dispose();

    const angle = plugin.getRotationAngle();
    expect(angle).toBe(0);
  });
});

describe('ClapGesturePlugin', () => {
  let plugin: ClapGesturePlugin;

  beforeEach(() => {
    vi.useFakeTimers();
    plugin = new ClapGesturePlugin();
  });

  it('should have correct metadata', () => {
    expect(plugin.name).toBe('two-hand:clap');
    expect(plugin.priority).toBe(80); // Higher priority
    expect(plugin.gestureType).toBe('clap');
    expect(plugin.requiredHands).toBe(2);
  });

  it('should not detect with less than 2 hands', () => {
    const hand1 = createHandAt(0, 0, 0);
    const hands = [hand1];

    const detected = plugin.detect(hands, defaultSettings);
    expect(detected).toBe(false);
  });

  it('should detect clap when hands come together quickly', () => {
    // Hands moving together quickly (need more samples for velocity)
    const hands1 = [createHandAt(0, 0, 0), createHandAt(0.8, 0, 0)];
    const hands2 = [createHandAt(0, 0, 0), createHandAt(0.5, 0, 0)];
    const hands3 = [createHandAt(0, 0, 0), createHandAt(0.3, 0, 0)];
    const hands4 = [createHandAt(0, 0, 0), createHandAt(0.1, 0, 0)]; // Close and fast

    plugin.detect(hands1, defaultSettings);
    vi.advanceTimersByTime(40);

    plugin.detect(hands2, defaultSettings);
    vi.advanceTimersByTime(40);

    plugin.detect(hands3, defaultSettings);
    vi.advanceTimersByTime(40);

    const detected = plugin.detect(hands4, defaultSettings);
    expect(detected).toBe(true);
  });

  it('should not detect when hands move slowly together', () => {
    // Hands moving together slowly
    const hands1 = [createHandAt(0, 0, 0), createHandAt(0.5, 0, 0)];
    const hands2 = [createHandAt(0, 0, 0), createHandAt(0.4, 0, 0)];
    const hands3 = [createHandAt(0, 0, 0), createHandAt(0.3, 0, 0)];

    plugin.detect(hands1, defaultSettings);
    vi.advanceTimersByTime(200);

    plugin.detect(hands2, defaultSettings);
    vi.advanceTimersByTime(200);

    const detected = plugin.detect(hands3, defaultSettings);
    expect(detected).toBe(false);
  });

  it('should not detect when hands too far apart', () => {
    // Hands fast but still far apart
    const hands1 = [createHandAt(0, 0, 0), createHandAt(1.0, 0, 0)];
    const hands2 = [createHandAt(0, 0, 0), createHandAt(0.5, 0, 0)]; // Still > clapDistance

    plugin.detect(hands1, defaultSettings);
    vi.advanceTimersByTime(50);

    const detected = plugin.detect(hands2, defaultSettings);
    expect(detected).toBe(false);
  });

  it('should enforce cooldown period', () => {
    // First clap - build up velocity
    const clap1 = [
      [createHandAt(0, 0, 0), createHandAt(0.8, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.5, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.3, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.1, 0, 0)],
    ];

    let detected1 = false;
    for (let i = 0; i < clap1.length; i++) {
      detected1 = plugin.detect(clap1[i], defaultSettings);
      if (i < clap1.length - 1) {
        vi.advanceTimersByTime(40);
      }
    }
    expect(detected1).toBe(true);

    // Try to clap again immediately (within cooldown)
    vi.advanceTimersByTime(100); // < 500ms cooldown

    const clap2 = [
      [createHandAt(0, 0, 0), createHandAt(0.8, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.5, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.3, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.1, 0, 0)],
    ];

    let detected2 = false;
    for (let i = 0; i < clap2.length; i++) {
      detected2 = plugin.detect(clap2[i], defaultSettings);
      if (i < clap2.length - 1) {
        vi.advanceTimersByTime(40);
      }
    }
    expect(detected2).toBe(false); // Should not detect during cooldown
  });

  it('should allow clap after cooldown expires', () => {
    // First clap
    const clap1 = [
      [createHandAt(0, 0, 0), createHandAt(0.8, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.5, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.3, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.1, 0, 0)],
    ];

    for (let i = 0; i < clap1.length; i++) {
      plugin.detect(clap1[i], defaultSettings);
      if (i < clap1.length - 1) {
        vi.advanceTimersByTime(40);
      }
    }

    // Wait for cooldown to expire
    vi.advanceTimersByTime(600); // > 500ms cooldown

    // Try to clap again
    const clap2 = [
      [createHandAt(0, 0, 0), createHandAt(0.8, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.5, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.3, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.1, 0, 0)],
    ];

    let detected = false;
    for (let i = 0; i < clap2.length; i++) {
      detected = plugin.detect(clap2[i], defaultSettings);
      if (i < clap2.length - 1) {
        vi.advanceTimersByTime(40);
      }
    }
    expect(detected).toBe(true);
  });

  it('should dispose and clear state', () => {
    const hands = [createHandAt(0, 0, 0), createHandAt(0.5, 0, 0)];
    plugin.detect(hands, defaultSettings);

    plugin.dispose();

    // Should be able to detect after dispose (state reset)
    const clap = [
      [createHandAt(0, 0, 0), createHandAt(0.8, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.5, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.3, 0, 0)],
      [createHandAt(0, 0, 0), createHandAt(0.1, 0, 0)],
    ];

    let detected = false;
    for (let i = 0; i < clap.length; i++) {
      detected = plugin.detect(clap[i], defaultSettings);
      if (i < clap.length - 1) {
        vi.advanceTimersByTime(40);
      }
    }
    expect(detected).toBe(true);
  });
});
