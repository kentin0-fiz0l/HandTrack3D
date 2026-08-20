import { useState } from 'react';
import { useHandTrackingStore } from '@/stores/handTrackingStore';
import { useGestureStore } from '@/hooks/useGestureRecognition';

export function ControlPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const hands = useHandTrackingStore((state) => state.hands);
  const fps = useHandTrackingStore((state) => state.fps);
  const gestures = useGestureStore((state) => state.gestures);

  return (
    <div className="fixed top-20 left-4 bg-black/80 text-white rounded-lg overflow-hidden z-40">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/10 transition"
      >
        <span className="font-semibold text-sm">Status</span>
        <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 py-3 space-y-3 text-xs border-t border-white/20">
          {/* Hand Tracking */}
          <div>
            <div className="font-semibold text-primary-400 mb-1">Hand Tracking</div>
            <div className="space-y-1 text-gray-300">
              <div>Hands detected: {hands.length}</div>
              <div>FPS: {fps}</div>
              {hands.map((hand) => (
                <div key={hand.id} className="text-xs">
                  {hand.handedness} hand detected
                </div>
              ))}
            </div>
          </div>

          {/* Gestures */}
          {gestures.length > 0 && (
            <div>
              <div className="font-semibold text-primary-400 mb-1">Gestures</div>
              <div className="space-y-1 text-gray-300">
                {gestures.map((gesture) => (
                  <div key={gesture.handId}>
                    {gesture.handId.includes('left') ? 'Left' : 'Right'}: {gesture.gesture}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts */}
          <div>
            <div className="font-semibold text-primary-400 mb-1">Shortcuts</div>
            <div className="space-y-1 text-gray-300">
              <div>Space: Reset camera</div>
              <div>H: Toggle this panel</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
