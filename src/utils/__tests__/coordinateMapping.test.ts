import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  mapHandTo3D,
  getIndexFingerTip,
  getThumbTip,
  getWrist,
} from '../coordinateMapping';
import { createOpenHandLandmarks } from '@/test/fixtures/mockHandLandmarks';
import type { HandLandmark } from '@/types/hand.types';

describe('coordinateMapping', () => {
  describe('mapHandTo3D', () => {
    const mockCamera = new THREE.PerspectiveCamera();
    const canvasWidth = 640;
    const canvasHeight = 480;

    it('should convert hand landmark to 3D position', () => {
      const landmark: HandLandmark = { x: 0.5, y: 0.5, z: 0 };
      const result = mapHandTo3D(landmark, mockCamera, canvasWidth, canvasHeight);

      expect(result).toBeInstanceOf(THREE.Vector3);
      expect(result.x).toBeDefined();
      expect(result.y).toBeDefined();
      expect(result.z).toBeDefined();
    });

    it('should flip X coordinate for superimposed view', () => {
      // Hand at left (x=0.2) should map to positive X in 3D space
      const leftLandmark: HandLandmark = { x: 0.2, y: 0.5, z: 0 };
      const leftResult = mapHandTo3D(leftLandmark, mockCamera, canvasWidth, canvasHeight);

      // Hand at right (x=0.8) should map to negative X in 3D space
      const rightLandmark: HandLandmark = { x: 0.8, y: 0.5, z: 0 };
      const rightResult = mapHandTo3D(rightLandmark, mockCamera, canvasWidth, canvasHeight);

      expect(leftResult.x).toBeGreaterThan(rightResult.x);
    });

    it('should map center hand position to near-zero X', () => {
      const centerLandmark: HandLandmark = { x: 0.5, y: 0.5, z: 0 };
      const result = mapHandTo3D(centerLandmark, mockCamera, canvasWidth, canvasHeight);

      expect(result.x).toBeCloseTo(0, 0.1);
    });

    it('should flip Y coordinate (MediaPipe top=0, Three.js top=positive)', () => {
      // Hand at top (y=0) should map to higher Y in 3D
      const topLandmark: HandLandmark = { x: 0.5, y: 0, z: 0 };
      const topResult = mapHandTo3D(topLandmark, mockCamera, canvasWidth, canvasHeight);

      // Hand at bottom (y=1) should map to lower Y in 3D
      const bottomLandmark: HandLandmark = { x: 0.5, y: 1, z: 0 };
      const bottomResult = mapHandTo3D(bottomLandmark, mockCamera, canvasWidth, canvasHeight);

      expect(topResult.y).toBeGreaterThan(bottomResult.y);
    });

    it('should map Y to comfortable reaching height', () => {
      const middleLandmark: HandLandmark = { x: 0.5, y: 0.5, z: 0 };
      const result = mapHandTo3D(middleLandmark, mockCamera, canvasWidth, canvasHeight);

      // Y should be in range 0.5 to 2.5 (comfortable chest to head level)
      expect(result.y).toBeGreaterThanOrEqual(0.5);
      expect(result.y).toBeLessThanOrEqual(2.5);
    });

    it('should handle depth (Z coordinate)', () => {
      // Hand closer to camera (negative z) should be less negative in 3D
      const closeLandmark: HandLandmark = { x: 0.5, y: 0.5, z: -0.1 };
      const closeResult = mapHandTo3D(closeLandmark, mockCamera, canvasWidth, canvasHeight);

      // Hand farther from camera (positive z) should be more negative in 3D
      const farLandmark: HandLandmark = { x: 0.5, y: 0.5, z: 0.1 };
      const farResult = mapHandTo3D(farLandmark, mockCamera, canvasWidth, canvasHeight);

      expect(closeResult.z).toBeGreaterThan(farResult.z);
    });

    it('should map neutral depth to around -3', () => {
      const neutralLandmark: HandLandmark = { x: 0.5, y: 0.5, z: 0 };
      const result = mapHandTo3D(neutralLandmark, mockCamera, canvasWidth, canvasHeight);

      expect(result.z).toBeCloseTo(-3, 0.5);
    });

    it('should handle extreme coordinates', () => {
      const extremeLandmark: HandLandmark = { x: 1.5, y: -0.5, z: 2 };
      const result = mapHandTo3D(extremeLandmark, mockCamera, canvasWidth, canvasHeight);

      expect(result).toBeInstanceOf(THREE.Vector3);
      expect(Number.isFinite(result.x)).toBe(true);
      expect(Number.isFinite(result.y)).toBe(true);
      expect(Number.isFinite(result.z)).toBe(true);
    });

    it('should handle zero coordinates', () => {
      const zeroLandmark: HandLandmark = { x: 0, y: 0, z: 0 };
      const result = mapHandTo3D(zeroLandmark, mockCamera, canvasWidth, canvasHeight);

      expect(result.x).toBeCloseTo(3, 0.1); // Far right
      expect(result.y).toBeCloseTo(2.5, 0.1); // Top
      expect(result.z).toBeCloseTo(-3, 0.1); // Neutral depth
    });

    it('should scale X movement appropriately', () => {
      const left: HandLandmark = { x: 0, y: 0.5, z: 0 };
      const right: HandLandmark = { x: 1, y: 0.5, z: 0 };

      const leftResult = mapHandTo3D(left, mockCamera, canvasWidth, canvasHeight);
      const rightResult = mapHandTo3D(right, mockCamera, canvasWidth, canvasHeight);

      const xRange = Math.abs(leftResult.x - rightResult.x);
      expect(xRange).toBeCloseTo(6, 0.1); // Full range is 6 units
    });

    it('should scale Y movement appropriately', () => {
      const top: HandLandmark = { x: 0.5, y: 0, z: 0 };
      const bottom: HandLandmark = { x: 0.5, y: 1, z: 0 };

      const topResult = mapHandTo3D(top, mockCamera, canvasWidth, canvasHeight);
      const bottomResult = mapHandTo3D(bottom, mockCamera, canvasWidth, canvasHeight);

      const yRange = Math.abs(topResult.y - bottomResult.y);
      expect(yRange).toBeCloseTo(2, 0.1); // Full range is 2 units
    });
  });

  describe('getIndexFingerTip', () => {
    it('should return landmark at index 8', () => {
      const landmarks = createOpenHandLandmarks();
      const tip = getIndexFingerTip(landmarks);

      expect(tip).toBe(landmarks[8]);
    });

    it('should return correct coordinates', () => {
      const landmarks = createOpenHandLandmarks();
      const tip = getIndexFingerTip(landmarks);

      expect(tip.x).toBeDefined();
      expect(tip.y).toBeDefined();
      expect(tip.z).toBeDefined();
    });
  });

  describe('getThumbTip', () => {
    it('should return landmark at index 4', () => {
      const landmarks = createOpenHandLandmarks();
      const tip = getThumbTip(landmarks);

      expect(tip).toBe(landmarks[4]);
    });

    it('should return correct coordinates', () => {
      const landmarks = createOpenHandLandmarks();
      const tip = getThumbTip(landmarks);

      expect(tip.x).toBeDefined();
      expect(tip.y).toBeDefined();
      expect(tip.z).toBeDefined();
    });
  });

  describe('getWrist', () => {
    it('should return landmark at index 0', () => {
      const landmarks = createOpenHandLandmarks();
      const wrist = getWrist(landmarks);

      expect(wrist).toBe(landmarks[0]);
    });

    it('should return correct coordinates', () => {
      const landmarks = createOpenHandLandmarks();
      const wrist = getWrist(landmarks);

      expect(wrist.x).toBeDefined();
      expect(wrist.y).toBeDefined();
      expect(wrist.z).toBeDefined();
    });
  });

  describe('Boundary conditions', () => {
    const mockCamera = new THREE.PerspectiveCamera();
    const canvasWidth = 640;
    const canvasHeight = 480;

    it('should handle landmarks at boundaries (0, 0, 0)', () => {
      const landmark: HandLandmark = { x: 0, y: 0, z: 0 };
      const result = mapHandTo3D(landmark, mockCamera, canvasWidth, canvasHeight);

      expect(Number.isFinite(result.x)).toBe(true);
      expect(Number.isFinite(result.y)).toBe(true);
      expect(Number.isFinite(result.z)).toBe(true);
    });

    it('should handle landmarks at boundaries (1, 1, 0)', () => {
      const landmark: HandLandmark = { x: 1, y: 1, z: 0 };
      const result = mapHandTo3D(landmark, mockCamera, canvasWidth, canvasHeight);

      expect(Number.isFinite(result.x)).toBe(true);
      expect(Number.isFinite(result.y)).toBe(true);
      expect(Number.isFinite(result.z)).toBe(true);
    });

    it('should handle negative z values', () => {
      const landmark: HandLandmark = { x: 0.5, y: 0.5, z: -1 };
      const result = mapHandTo3D(landmark, mockCamera, canvasWidth, canvasHeight);

      expect(result.z).toBeGreaterThan(-10);
    });

    it('should handle very small movements', () => {
      const landmark1: HandLandmark = { x: 0.5, y: 0.5, z: 0 };
      const landmark2: HandLandmark = { x: 0.501, y: 0.501, z: 0.001 };

      const result1 = mapHandTo3D(landmark1, mockCamera, canvasWidth, canvasHeight);
      const result2 = mapHandTo3D(landmark2, mockCamera, canvasWidth, canvasHeight);

      expect(result1.distanceTo(result2)).toBeLessThan(0.1);
    });
  });
});
