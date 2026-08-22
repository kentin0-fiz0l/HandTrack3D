/**
 * Adaptive depth estimation with confidence-based weighting
 *
 * Instead of fixed weights (20% MediaPipe, 50% Hand Size, 30% Arm Extension),
 * this calculates optimal weights based on:
 * - MediaPipe hand detection confidence
 * - Pose tracking confidence (if available)
 * - Hand visibility (all landmarks visible vs partial occlusion)
 */

import type { HandLandmark } from '@handtrack3d/core';

export interface DepthWeights {
  mediaPipe: number;
  handSize: number;
  armExtension: number;
}

export interface DepthConfidenceFactors {
  /** MediaPipe hand detection score (0-1) */
  mediaPipeConfidence: number;

  /** MoveNet pose detection score (0-1), or null if unavailable */
  poseConfidence: number | null;

  /** Whether all hand landmarks are visible (true) or some are occluded (false) */
  handFullyVisible: boolean;

  /** Whether the hand is near image boundaries (less reliable depth) */
  nearBoundary: boolean;
}

/**
 * Check if hand is fully visible (no occluded landmarks)
 */
export function isHandFullyVisible(landmarks: HandLandmark[], visibilityThreshold = 0.5): boolean {
  return landmarks.every((lm) => lm.visibility !== undefined && lm.visibility >= visibilityThreshold);
}

/**
 * Check if hand is near image boundaries (0-1 normalized coordinates)
 */
export function isNearBoundary(
  landmarks: HandLandmark[],
  boundaryMargin = 0.1
): boolean {
  // Check if any landmark is within margin of edges
  return landmarks.some((lm) =>
    lm.x < boundaryMargin ||
    lm.x > (1 - boundaryMargin) ||
    lm.y < boundaryMargin ||
    lm.y > (1 - boundaryMargin)
  );
}

/**
 * Calculate adaptive weights based on confidence factors
 *
 * Strategy:
 * - High confidence everything → balanced weights (similar to fixed)
 * - Low MediaPipe confidence → rely more on hand size
 * - No pose available → redistribute arm extension weight
 * - Partial occlusion → reduce MediaPipe Z weight
 * - Near boundary → reduce hand size weight (foreshortening issues)
 */
export function calculateAdaptiveWeights(
  factors: DepthConfidenceFactors
): DepthWeights {
  const {
    mediaPipeConfidence,
    poseConfidence,
    handFullyVisible,
    nearBoundary,
  } = factors;

  // Start with default weights
  let mediaPipeWeight = 0.2;
  let handSizeWeight = 0.5;
  let armExtensionWeight = 0.3;

  // Adjust MediaPipe Z weight based on confidence
  if (mediaPipeConfidence < 0.6) {
    // Low confidence → reduce MediaPipe Z contribution
    mediaPipeWeight = 0.1;
  } else if (mediaPipeConfidence > 0.8) {
    // High confidence → increase MediaPipe Z contribution
    mediaPipeWeight = 0.25;
  }

  // Adjust for partial occlusion
  if (!handFullyVisible) {
    // Some landmarks occluded → MediaPipe Z less reliable
    mediaPipeWeight *= 0.7;
  }

  // Adjust hand size weight based on boundary proximity
  if (nearBoundary) {
    // Near edges → foreshortening affects size estimate
    handSizeWeight *= 0.8;
  }

  // Adjust arm extension weight based on pose availability
  if (poseConfidence === null || poseConfidence < 0.5) {
    // No pose or low confidence → redistribute arm extension weight
    // Give it to hand size (more reliable than MediaPipe Z)
    const redistribution = armExtensionWeight;
    armExtensionWeight = 0.0;
    handSizeWeight += redistribution * 0.7;
    mediaPipeWeight += redistribution * 0.3;
  } else if (poseConfidence > 0.8) {
    // High pose confidence → increase arm extension weight
    armExtensionWeight = 0.35;
  }

  // Normalize weights to sum to 1.0
  const total = mediaPipeWeight + handSizeWeight + armExtensionWeight;

  return {
    mediaPipe: mediaPipeWeight / total,
    handSize: handSizeWeight / total,
    armExtension: armExtensionWeight / total,
  };
}

/**
 * Apply adaptive weighting to depth components
 */
export function calculateAdaptiveDepth(
  mediaPipeZ: number,
  handSizeZ: number,
  armExtensionZ: number,
  weights: DepthWeights
): number {
  return (
    weights.mediaPipe * mediaPipeZ +
    weights.handSize * handSizeZ +
    weights.armExtension * armExtensionZ
  );
}

/**
 * Get default (fixed) weights for comparison
 */
export function getDefaultWeights(): DepthWeights {
  return {
    mediaPipe: 0.2,
    handSize: 0.5,
    armExtension: 0.3,
  };
}

/**
 * Utility: Format weights as percentages for debugging
 */
export function formatWeights(weights: DepthWeights): string {
  return `MediaPipe: ${(weights.mediaPipe * 100).toFixed(0)}%, ` +
         `HandSize: ${(weights.handSize * 100).toFixed(0)}%, ` +
         `ArmExt: ${(weights.armExtension * 100).toFixed(0)}%`;
}
