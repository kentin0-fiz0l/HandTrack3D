import { useEffect, useRef } from 'react';
import type { Hand } from '@handtrack3d/core';

/**
 * Props for HandCanvas component
 */
export interface HandCanvasProps {
  /** Hands to visualize */
  hands: Hand[];
  /** Canvas width */
  width: number;
  /** Canvas height */
  height: number;
  /** Whether to show landmarks (default: true) */
  showLandmarks?: boolean;
  /** Whether to show connections (default: true) */
  showConnections?: boolean;
  /** Landmark color */
  landmarkColor?: string;
  /** Connection color */
  connectionColor?: string;
  /** Landmark radius */
  landmarkRadius?: number;
  /** Connection width */
  connectionWidth?: number;
  /** Custom className */
  className?: string;
}

// MediaPipe hand connections (which landmarks connect to which)
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17],            // Palm
];

/**
 * HandCanvas component
 *
 * 2D canvas overlay for visualizing hand landmarks and connections.
 * Draws circles for landmarks and lines for finger bones.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { hands } = useHandTracking();
 *
 *   return (
 *     <div style={{ position: 'relative' }}>
 *       <video ref={videoRef} width={640} height={480} />
 *       <HandCanvas
 *         hands={hands}
 *         width={640}
 *         height={480}
 *         landmarkColor="#00ff00"
 *         connectionColor="#ffffff"
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function HandCanvas({
  hands,
  width,
  height,
  showLandmarks = true,
  showConnections = true,
  landmarkColor = '#00ff00',
  connectionColor = '#ffffff',
  landmarkRadius = 5,
  connectionWidth = 2,
  className,
}: HandCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw each hand
    hands.forEach((hand) => {
      const landmarks = hand.landmarks;

      // Draw connections
      if (showConnections) {
        ctx.strokeStyle = connectionColor;
        ctx.lineWidth = connectionWidth;

        HAND_CONNECTIONS.forEach(([start, end]) => {
          const startLm = landmarks[start!];
          const endLm = landmarks[end!];

          if (!startLm || !endLm) return;

          ctx.beginPath();
          ctx.moveTo(startLm.x * width, startLm.y * height);
          ctx.lineTo(endLm.x * width, endLm.y * height);
          ctx.stroke();
        });
      }

      // Draw landmarks
      if (showLandmarks) {
        ctx.fillStyle = landmarkColor;

        landmarks.forEach((landmark) => {
          ctx.beginPath();
          ctx.arc(
            landmark.x * width,
            landmark.y * height,
            landmarkRadius,
            0,
            2 * Math.PI
          );
          ctx.fill();
        });
      }
    });
  }, [
    hands,
    width,
    height,
    showLandmarks,
    showConnections,
    landmarkColor,
    connectionColor,
    landmarkRadius,
    connectionWidth,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
