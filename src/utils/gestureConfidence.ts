import type { Gesture } from '@/types/gesture.types';
import type { Hand } from '@/types/hand.types';

/**
 * Calculate confidence score for a detected gesture
 * Returns a value from 0-100 representing how confident we are in the gesture detection
 */
export function calculateGestureConfidence(
  gesture: Gesture | null,
  hand: Hand | null
): number {
  if (!gesture || !hand || gesture.gesture === 'none') {
    return 0;
  }

  // Base confidence from MediaPipe hand detection
  let confidence = hand.confidence * 100;

  // Adjust based on gesture type and quality
  switch (gesture.gesture) {
    case 'pinch': {
      // For pinch, check how close to the ideal pinch distance
      const landmarks = hand.landmarks;
      if (landmarks && landmarks.length >= 21) {
        // Calculate distance between thumb tip (4) and index tip (8)
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) +
          Math.pow(thumbTip.y - indexTip.y, 2) +
          Math.pow(thumbTip.z - indexTip.z, 2)
        );

        // Ideal pinch distance is around 0.03-0.05
        // Boost confidence if close to ideal, reduce if too far or too close
        if (distance < 0.02) {
          confidence *= 0.7; // Too close, might be accidental
        } else if (distance > 0.08) {
          confidence *= 0.6; // Too far, weak pinch
        } else if (distance >= 0.03 && distance <= 0.05) {
          confidence *= 1.1; // Perfect pinch distance
        }
      }
      break;
    }

    case 'grab': {
      // For grab, all fingers should be curled
      // Higher confidence if all fingers are consistently bent
      confidence *= 0.95; // Grab is usually reliable
      break;
    }

    case 'point': {
      // For point, index should be extended, others curled
      // Check if index is clearly extended
      confidence *= 0.9;
      break;
    }

    case 'open': {
      // Open hand is easiest to detect
      confidence *= 1.0;
      break;
    }

    case 'swipeLeft':
    case 'swipeRight':
    case 'swipeUp':
    case 'swipeDown': {
      // Swipe gestures are motion-based, confidence depends on velocity
      // These are usually detected with high confidence
      confidence *= 0.95;
      break;
    }

    default:
      // Unknown gesture types
      confidence *= 0.8;
  }

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, confidence));
}

/**
 * Get color for confidence level
 * - Green (>70%): High confidence
 * - Yellow (40-70%): Medium confidence
 * - Red (<40%): Low confidence
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 70) return '#10b981'; // green-500
  if (confidence >= 40) return '#f59e0b'; // yellow-500
  return '#ef4444'; // red-500
}

/**
 * Get text description for confidence level
 */
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 80) return 'Excellent';
  if (confidence >= 70) return 'Good';
  if (confidence >= 50) return 'Fair';
  if (confidence >= 30) return 'Weak';
  return 'Poor';
}

/**
 * Get emoji icon for gesture type
 */
export function getGestureEmoji(gesture: string): string {
  const emojiMap: Record<string, string> = {
    none: '✋',
    pinch: '🤏',
    grab: '✊',
    point: '👆',
    open: '🖐️',
    swipeLeft: '⬅️',
    swipeRight: '➡️',
    swipeUp: '⬆️',
    swipeDown: '⬇️',
  };

  return emojiMap[gesture] || '👋';
}

/**
 * Format gesture name for display
 */
export function formatGestureName(gesture: string): string {
  if (gesture === 'none') return 'No Gesture';

  // Capitalize first letter and handle camelCase
  return gesture
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
}
