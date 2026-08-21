import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SwipeDetectionState } from '@/types/gesture.types';
import * as settingsStore from '@/stores/settingsStore';
import {
  createSwipeRightHistory,
  createSwipeLeftHistory,
  createSwipeUpHistory,
  createSwipeDownHistory,
  createSlowMovementHistory,
} from '@/test/fixtures/mockHandLandmarks';

/**
 * Detect swipe gesture from position history
 * (Extracted from useGestureRecognition for testing)
 */
function detectSwipe(
  state: SwipeDetectionState,
  currentTime: number
): 'swipeLeft' | 'swipeRight' | 'swipeUp' | 'swipeDown' | null {
  const settings = settingsStore.getSettings();

  // Check cooldown
  if (currentTime - state.lastSwipeTimestamp < settings.swipeCooldown) {
    return null;
  }

  const history = state.positionHistory;
  if (history.length < 5) {
    return null; // Need enough history
  }

  // Calculate velocity from first to last position
  const first = history[0];
  const last = history[history.length - 1];
  const deltaTime = (last.timestamp - first.timestamp) / 1000; // Convert to seconds

  if (deltaTime < 0.05) {
    return null; // Too short time span
  }

  const velocityX = (last.x - first.x) / deltaTime;
  const velocityY = (last.y - first.y) / deltaTime;

  // Find dominant direction
  const absVelX = Math.abs(velocityX);
  const absVelY = Math.abs(velocityY);

  // Check if velocity exceeds threshold
  const maxVelocity = Math.max(absVelX, absVelY);
  if (maxVelocity < settings.swipeVelocityThreshold) {
    return null;
  }

  // Determine swipe direction
  if (absVelX > absVelY) {
    return velocityX > 0 ? 'swipeRight' : 'swipeLeft';
  } else {
    return velocityY > 0 ? 'swipeDown' : 'swipeUp';
  }
}

describe('useGestureRecognition - swipe detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock settings with default values
    vi.spyOn(settingsStore, 'getSettings').mockReturnValue({
      swipeVelocityThreshold: 0.5,
      swipeCooldown: 500,
      pointExtensionAngle: 160,
      fingerExtensionAngle: 160,
      pinchThreshold: 0.05,
      fistCurlThreshold: 0.15,
      gravityEnabled: true,
      grabRange: 1.5,
      restitution: 0.5,
      friction: 0.7,
      maxHands: 2,
      detectionConfidence: 0.5,
      trackingConfidence: 0.5,
      showTrails: true,
      showWebcam: false,
      showHandSkeleton: true,
      showPerformance: true,
      reset: vi.fn(),
      updateGestureSetting: vi.fn(),
      updatePhysicsSetting: vi.fn(),
      updateTrackingSetting: vi.fn(),
      updateVisualSetting: vi.fn(),
    });
  });

  it('should detect swipeRight when palm moves right with sufficient velocity', () => {
    const history = createSwipeRightHistory();
    const state: SwipeDetectionState = {
      positionHistory: history,
      lastSwipeTimestamp: 0,
    };

    const currentTime = history[history.length - 1].timestamp;
    const result = detectSwipe(state, currentTime);

    expect(result).toBe('swipeRight');
  });

  it('should detect swipeLeft when palm moves left with sufficient velocity', () => {
    const history = createSwipeLeftHistory();
    const state: SwipeDetectionState = {
      positionHistory: history,
      lastSwipeTimestamp: 0,
    };

    const currentTime = history[history.length - 1].timestamp;
    const result = detectSwipe(state, currentTime);

    expect(result).toBe('swipeLeft');
  });

  it('should detect swipeUp when palm moves up with sufficient velocity', () => {
    const history = createSwipeUpHistory();
    const state: SwipeDetectionState = {
      positionHistory: history,
      lastSwipeTimestamp: 0,
    };

    const currentTime = history[history.length - 1].timestamp;
    const result = detectSwipe(state, currentTime);

    expect(result).toBe('swipeUp');
  });

  it('should detect swipeDown when palm moves down with sufficient velocity', () => {
    const history = createSwipeDownHistory();
    const state: SwipeDetectionState = {
      positionHistory: history,
      lastSwipeTimestamp: 0,
    };

    const currentTime = history[history.length - 1].timestamp;
    const result = detectSwipe(state, currentTime);

    expect(result).toBe('swipeDown');
  });

  it('should not detect swipe when movement is too slow (below velocity threshold)', () => {
    const history = createSlowMovementHistory();
    const state: SwipeDetectionState = {
      positionHistory: history,
      lastSwipeTimestamp: 0,
    };

    const currentTime = history[history.length - 1].timestamp;
    const result = detectSwipe(state, currentTime);

    expect(result).toBeNull();
  });

  it('should respect swipeVelocityThreshold setting', () => {
    const history = createSwipeRightHistory();

    // Set very high threshold - should not detect
    vi.spyOn(settingsStore, 'getSettings').mockReturnValue({
      swipeVelocityThreshold: 10.0, // Very high threshold
      swipeCooldown: 500,
      pointExtensionAngle: 160,
      fingerExtensionAngle: 160,
      pinchThreshold: 0.05,
      fistCurlThreshold: 0.15,
      gravityEnabled: true,
      grabRange: 1.5,
      restitution: 0.5,
      friction: 0.7,
      maxHands: 2,
      detectionConfidence: 0.5,
      trackingConfidence: 0.5,
      showTrails: true,
      showWebcam: false,
      showHandSkeleton: true,
      showPerformance: true,
      reset: vi.fn(),
      updateGestureSetting: vi.fn(),
      updatePhysicsSetting: vi.fn(),
      updateTrackingSetting: vi.fn(),
      updateVisualSetting: vi.fn(),
    });

    const state: SwipeDetectionState = {
      positionHistory: history,
      lastSwipeTimestamp: 0,
    };

    const currentTime = history[history.length - 1].timestamp;
    const result = detectSwipe(state, currentTime);

    expect(result).toBeNull();
  });

  it('should enforce cooldown period between consecutive swipe detections', () => {
    const history = createSwipeRightHistory();
    const currentTime = history[history.length - 1].timestamp;

    // First swipe - should detect
    const state: SwipeDetectionState = {
      positionHistory: history,
      lastSwipeTimestamp: 0,
    };

    const firstResult = detectSwipe(state, currentTime);
    expect(firstResult).toBe('swipeRight');

    // Update last swipe timestamp
    state.lastSwipeTimestamp = currentTime;

    // Try to detect again immediately (within cooldown) - should not detect
    const immediateTime = currentTime + 100; // 100ms later (within 500ms cooldown)
    const secondResult = detectSwipe(state, immediateTime);
    expect(secondResult).toBeNull();

    // After cooldown expires - should detect
    const afterCooldown = currentTime + 600; // 600ms later (after 500ms cooldown)
    const thirdResult = detectSwipe(state, afterCooldown);
    expect(thirdResult).toBe('swipeRight');
  });

  it('should handle stationary hand without false swipe detection', () => {
    // Create history with no movement
    const baseTime = Date.now();
    const stationaryHistory = Array.from({ length: 10 }, (_, i) => ({
      x: 0.5,
      y: 0.5,
      z: 0,
      timestamp: baseTime + i * 16,
    }));

    const state: SwipeDetectionState = {
      positionHistory: stationaryHistory,
      lastSwipeTimestamp: 0,
    };

    const currentTime = stationaryHistory[stationaryHistory.length - 1].timestamp;
    const result = detectSwipe(state, currentTime);

    expect(result).toBeNull();
  });

  it('should calculate velocity correctly from position history', () => {
    // Create a custom history with known velocity
    // Need at least 5 data points for swipe detection
    const baseTime = Date.now();
    const customHistory = [
      { x: 0.0, y: 0.5, z: 0, timestamp: baseTime },
      { x: 0.02, y: 0.5, z: 0, timestamp: baseTime + 20 },
      { x: 0.04, y: 0.5, z: 0, timestamp: baseTime + 40 },
      { x: 0.06, y: 0.5, z: 0, timestamp: baseTime + 60 },
      { x: 0.08, y: 0.5, z: 0, timestamp: baseTime + 80 },
      { x: 0.1, y: 0.5, z: 0, timestamp: baseTime + 100 }, // 0.1 units in 0.1s = 1 unit/s velocity
    ];

    const state: SwipeDetectionState = {
      positionHistory: customHistory,
      lastSwipeTimestamp: 0,
    };

    // With threshold of 0.5, velocity of 1.0 should trigger
    const currentTime = customHistory[customHistory.length - 1].timestamp;
    const result = detectSwipe(state, currentTime);

    expect(result).toBe('swipeRight');
  });
});
