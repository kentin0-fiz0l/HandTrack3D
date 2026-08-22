import { describe, it, expect } from 'vitest';
import {
  getConfidenceLevel,
  getConfidenceColor,
  getConfidenceTextColor,
  formatConfidencePercent,
} from '../gestureConfidence';

describe('gestureConfidence', () => {
  describe('getConfidenceLevel', () => {
    it('returns high for confidence >= 0.7', () => {
      expect(getConfidenceLevel(0.7)).toBe('high');
      expect(getConfidenceLevel(0.85)).toBe('high');
      expect(getConfidenceLevel(1.0)).toBe('high');
    });

    it('returns medium for confidence between 0.4 and 0.7', () => {
      expect(getConfidenceLevel(0.4)).toBe('medium');
      expect(getConfidenceLevel(0.5)).toBe('medium');
      expect(getConfidenceLevel(0.69)).toBe('medium');
    });

    it('returns low for confidence < 0.4', () => {
      expect(getConfidenceLevel(0.0)).toBe('low');
      expect(getConfidenceLevel(0.2)).toBe('low');
      expect(getConfidenceLevel(0.39)).toBe('low');
    });

    it('handles edge cases', () => {
      expect(getConfidenceLevel(0.7)).toBe('high');
      expect(getConfidenceLevel(0.4)).toBe('medium');
    });
  });

  describe('getConfidenceColor', () => {
    it('returns green for high confidence', () => {
      expect(getConfidenceColor(0.8)).toBe('bg-green-500');
      expect(getConfidenceColor(1.0)).toBe('bg-green-500');
    });

    it('returns yellow for medium confidence', () => {
      expect(getConfidenceColor(0.5)).toBe('bg-yellow-500');
      expect(getConfidenceColor(0.6)).toBe('bg-yellow-500');
    });

    it('returns red for low confidence', () => {
      expect(getConfidenceColor(0.2)).toBe('bg-red-500');
      expect(getConfidenceColor(0.0)).toBe('bg-red-500');
    });
  });

  describe('getConfidenceTextColor', () => {
    it('returns green text for high confidence', () => {
      expect(getConfidenceTextColor(0.8)).toBe('text-green-400');
      expect(getConfidenceTextColor(1.0)).toBe('text-green-400');
    });

    it('returns yellow text for medium confidence', () => {
      expect(getConfidenceTextColor(0.5)).toBe('text-yellow-400');
      expect(getConfidenceTextColor(0.6)).toBe('text-yellow-400');
    });

    it('returns red text for low confidence', () => {
      expect(getConfidenceTextColor(0.2)).toBe('text-red-400');
      expect(getConfidenceTextColor(0.0)).toBe('text-red-400');
    });
  });

  describe('formatConfidencePercent', () => {
    it('formats confidence as percentage', () => {
      expect(formatConfidencePercent(0.0)).toBe('0%');
      expect(formatConfidencePercent(0.5)).toBe('50%');
      expect(formatConfidencePercent(1.0)).toBe('100%');
    });

    it('rounds to nearest integer', () => {
      expect(formatConfidencePercent(0.854)).toBe('85%');
      expect(formatConfidencePercent(0.856)).toBe('86%');
    });

    it('handles edge cases', () => {
      expect(formatConfidencePercent(0.001)).toBe('0%');
      expect(formatConfidencePercent(0.999)).toBe('100%');
    });
  });
});
