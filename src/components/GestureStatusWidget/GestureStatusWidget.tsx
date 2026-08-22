import { useState, useEffect } from 'react';
import { useGestureStore } from '@/hooks/useGestureRecognition';
import { HandGestureCard } from './HandGestureCard';

const AUTO_HIDE_DELAY_MS = 3000; // 3 seconds

export function GestureStatusWidget() {
  const gestures = useGestureStore((state) => state.gestures);
  const [compact, setCompact] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide when no hands detected for 3 seconds
  useEffect(() => {
    if (gestures.length === 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, AUTO_HIDE_DELAY_MS);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [gestures]);

  // Don't render if hidden and no gestures
  if (!isVisible && gestures.length === 0) {
    return null;
  }

  // Don't render if no gestures (but still visible during fade-out period)
  if (gestures.length === 0) {
    return (
      <div className="gesture-status-widget fixed bottom-20 right-4 z-40 bg-gray-900/95 text-white rounded-lg shadow-lg border border-white/20 p-3 w-64">
        <div className="text-sm text-gray-400 text-center">No hands detected</div>
      </div>
    );
  }

  return (
    <div className="gesture-status-widget fixed bottom-20 right-4 z-40 bg-gray-900/95 text-white rounded-lg shadow-lg border border-white/20 w-64">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/20">
        <h3 className="text-sm font-semibold">Gesture Status</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompact(!compact)}
            className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded transition text-xs"
            title={compact ? 'Expand' : 'Compact Mode'}
          >
            {compact ? '⊕' : '⊖'}
          </button>
        </div>
      </div>

      {/* Gesture Cards */}
      <div className="p-3 space-y-2">
        {gestures.map((gesture) => (
          <HandGestureCard
            key={gesture.handId}
            handId={gesture.handId}
            gesture={gesture}
            compact={compact}
          />
        ))}
      </div>

      {/* Footer */}
      {!compact && (
        <div className="px-4 py-2 border-t border-white/20 text-xs text-gray-500">
          Auto-hides after {AUTO_HIDE_DELAY_MS / 1000}s
        </div>
      )}
    </div>
  );
}
