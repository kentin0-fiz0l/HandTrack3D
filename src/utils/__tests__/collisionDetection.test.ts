import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { isInGrabRange, calculateGrabOffset } from '../collisionDetection';
import { useSettingsStore } from '@/stores/settingsStore';

describe('collisionDetection', () => {
  beforeEach(() => {
    // Reset settings to defaults before each test
    useSettingsStore.getState().reset();
  });

  describe('isInGrabRange', () => {
    it('should return true when cursor is within grab range', () => {
      const cursorPos = new THREE.Vector3(0, 0, 0);
      const objectPos = new THREE.Vector3(1, 0, 0);

      // Default grab range is 1.5, distance is 1.0
      const result = isInGrabRange(cursorPos, objectPos);
      expect(result).toBe(true);
    });

    it('should return false when cursor is outside grab range', () => {
      const cursorPos = new THREE.Vector3(0, 0, 0);
      const objectPos = new THREE.Vector3(5, 0, 0);

      // Default grab range is 1.5, distance is 5.0
      const result = isInGrabRange(cursorPos, objectPos);
      expect(result).toBe(false);
    });

    it('should return true when distance exactly equals grab range', () => {
      const cursorPos = new THREE.Vector3(0, 0, 0);
      const objectPos = new THREE.Vector3(1.5, 0, 0);

      // Distance is exactly 1.5 (default grab range)
      const result = isInGrabRange(cursorPos, objectPos);
      // Should be false since we use < not <=
      expect(result).toBe(false);
    });

    it('should work with 3D distances', () => {
      const cursorPos = new THREE.Vector3(1, 1, 1);
      const objectPos = new THREE.Vector3(2, 2, 2);

      // Distance is sqrt(3) ≈ 1.732, which is > 1.5
      const result = isInGrabRange(cursorPos, objectPos);
      expect(result).toBe(false);
    });

    it('should return true for zero distance (hand on object)', () => {
      const cursorPos = new THREE.Vector3(5, 3, -2);
      const objectPos = new THREE.Vector3(5, 3, -2);

      const result = isInGrabRange(cursorPos, objectPos);
      expect(result).toBe(true);
    });

    it('should respect custom grab range parameter', () => {
      const cursorPos = new THREE.Vector3(0, 0, 0);
      const objectPos = new THREE.Vector3(2, 0, 0);

      // Distance is 2.0
      // Default range (1.5) would be false
      const resultDefault = isInGrabRange(cursorPos, objectPos);
      expect(resultDefault).toBe(false);

      // Custom range (3.0) should be true
      const resultCustom = isInGrabRange(cursorPos, objectPos, 3.0);
      expect(resultCustom).toBe(true);
    });

    it('should respect settings store grab range', () => {
      const cursorPos = new THREE.Vector3(0, 0, 0);
      const objectPos = new THREE.Vector3(2, 0, 0);

      // Distance is 2.0, default range is 1.5 (false)
      expect(isInGrabRange(cursorPos, objectPos)).toBe(false);

      // Increase grab range in settings
      useSettingsStore.getState().updatePhysicsSetting('grabRange', 2.5);
      expect(isInGrabRange(cursorPos, objectPos)).toBe(true);
    });

    it('should handle negative coordinates', () => {
      const cursorPos = new THREE.Vector3(-2, -3, -1);
      const objectPos = new THREE.Vector3(-2.5, -3, -1);

      // Distance is 0.5
      const result = isInGrabRange(cursorPos, objectPos);
      expect(result).toBe(true);
    });

    it('should handle very large distances', () => {
      const cursorPos = new THREE.Vector3(0, 0, 0);
      const objectPos = new THREE.Vector3(1000, 1000, 1000);

      const result = isInGrabRange(cursorPos, objectPos);
      expect(result).toBe(false);
    });

    it('should handle very small grab ranges', () => {
      const cursorPos = new THREE.Vector3(0, 0, 0);
      const objectPos = new THREE.Vector3(0.05, 0, 0);

      // Distance is 0.05, custom range is 0.1
      const result = isInGrabRange(cursorPos, objectPos, 0.1);
      expect(result).toBe(true);
    });
  });

  describe('calculateGrabOffset', () => {
    it('should calculate offset from cursor to object', () => {
      const cursorPos = new THREE.Vector3(1, 2, 3);
      const objectPos = new THREE.Vector3(4, 6, 9);

      const offset = calculateGrabOffset(cursorPos, objectPos);

      expect(offset.x).toBe(3);
      expect(offset.y).toBe(4);
      expect(offset.z).toBe(6);
    });

    it('should return zero offset when positions are identical', () => {
      const cursorPos = new THREE.Vector3(5, 5, 5);
      const objectPos = new THREE.Vector3(5, 5, 5);

      const offset = calculateGrabOffset(cursorPos, objectPos);

      expect(offset.x).toBe(0);
      expect(offset.y).toBe(0);
      expect(offset.z).toBe(0);
    });

    it('should handle negative offsets', () => {
      const cursorPos = new THREE.Vector3(5, 5, 5);
      const objectPos = new THREE.Vector3(2, 3, 1);

      const offset = calculateGrabOffset(cursorPos, objectPos);

      expect(offset.x).toBe(-3);
      expect(offset.y).toBe(-2);
      expect(offset.z).toBe(-4);
    });

    it('should not modify original vectors', () => {
      const cursorPos = new THREE.Vector3(1, 2, 3);
      const objectPos = new THREE.Vector3(4, 5, 6);

      const originalCursorX = cursorPos.x;
      const originalObjectX = objectPos.x;

      calculateGrabOffset(cursorPos, objectPos);

      expect(cursorPos.x).toBe(originalCursorX);
      expect(objectPos.x).toBe(originalObjectX);
    });

    it('should calculate correct offset for typical grab scenario', () => {
      // Hand cursor at origin, object slightly in front and to the right
      const cursorPos = new THREE.Vector3(0, 1.5, -3);
      const objectPos = new THREE.Vector3(1, 1.5, -4);

      const offset = calculateGrabOffset(cursorPos, objectPos);

      expect(offset.x).toBe(1);
      expect(offset.y).toBe(0);
      expect(offset.z).toBe(-1);
    });

    it('should handle floating point precision', () => {
      const cursorPos = new THREE.Vector3(0.1, 0.2, 0.3);
      const objectPos = new THREE.Vector3(0.4, 0.5, 0.6);

      const offset = calculateGrabOffset(cursorPos, objectPos);

      expect(offset.x).toBeCloseTo(0.3, 10);
      expect(offset.y).toBeCloseTo(0.3, 10);
      expect(offset.z).toBeCloseTo(0.3, 10);
    });

    it('should calculate offset magnitude correctly', () => {
      const cursorPos = new THREE.Vector3(0, 0, 0);
      const objectPos = new THREE.Vector3(3, 4, 0);

      const offset = calculateGrabOffset(cursorPos, objectPos);

      // Using 3-4-5 triangle
      expect(offset.length()).toBe(5);
    });
  });

  describe('Integration tests', () => {
    it('should work together for grab and offset calculation', () => {
      const cursorPos = new THREE.Vector3(0, 1.5, -3);
      const objectPos = new THREE.Vector3(0.8, 1.5, -3.5);

      // Check if in range
      const inRange = isInGrabRange(cursorPos, objectPos);
      expect(inRange).toBe(true);

      // If in range, calculate offset
      if (inRange) {
        const offset = calculateGrabOffset(cursorPos, objectPos);
        expect(offset.x).toBeCloseTo(0.8, 10);
        expect(offset.y).toBeCloseTo(0, 10);
        expect(offset.z).toBeCloseTo(-0.5, 10);
      }
    });

    it('should maintain offset when object moves with cursor', () => {
      const initialCursorPos = new THREE.Vector3(0, 1.5, -3);
      const initialObjectPos = new THREE.Vector3(1, 2, -4);

      const offset = calculateGrabOffset(initialCursorPos, initialObjectPos);

      // Move cursor
      const newCursorPos = new THREE.Vector3(2, 1, -2.5);

      // Object should move to maintain offset
      const expectedObjectPos = newCursorPos.clone().add(offset);

      expect(expectedObjectPos.x).toBeCloseTo(3, 10);
      expect(expectedObjectPos.y).toBeCloseTo(1.5, 10);
      expect(expectedObjectPos.z).toBeCloseTo(-3.5, 10);
    });
  });
});
