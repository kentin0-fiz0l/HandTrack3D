import type { HandGesture } from '@/types/gesture.types';
import {
  getConfidenceColor,
  getConfidenceTextColor,
  formatConfidencePercent,
} from '@/utils/gestureConfidence';

interface HandGestureCardProps {
  handId: string;
  gesture: HandGesture;
  compact?: boolean;
}

/**
 * Get gesture icon/emoji for visual representation
 */
function getGestureIcon(gesture: string): string {
  switch (gesture) {
    case 'pinch':
      return '🤏';
    case 'open':
      return '✋';
    case 'fist':
      return '✊';
    case 'point':
      return '☝️';
    case 'swipeLeft':
      return '👈';
    case 'swipeRight':
      return '👉';
    case 'swipeUp':
      return '👆';
    case 'swipeDown':
      return '👇';
    case 'none':
    default:
      return '🖐️';
  }
}

/**
 * Format gesture name for display
 */
function formatGestureName(gesture: string): string {
  switch (gesture) {
    case 'pinch':
      return 'Pinch';
    case 'open':
      return 'Open Hand';
    case 'fist':
      return 'Fist';
    case 'point':
      return 'Point';
    case 'swipeLeft':
      return 'Swipe Left';
    case 'swipeRight':
      return 'Swipe Right';
    case 'swipeUp':
      return 'Swipe Up';
    case 'swipeDown':
      return 'Swipe Down';
    case 'none':
    default:
      return 'None';
  }
}

export function HandGestureCard({ handId, gesture, compact = false }: HandGestureCardProps) {
  const isLeft = handId.includes('left') || handId.includes('Left');
  const handColor = isLeft ? 'text-blue-400' : 'text-purple-400';
  const handLabel = isLeft ? 'Left' : 'Right';
  const confidencePercent = formatConfidencePercent(gesture.confidence);
  const confidenceBarColor = getConfidenceColor(gesture.confidence);
  const confidenceTextColor = getConfidenceTextColor(gesture.confidence);

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-800/60 rounded">
        <span className={`text-sm font-semibold ${handColor}`}>{handLabel[0]}</span>
        <span className="text-lg">{getGestureIcon(gesture.gesture)}</span>
        <div
          className={`h-1.5 flex-1 rounded-full bg-gray-700 overflow-hidden`}
          title={`${confidencePercent} confidence`}
        >
          <div
            className={`h-full ${confidenceBarColor} transition-all duration-200`}
            style={{ width: confidencePercent }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-gray-800/80 rounded-lg space-y-2">
      {/* Hand Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${handColor}`}>{handLabel} Hand</span>
        </div>
        <span className={`text-xs font-mono ${confidenceTextColor}`}>
          {confidencePercent}
        </span>
      </div>

      {/* Gesture Display */}
      <div className="flex items-center gap-3">
        <span className="text-2xl" role="img" aria-label={gesture.gesture}>
          {getGestureIcon(gesture.gesture)}
        </span>
        <span className="text-sm font-medium text-gray-200">
          {formatGestureName(gesture.gesture)}
        </span>
      </div>

      {/* Confidence Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Confidence</span>
        </div>
        <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
          <div
            className={`h-full ${confidenceBarColor} transition-all duration-200`}
            style={{ width: confidencePercent }}
          />
        </div>
      </div>
    </div>
  );
}
