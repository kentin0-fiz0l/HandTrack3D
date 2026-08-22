import type { Gesture } from '@/types/gesture.types';
import type { Hand } from '@/types/hand.types';
import {
  calculateGestureConfidence,
  getConfidenceColor,
  getConfidenceLabel,
  getGestureEmoji,
  formatGestureName,
} from '@/utils/gestureConfidence';

interface HandGestureCardProps {
  hand: Hand;
  gesture: Gesture | null;
  compact?: boolean;
}

export function HandGestureCard({ hand, gesture, compact = false }: HandGestureCardProps) {
  const confidence = calculateGestureConfidence(gesture, hand);
  const confidenceColor = getConfidenceColor(confidence);
  const confidenceLabel = getConfidenceLabel(confidence);
  const gestureType = gesture?.gesture || 'none';
  const gestureEmoji = getGestureEmoji(gestureType);
  const gestureName = formatGestureName(gestureType);

  // Hand color (left = green, right = blue)
  const handColor = hand.handedness === 'Left' ? '#4ade80' : '#3b82f6';
  const handLabel = hand.handedness === 'Left' ? 'L' : 'R';

  if (compact) {
    // Compact mode: just icon, hand label, and gesture
    return (
      <div className="flex items-center gap-2 bg-black/50 rounded-lg px-3 py-2 backdrop-blur-sm">
        {/* Hand indicator */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: handColor }}
        >
          {handLabel}
        </div>

        {/* Gesture emoji and name */}
        <div className="flex items-center gap-1">
          <span className="text-xl">{gestureEmoji}</span>
          <span className="text-white text-sm font-medium">{gestureName}</span>
        </div>
      </div>
    );
  }

  // Full mode: hand indicator, gesture, confidence bar, and label
  return (
    <div className="bg-black/70 rounded-lg p-3 backdrop-blur-sm border border-white/10 min-w-[200px]">
      {/* Header: Hand indicator + Gesture */}
      <div className="flex items-center gap-2 mb-2">
        {/* Hand indicator circle */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
          style={{ backgroundColor: handColor }}
          title={`${hand.handedness} Hand`}
        >
          {handLabel}
        </div>

        {/* Gesture name and emoji */}
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-2xl">{gestureEmoji}</span>
            <span className="text-white font-semibold">{gestureName}</span>
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Confidence</span>
          <span className="text-gray-300 font-medium">{confidenceLabel}</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${confidence}%`,
              backgroundColor: confidenceColor,
            }}
          />
        </div>

        {/* Percentage */}
        <div className="text-right">
          <span className="text-xs text-gray-400">{Math.round(confidence)}%</span>
        </div>
      </div>
    </div>
  );
}
