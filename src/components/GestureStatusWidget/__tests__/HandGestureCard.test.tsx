import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HandGestureCard } from '../HandGestureCard';
import type { HandGesture } from '@/types/gesture.types';

describe('HandGestureCard', () => {
  const mockLeftHandGesture: HandGesture = {
    handId: 'left_hand',
    gesture: 'pinch',
    confidence: 0.85,
  };

  const mockRightHandGesture: HandGesture = {
    handId: 'right_hand',
    gesture: 'open',
    confidence: 0.92,
  };

  describe('Expanded Mode', () => {
    it('renders left hand gesture correctly', () => {
      render(
        <HandGestureCard handId="left_hand" gesture={mockLeftHandGesture} compact={false} />
      );

      expect(screen.getByText('Left Hand')).toBeInTheDocument();
      expect(screen.getByText('Pinch')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Confidence')).toBeInTheDocument();
    });

    it('renders right hand gesture correctly', () => {
      render(
        <HandGestureCard handId="right_hand" gesture={mockRightHandGesture} compact={false} />
      );

      expect(screen.getByText('Right Hand')).toBeInTheDocument();
      expect(screen.getByText('Open Hand')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
    });

    it('displays gesture icons', () => {
      const { container } = render(
        <HandGestureCard handId="left_hand" gesture={mockLeftHandGesture} compact={false} />
      );

      const icon = container.querySelector('[role="img"]');
      expect(icon).toBeInTheDocument();
      expect(icon?.getAttribute('aria-label')).toBe('pinch');
    });

    it('applies correct color classes based on handedness', () => {
      const { container: leftContainer } = render(
        <HandGestureCard handId="left_hand" gesture={mockLeftHandGesture} compact={false} />
      );

      const { container: rightContainer } = render(
        <HandGestureCard handId="right_hand" gesture={mockRightHandGesture} compact={false} />
      );

      const leftHand = leftContainer.querySelector('.text-blue-400');
      const rightHand = rightContainer.querySelector('.text-purple-400');

      expect(leftHand).toBeInTheDocument();
      expect(rightHand).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('renders in compact mode', () => {
      render(
        <HandGestureCard handId="left_hand" gesture={mockLeftHandGesture} compact={true} />
      );

      // Compact mode shows only first letter
      expect(screen.getByText('L')).toBeInTheDocument();
      // Confidence text should not be visible in compact mode
      expect(screen.queryByText('Confidence')).not.toBeInTheDocument();
    });

    it('shows confidence percentage in title attribute', () => {
      const { container } = render(
        <HandGestureCard handId="left_hand" gesture={mockLeftHandGesture} compact={true} />
      );

      const confidenceBar = container.querySelector('[title="85% confidence"]');
      expect(confidenceBar).toBeInTheDocument();
    });
  });

  describe('Confidence Bar Colors', () => {
    it('displays green for high confidence (>= 70%)', () => {
      const highConfidenceGesture: HandGesture = {
        handId: 'left_hand',
        gesture: 'pinch',
        confidence: 0.8,
      };

      const { container } = render(
        <HandGestureCard handId="left_hand" gesture={highConfidenceGesture} compact={false} />
      );

      const greenBar = container.querySelector('.bg-green-500');
      expect(greenBar).toBeInTheDocument();
    });

    it('displays yellow for medium confidence (40-70%)', () => {
      const mediumConfidenceGesture: HandGesture = {
        handId: 'left_hand',
        gesture: 'pinch',
        confidence: 0.5,
      };

      const { container } = render(
        <HandGestureCard handId="left_hand" gesture={mediumConfidenceGesture} compact={false} />
      );

      const yellowBar = container.querySelector('.bg-yellow-500');
      expect(yellowBar).toBeInTheDocument();
    });

    it('displays red for low confidence (< 40%)', () => {
      const lowConfidenceGesture: HandGesture = {
        handId: 'left_hand',
        gesture: 'pinch',
        confidence: 0.2,
      };

      const { container } = render(
        <HandGestureCard handId="left_hand" gesture={lowConfidenceGesture} compact={false} />
      );

      const redBar = container.querySelector('.bg-red-500');
      expect(redBar).toBeInTheDocument();
    });
  });

  describe('Gesture Types', () => {
    const gestureTypes: Array<[string, string]> = [
      ['pinch', 'Pinch'],
      ['open', 'Open Hand'],
      ['fist', 'Fist'],
      ['point', 'Point'],
      ['swipeLeft', 'Swipe Left'],
      ['swipeRight', 'Swipe Right'],
      ['swipeUp', 'Swipe Up'],
      ['swipeDown', 'Swipe Down'],
      ['none', 'None'],
    ];

    gestureTypes.forEach(([gestureType, expectedLabel]) => {
      it(`displays correct label for ${gestureType}`, () => {
        const gesture: HandGesture = {
          handId: 'left_hand',
          gesture: gestureType as any,
          confidence: 0.8,
        };

        render(<HandGestureCard handId="left_hand" gesture={gesture} compact={false} />);

        expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      });
    });
  });
});
