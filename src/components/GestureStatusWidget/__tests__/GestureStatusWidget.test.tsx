import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { GestureStatusWidget } from '../GestureStatusWidget';
import { useGestureStore } from '@/hooks/useGestureRecognition';

// Mock the gesture store
vi.mock('@/hooks/useGestureRecognition', () => ({
  useGestureStore: vi.fn(),
}));

describe('GestureStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no gestures and auto-hidden', async () => {
    vi.mocked(useGestureStore).mockReturnValue([]);

    const { container } = render(<GestureStatusWidget />);

    // Initially visible with "No hands detected"
    expect(screen.getByText('No hands detected')).toBeInTheDocument();

    // After 3 seconds, should hide
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 3100));
    });

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders gesture cards when gestures are present', () => {
    const mockGestures = [
      {
        handId: 'left_hand',
        gesture: 'pinch' as const,
        confidence: 0.85,
      },
      {
        handId: 'right_hand',
        gesture: 'open' as const,
        confidence: 0.92,
      },
    ];

    vi.mocked(useGestureStore).mockReturnValue(mockGestures);

    render(<GestureStatusWidget />);

    expect(screen.getByText('Gesture Status')).toBeInTheDocument();
    expect(screen.getByText('Left Hand')).toBeInTheDocument();
    expect(screen.getByText('Right Hand')).toBeInTheDocument();
    expect(screen.getByText('Pinch')).toBeInTheDocument();
    expect(screen.getByText('Open Hand')).toBeInTheDocument();
  });

  it('displays confidence percentages', () => {
    const mockGestures = [
      {
        handId: 'left_hand',
        gesture: 'fist' as const,
        confidence: 0.75,
      },
    ];

    vi.mocked(useGestureStore).mockReturnValue(mockGestures);

    render(<GestureStatusWidget />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows auto-hide footer text in expanded mode', () => {
    const mockGestures = [
      {
        handId: 'left_hand',
        gesture: 'point' as const,
        confidence: 0.65,
      },
    ];

    vi.mocked(useGestureStore).mockReturnValue(mockGestures);

    render(<GestureStatusWidget />);

    expect(screen.getByText('Auto-hides after 3s')).toBeInTheDocument();
  });

  it('becomes visible again when gestures are detected after hiding', async () => {
    const { rerender } = render(<GestureStatusWidget />);

    // Initially no gestures
    vi.mocked(useGestureStore).mockReturnValue([]);

    rerender(<GestureStatusWidget />);

    // Wait for auto-hide
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 3100));
    });

    // Add gestures
    const mockGestures = [
      {
        handId: 'left_hand',
        gesture: 'pinch' as const,
        confidence: 0.8,
      },
    ];

    vi.mocked(useGestureStore).mockReturnValue(mockGestures);

    rerender(<GestureStatusWidget />);

    // Should be visible again
    await waitFor(() => {
      expect(screen.getByText('Gesture Status')).toBeInTheDocument();
    });
  });
});
