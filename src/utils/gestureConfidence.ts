/**
 * Utility functions for gesture confidence calculations
 */

/**
 * Calculate confidence level category based on numeric confidence value
 * @param confidence - Confidence value between 0 and 1
 * @returns Category: 'high', 'medium', or 'low'
 */
export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.7) return 'high';
  if (confidence >= 0.4) return 'medium';
  return 'low';
}

/**
 * Get color class for confidence level (Tailwind CSS)
 * @param confidence - Confidence value between 0 and 1
 * @returns Tailwind color class string
 */
export function getConfidenceColor(confidence: number): string {
  const level = getConfidenceLevel(confidence);

  switch (level) {
    case 'high':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-red-500';
  }
}

/**
 * Get text color class for confidence level (Tailwind CSS)
 * @param confidence - Confidence value between 0 and 1
 * @returns Tailwind text color class string
 */
export function getConfidenceTextColor(confidence: number): string {
  const level = getConfidenceLevel(confidence);

  switch (level) {
    case 'high':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'low':
      return 'text-red-400';
  }
}

/**
 * Convert confidence (0-1) to percentage string
 * @param confidence - Confidence value between 0 and 1
 * @returns Percentage string (e.g., "85%")
 */
export function formatConfidencePercent(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}
