import { useState, useEffect } from 'react';
import { useHandTrackingStore } from '@/stores/handTrackingStore';
import { useGestureStore } from '@/hooks/useGestureRecognition';
import { HandGestureCard } from './HandGestureCard';

interface GestureStatusWidgetProps {
  compact?: boolean;
}

export function GestureStatusWidget({ compact = false }: GestureStatusWidgetProps) {
  const hands = useHandTrackingStore((state) => state.hands);
  const gestures = useGestureStore((state) => state.gestures);
  const [visible, setVisible] = useState(true);
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-hide after 3 seconds of no hands detected
  useEffect(() => {
    if (hands.length === 0) {
      // Start auto-hide timer
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      setAutoHideTimer(timer);
    } else {
      // Hands detected, show widget and clear timer
      setVisible(true);
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
        setAutoHideTimer(null);
      }
    }

    return () => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
    };
  }, [hands.length, autoHideTimer]);

  // Don't render if not visible or no hands
  if (!visible || hands.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-24 left-4 space-y-2 z-30 animate-fade-in">
      {/* Header with toggle button */}
      {!compact && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white text-sm font-semibold">Live Gestures</h3>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
            title="Hide widget"
          >
            Hide
          </button>
        </div>
      )}

      {/* Gesture cards for each hand */}
      {hands.map((hand) => {
        // Find corresponding gesture for this hand
        const gesture = gestures.find((g) => g.handId === hand.handedness) || null;

        return (
          <HandGestureCard
            key={hand.handedness}
            hand={hand}
            gesture={gesture}
            compact={compact}
          />
        );
      })}

      {/* Keyboard hint */}
      {!compact && hands.length > 0 && (
        <div className="text-xs text-gray-500 mt-2 bg-black/30 rounded px-2 py-1">
          💡 Press <kbd className="text-gray-300">G</kbd> to toggle compact mode
        </div>
      )}
    </div>
  );
}
