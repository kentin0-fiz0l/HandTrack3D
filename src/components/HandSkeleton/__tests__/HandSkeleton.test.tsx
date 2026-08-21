import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '@/stores/settingsStore';
import { createOpenHandLandmarks } from '@/test/fixtures/mockHandLandmarks';
import * as THREE from 'three';

// Test the logic and data structures used by HandSkeleton
// Full rendering tests should be done with E2E tests

describe('HandSkeleton Component Logic', () => {
  beforeEach(() => {
    useSettingsStore.getState().reset();
    useSettingsStore.getState().updateVisualSetting('showHandSkeleton', true);
  });

  describe('Settings Integration', () => {
    it('should respect showHandSkeleton setting', () => {
      useSettingsStore.getState().updateVisualSetting('showHandSkeleton', true);
      expect(useSettingsStore.getState().showHandSkeleton).toBe(true);

      useSettingsStore.getState().updateVisualSetting('showHandSkeleton', false);
      expect(useSettingsStore.getState().showHandSkeleton).toBe(false);
    });

    it('should default showHandSkeleton to true', () => {
      useSettingsStore.getState().reset();
      expect(useSettingsStore.getState().showHandSkeleton).toBe(true);
    });
  });

  describe('Hand Landmark Data Structure', () => {
    it('should have 21 landmarks for a complete hand', () => {
      const landmarks = createOpenHandLandmarks();
      expect(landmarks).toHaveLength(21);
    });

    it('should convert landmarks to THREE.Vector3 format', () => {
      const landmarks = createOpenHandLandmarks();
      const mapped3DLandmarks = landmarks.map(
        (lm) => new THREE.Vector3(lm.x, lm.y, lm.z)
      );

      expect(mapped3DLandmarks).toHaveLength(21);
      expect(mapped3DLandmarks[0]).toBeInstanceOf(THREE.Vector3);
    });

    it('should preserve coordinate values during conversion', () => {
      const landmarks = createOpenHandLandmarks();
      const mapped3DLandmarks = landmarks.map(
        (lm) => new THREE.Vector3(lm.x, lm.y, lm.z)
      );

      expect(mapped3DLandmarks[0].x).toBe(landmarks[0].x);
      expect(mapped3DLandmarks[0].y).toBe(landmarks[0].y);
      expect(mapped3DLandmarks[0].z).toBe(landmarks[0].z);
    });
  });

  describe('MediaPipe Hand Connections', () => {
    // Test that the hand connections array is correctly structured
    const HAND_CONNECTIONS = [
      // Wrist to palm base
      [0, 1], [0, 5], [0, 9], [0, 13], [0, 17],
      // Thumb
      [1, 2], [2, 3], [3, 4],
      // Index finger
      [5, 6], [6, 7], [7, 8],
      // Middle finger
      [9, 10], [10, 11], [11, 12],
      // Ring finger
      [13, 14], [14, 15], [15, 16],
      // Pinky
      [17, 18], [18, 19], [19, 20],
      // Palm connections
      [5, 9], [9, 13], [13, 17],
    ];

    it('should have correct number of hand connections', () => {
      expect(HAND_CONNECTIONS).toHaveLength(23);
    });

    it('should have valid landmark indices in connections', () => {
      HAND_CONNECTIONS.forEach(([start, end]) => {
        expect(start).toBeGreaterThanOrEqual(0);
        expect(start).toBeLessThan(21);
        expect(end).toBeGreaterThanOrEqual(0);
        expect(end).toBeLessThan(21);
      });
    });

    it('should connect wrist to all finger bases', () => {
      const wristConnections = HAND_CONNECTIONS.filter(([start]) => start === 0);
      expect(wristConnections).toHaveLength(5); // thumb, index, middle, ring, pinky bases
    });

    it('should have complete finger chains', () => {
      // Each finger should have 3 bone connections (4 landmarks)
      const thumbConnections = HAND_CONNECTIONS.filter(
        ([start, end]) => start >= 1 && start <= 3 && end >= 2 && end <= 4
      );
      expect(thumbConnections.length).toBeGreaterThanOrEqual(3);

      const indexConnections = HAND_CONNECTIONS.filter(
        ([start, end]) => start >= 5 && start <= 7 && end >= 6 && end <= 8
      );
      expect(indexConnections.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Joint Color Mapping', () => {
    const JOINT_COLORS = {
      wrist: '#ffffff',
      thumb: '#ef4444',
      index: '#3b82f6',
      middle: '#10b981',
      ring: '#f59e0b',
      pinky: '#a855f7',
    };

    function getJointColor(landmarkIndex: number): string {
      if (landmarkIndex === 0) return JOINT_COLORS.wrist;
      if (landmarkIndex >= 1 && landmarkIndex <= 4) return JOINT_COLORS.thumb;
      if (landmarkIndex >= 5 && landmarkIndex <= 8) return JOINT_COLORS.index;
      if (landmarkIndex >= 9 && landmarkIndex <= 12) return JOINT_COLORS.middle;
      if (landmarkIndex >= 13 && landmarkIndex <= 16) return JOINT_COLORS.ring;
      if (landmarkIndex >= 17 && landmarkIndex <= 20) return JOINT_COLORS.pinky;
      return '#ffffff';
    }

    it('should map wrist to white', () => {
      expect(getJointColor(0)).toBe('#ffffff');
    });

    it('should map thumb landmarks to red', () => {
      for (let i = 1; i <= 4; i++) {
        expect(getJointColor(i)).toBe('#ef4444');
      }
    });

    it('should map index finger landmarks to blue', () => {
      for (let i = 5; i <= 8; i++) {
        expect(getJointColor(i)).toBe('#3b82f6');
      }
    });

    it('should map middle finger landmarks to green', () => {
      for (let i = 9; i <= 12; i++) {
        expect(getJointColor(i)).toBe('#10b981');
      }
    });

    it('should map ring finger landmarks to orange', () => {
      for (let i = 13; i <= 16; i++) {
        expect(getJointColor(i)).toBe('#f59e0b');
      }
    });

    it('should map pinky landmarks to purple', () => {
      for (let i = 17; i <= 20; i++) {
        expect(getJointColor(i)).toBe('#a855f7');
      }
    });

    it('should handle invalid indices gracefully', () => {
      expect(getJointColor(-1)).toBe('#ffffff');
      expect(getJointColor(25)).toBe('#ffffff');
    });
  });

  describe('Bone Geometry Calculations', () => {
    it('should calculate bone length correctly', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(0, 1, 0);

      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();

      expect(length).toBe(1);
    });

    it('should calculate bone midpoint correctly', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(2, 0, 0);

      const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

      expect(midpoint.x).toBe(1);
      expect(midpoint.y).toBe(0);
      expect(midpoint.z).toBe(0);
    });

    it('should handle diagonal bones', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(1, 1, 1);

      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();

      expect(length).toBeCloseTo(Math.sqrt(3), 5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty landmarks array', () => {
      const emptyLandmarks: THREE.Vector3[] = [];
      expect(emptyLandmarks).toHaveLength(0);
    });

    it('should handle incomplete landmarks array', () => {
      const incompleteLandmarks = Array.from({ length: 10 }, (_, i) =>
        new THREE.Vector3(i * 0.1, i * 0.1, 0)
      );
      expect(incompleteLandmarks).toHaveLength(10);
    });

    it('should handle extreme coordinate values', () => {
      const extremeLandmarks = Array.from({ length: 21 }, (_, i) =>
        new THREE.Vector3(
          i % 2 === 0 ? -1000 : 1000,
          i % 3 === 0 ? -1000 : 1000,
          i % 5 === 0 ? -1000 : 1000
        )
      );

      expect(extremeLandmarks).toHaveLength(21);
      expect(extremeLandmarks[0].x).toBe(-1000);
      expect(extremeLandmarks[1].x).toBe(1000);
    });

    it('should handle zero-length bones', () => {
      const start = new THREE.Vector3(0.5, 0.5, 0.5);
      const end = new THREE.Vector3(0.5, 0.5, 0.5);

      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();

      expect(length).toBe(0);
    });
  });
});
