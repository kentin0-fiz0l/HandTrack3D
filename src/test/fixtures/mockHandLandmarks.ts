import type { HandLandmark } from '@/types/hand.types';

/**
 * MediaPipe Hand Landmark Indices:
 * 0: Wrist
 * 1-4: Thumb (CMC, MCP, IP, TIP)
 * 5-8: Index (MCP, PIP, DIP, TIP)
 * 9-12: Middle (MCP, PIP, DIP, TIP)
 * 13-16: Ring (MCP, PIP, DIP, TIP)
 * 17-20: Pinky (MCP, PIP, DIP, TIP)
 */

/**
 * Create a hand landmark at a specific position
 */
function createLandmark(x: number, y: number, z: number): HandLandmark {
  return { x, y, z };
}

/**
 * Generate 21 landmarks for a relaxed open hand
 * All fingers extended, natural spread
 */
export function createOpenHandLandmarks(): HandLandmark[] {
  return [
    // Wrist
    createLandmark(0.5, 0.9, 0),

    // Thumb (extended outward)
    createLandmark(0.4, 0.85, -0.02),
    createLandmark(0.35, 0.75, -0.03),
    createLandmark(0.32, 0.65, -0.04),
    createLandmark(0.3, 0.55, -0.05),

    // Index finger (extended upward)
    createLandmark(0.45, 0.8, 0),
    createLandmark(0.45, 0.6, 0),
    createLandmark(0.45, 0.4, 0),
    createLandmark(0.45, 0.2, 0),

    // Middle finger (extended upward)
    createLandmark(0.5, 0.8, 0),
    createLandmark(0.5, 0.6, 0),
    createLandmark(0.5, 0.4, 0),
    createLandmark(0.5, 0.15, 0),

    // Ring finger (extended upward)
    createLandmark(0.55, 0.8, 0),
    createLandmark(0.55, 0.6, 0),
    createLandmark(0.55, 0.4, 0),
    createLandmark(0.55, 0.2, 0),

    // Pinky (extended upward)
    createLandmark(0.6, 0.82, 0),
    createLandmark(0.6, 0.65, 0),
    createLandmark(0.6, 0.48, 0),
    createLandmark(0.6, 0.3, 0),
  ];
}

/**
 * Generate 21 landmarks for a pinch gesture
 * Thumb tip and index tip very close together
 */
export function createPinchGestureLandmarks(): HandLandmark[] {
  return [
    // Wrist
    createLandmark(0.5, 0.9, 0),

    // Thumb (extended toward index)
    createLandmark(0.4, 0.85, -0.02),
    createLandmark(0.42, 0.7, -0.03),
    createLandmark(0.44, 0.55, -0.04),
    createLandmark(0.46, 0.4, -0.05), // Thumb tip

    // Index finger (tip close to thumb)
    createLandmark(0.45, 0.8, 0),
    createLandmark(0.45, 0.65, 0),
    createLandmark(0.45, 0.5, 0),
    createLandmark(0.465, 0.395, 0), // Index tip - very close to thumb (distance ~0.03)

    // Middle, ring, pinky curled
    createLandmark(0.5, 0.8, 0),
    createLandmark(0.52, 0.78, 0),
    createLandmark(0.52, 0.8, 0),
    createLandmark(0.51, 0.82, 0),

    createLandmark(0.55, 0.8, 0),
    createLandmark(0.57, 0.79, 0),
    createLandmark(0.57, 0.81, 0),
    createLandmark(0.56, 0.83, 0),

    createLandmark(0.6, 0.82, 0),
    createLandmark(0.62, 0.81, 0),
    createLandmark(0.62, 0.83, 0),
    createLandmark(0.61, 0.85, 0),
  ];
}

/**
 * Generate 21 landmarks for a fist gesture
 * All fingers curled close to palm/wrist
 */
export function createFistGestureLandmarks(): HandLandmark[] {
  const wrist = createLandmark(0.5, 0.9, 0);

  return [
    // Wrist
    wrist,

    // All fingers curled toward wrist (within ~0.1-0.12 distance)
    // Thumb
    createLandmark(0.48, 0.88, -0.01),
    createLandmark(0.47, 0.86, -0.02),
    createLandmark(0.46, 0.85, -0.03),
    createLandmark(0.45, 0.84, -0.04), // Thumb tip close to wrist

    // Index
    createLandmark(0.5, 0.85, 0),
    createLandmark(0.51, 0.83, 0),
    createLandmark(0.52, 0.82, 0),
    createLandmark(0.53, 0.81, 0),

    // Middle
    createLandmark(0.5, 0.85, 0.01),
    createLandmark(0.51, 0.83, 0.01),
    createLandmark(0.52, 0.82, 0.01),
    createLandmark(0.53, 0.81, 0.01),

    // Ring
    createLandmark(0.5, 0.85, 0.02),
    createLandmark(0.51, 0.84, 0.02),
    createLandmark(0.52, 0.83, 0.02),
    createLandmark(0.53, 0.82, 0.02),

    // Pinky
    createLandmark(0.5, 0.86, 0.03),
    createLandmark(0.51, 0.85, 0.03),
    createLandmark(0.52, 0.84, 0.03),
    createLandmark(0.53, 0.83, 0.03),
  ];
}

/**
 * Generate 21 landmarks for a point gesture
 * Index finger extended, all others curled
 * Creates angles > 160° for index finger extension
 * Creates acute angles (<90°) for curled fingers
 */
export function createPointGestureLandmarks(): HandLandmark[] {
  return [
    // Wrist
    createLandmark(0.5, 0.9, 0),

    // Thumb curled back (creating sharp bends)
    createLandmark(0.48, 0.88, -0.01),
    createLandmark(0.46, 0.87, -0.02),  // Bent back
    createLandmark(0.45, 0.86, -0.025), // More bent
    createLandmark(0.44, 0.87, -0.03),  // Tip curled back

    // Index finger fully extended (straight line, angles ~180°)
    createLandmark(0.5, 0.8, 0),    // MCP
    createLandmark(0.5, 0.65, 0),   // PIP
    createLandmark(0.5, 0.5, 0),    // DIP
    createLandmark(0.5, 0.35, 0),   // TIP (straight upward)

    // Middle curled (creating sharp bends)
    createLandmark(0.52, 0.82, 0),
    createLandmark(0.53, 0.795, 0.02),  // Bent toward palm
    createLandmark(0.525, 0.785, 0.03), // More bent back
    createLandmark(0.52, 0.79, 0.035),  // Tip curled back toward palm

    // Ring curled (creating sharp bends)
    createLandmark(0.55, 0.83, 0),
    createLandmark(0.56, 0.805, 0.02),  // Bent toward palm
    createLandmark(0.555, 0.795, 0.03), // More bent back
    createLandmark(0.55, 0.8, 0.035),   // Tip curled back

    // Pinky curled (creating sharp bends)
    createLandmark(0.58, 0.84, 0),
    createLandmark(0.59, 0.815, 0.02),  // Bent toward palm
    createLandmark(0.585, 0.805, 0.03), // More bent back
    createLandmark(0.58, 0.81, 0.035),  // Tip curled back
  ];
}

/**
 * Generate landmarks for hand in neutral position (no specific gesture)
 */
export function createNeutralHandLandmarks(): HandLandmark[] {
  return [
    // Wrist
    createLandmark(0.5, 0.9, 0),

    // Thumb slightly extended
    createLandmark(0.42, 0.85, -0.02),
    createLandmark(0.38, 0.75, -0.03),
    createLandmark(0.36, 0.68, -0.04),
    createLandmark(0.34, 0.62, -0.05),

    // Fingers partially curled (not fully extended, not closed fist)
    // Index
    createLandmark(0.48, 0.8, 0),
    createLandmark(0.48, 0.68, 0),
    createLandmark(0.48, 0.58, 0),
    createLandmark(0.48, 0.5, 0),

    // Middle
    createLandmark(0.52, 0.8, 0),
    createLandmark(0.52, 0.68, 0),
    createLandmark(0.52, 0.58, 0),
    createLandmark(0.52, 0.5, 0),

    // Ring
    createLandmark(0.56, 0.8, 0),
    createLandmark(0.56, 0.68, 0),
    createLandmark(0.56, 0.58, 0),
    createLandmark(0.56, 0.52, 0),

    // Pinky
    createLandmark(0.60, 0.82, 0),
    createLandmark(0.60, 0.7, 0),
    createLandmark(0.60, 0.6, 0),
    createLandmark(0.60, 0.54, 0),
  ];
}

/**
 * Generate 21 landmarks for an L-shape gesture
 * Thumb and index finger both extended (should NOT trigger point gesture)
 */
export function createLShapeGestureLandmarks(): HandLandmark[] {
  return [
    // Wrist
    createLandmark(0.5, 0.9, 0),

    // Thumb extended
    createLandmark(0.4, 0.85, -0.02),
    createLandmark(0.35, 0.75, -0.03),
    createLandmark(0.32, 0.65, -0.04),
    createLandmark(0.3, 0.55, -0.05),

    // Index finger extended
    createLandmark(0.5, 0.8, 0),
    createLandmark(0.5, 0.6, 0),
    createLandmark(0.5, 0.4, 0),
    createLandmark(0.5, 0.2, 0),

    // Middle, ring, pinky curled
    createLandmark(0.52, 0.82, 0),
    createLandmark(0.53, 0.81, 0),
    createLandmark(0.54, 0.82, 0),
    createLandmark(0.54, 0.83, 0),

    createLandmark(0.55, 0.83, 0),
    createLandmark(0.56, 0.82, 0),
    createLandmark(0.57, 0.83, 0),
    createLandmark(0.57, 0.84, 0),

    createLandmark(0.58, 0.84, 0),
    createLandmark(0.59, 0.83, 0),
    createLandmark(0.60, 0.84, 0),
    createLandmark(0.60, 0.85, 0),
  ];
}

/**
 * Generate landmarks for point gesture with index partially extended
 * (just below 160° threshold angle - edge case)
 * Index finger bent with angles around 145-150°
 * Should work with 140° threshold but not 160°
 */
export function createPartialPointGestureLandmarks(): HandLandmark[] {
  return [
    // Wrist
    createLandmark(0.5, 0.9, 0),

    // Thumb curled (same as full point gesture)
    createLandmark(0.48, 0.88, -0.01),
    createLandmark(0.46, 0.87, -0.02),
    createLandmark(0.45, 0.86, -0.025),
    createLandmark(0.44, 0.87, -0.03),

    // Index finger partially extended with sharp bends (angles ~130-145°, below 160°)
    createLandmark(0.5, 0.8, 0),      // MCP
    createLandmark(0.53, 0.67, 0),    // PIP (bent outward significantly)
    createLandmark(0.545, 0.56, 0),   // DIP (bent outward significantly)
    createLandmark(0.555, 0.47, 0),   // TIP (noticeably curved)

    // Middle, ring, pinky curled (creating sharp bends)
    createLandmark(0.52, 0.82, 0),
    createLandmark(0.53, 0.795, 0.02),
    createLandmark(0.525, 0.785, 0.03),
    createLandmark(0.52, 0.79, 0.035),

    createLandmark(0.55, 0.83, 0),
    createLandmark(0.56, 0.805, 0.02),
    createLandmark(0.555, 0.795, 0.03),
    createLandmark(0.55, 0.8, 0.035),

    createLandmark(0.58, 0.84, 0),
    createLandmark(0.59, 0.815, 0.02),
    createLandmark(0.585, 0.805, 0.03),
    createLandmark(0.58, 0.81, 0.035),
  ];
}

/**
 * Create landmarks with invalid data (for edge case testing)
 */
export function createInvalidLandmarks(): HandLandmark[] {
  // Return array with only 10 landmarks (should be 21)
  return Array.from({ length: 10 }, (_, i) => createLandmark(0, 0, 0));
}

/**
 * Create landmarks with extreme values
 */
export function createExtremeLandmarks(): HandLandmark[] {
  return Array.from({ length: 21 }, (_, i) =>
    createLandmark(
      i % 2 === 0 ? -100 : 100,
      i % 3 === 0 ? -100 : 100,
      i % 5 === 0 ? -100 : 100
    )
  );
}

/**
 * Create position history for swipe gesture detection
 */
export function createSwipeRightHistory(): Array<{ x: number; y: number; z: number; timestamp: number }> {
  const baseTime = Date.now();
  return [
    { x: 0.3, y: 0.5, z: 0, timestamp: baseTime },
    { x: 0.35, y: 0.5, z: 0, timestamp: baseTime + 16 },
    { x: 0.4, y: 0.5, z: 0, timestamp: baseTime + 32 },
    { x: 0.45, y: 0.5, z: 0, timestamp: baseTime + 48 },
    { x: 0.5, y: 0.5, z: 0, timestamp: baseTime + 64 },
    { x: 0.55, y: 0.5, z: 0, timestamp: baseTime + 80 },
    { x: 0.6, y: 0.5, z: 0, timestamp: baseTime + 96 },
    { x: 0.65, y: 0.5, z: 0, timestamp: baseTime + 112 },
    { x: 0.7, y: 0.5, z: 0, timestamp: baseTime + 128 },
  ];
}

/**
 * Create position history for swipe left
 */
export function createSwipeLeftHistory(): Array<{ x: number; y: number; z: number; timestamp: number }> {
  const baseTime = Date.now();
  return [
    { x: 0.7, y: 0.5, z: 0, timestamp: baseTime },
    { x: 0.65, y: 0.5, z: 0, timestamp: baseTime + 16 },
    { x: 0.6, y: 0.5, z: 0, timestamp: baseTime + 32 },
    { x: 0.55, y: 0.5, z: 0, timestamp: baseTime + 48 },
    { x: 0.5, y: 0.5, z: 0, timestamp: baseTime + 64 },
    { x: 0.45, y: 0.5, z: 0, timestamp: baseTime + 80 },
    { x: 0.4, y: 0.5, z: 0, timestamp: baseTime + 96 },
  ];
}

/**
 * Create position history for swipe up
 */
export function createSwipeUpHistory(): Array<{ x: number; y: number; z: number; timestamp: number }> {
  const baseTime = Date.now();
  return [
    { x: 0.5, y: 0.7, z: 0, timestamp: baseTime },
    { x: 0.5, y: 0.65, z: 0, timestamp: baseTime + 16 },
    { x: 0.5, y: 0.6, z: 0, timestamp: baseTime + 32 },
    { x: 0.5, y: 0.55, z: 0, timestamp: baseTime + 48 },
    { x: 0.5, y: 0.5, z: 0, timestamp: baseTime + 64 },
    { x: 0.5, y: 0.45, z: 0, timestamp: baseTime + 80 },
    { x: 0.5, y: 0.4, z: 0, timestamp: baseTime + 96 },
  ];
}

/**
 * Create position history for swipe down
 */
export function createSwipeDownHistory(): Array<{ x: number; y: number; z: number; timestamp: number }> {
  const baseTime = Date.now();
  return [
    { x: 0.5, y: 0.3, z: 0, timestamp: baseTime },
    { x: 0.5, y: 0.35, z: 0, timestamp: baseTime + 16 },
    { x: 0.5, y: 0.4, z: 0, timestamp: baseTime + 32 },
    { x: 0.5, y: 0.45, z: 0, timestamp: baseTime + 48 },
    { x: 0.5, y: 0.5, z: 0, timestamp: baseTime + 64 },
    { x: 0.5, y: 0.55, z: 0, timestamp: baseTime + 80 },
    { x: 0.5, y: 0.6, z: 0, timestamp: baseTime + 96 },
  ];
}

/**
 * Create position history with slow movement (below swipe threshold)
 */
export function createSlowMovementHistory(): Array<{ x: number; y: number; z: number; timestamp: number }> {
  const baseTime = Date.now();
  return [
    { x: 0.5, y: 0.5, z: 0, timestamp: baseTime },
    { x: 0.51, y: 0.5, z: 0, timestamp: baseTime + 100 },
    { x: 0.52, y: 0.5, z: 0, timestamp: baseTime + 200 },
    { x: 0.53, y: 0.5, z: 0, timestamp: baseTime + 300 },
    { x: 0.54, y: 0.5, z: 0, timestamp: baseTime + 400 },
  ];
}
