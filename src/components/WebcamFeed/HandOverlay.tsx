// @ts-nocheck
import { useEffect, useRef } from 'react';
import { useHandTrackingStore } from '@/stores/handTrackingStore';

const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm
  [5, 9], [9, 13], [13, 17],
];

interface HandOverlayProps {
  width: number;
  height: number;
}

export function HandOverlay({ width, height }: HandOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hands = useHandTrackingStore((state) => state.hands);
  const fps = useHandTrackingStore((state) => state.fps);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw each hand
    hands.forEach((hand) => {
      const color = hand.handedness === 'Left' ? '#10b981' : '#3b82f6';

      // Draw connections
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      HAND_CONNECTIONS.forEach(([start, end]) => {
        const startLm = hand.landmarks[start];
        const endLm = hand.landmarks[end];
        ctx.beginPath();
        ctx.moveTo(startLm.x * width, startLm.y * height);
        ctx.lineTo(endLm.x * width, endLm.y * height);
        ctx.stroke();
      });

      // Draw landmarks
      ctx.fillStyle = color;
      hand.landmarks.forEach((lm, index) => {
        ctx.beginPath();
        ctx.arc(lm.x * width, lm.y * height, index === 0 ? 8 : 4, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw hand label
      const wrist = hand.landmarks[0];
      ctx.fillStyle = 'white';
      ctx.font = '14px sans-serif';
      ctx.fillText(hand.handedness, wrist.x * width, wrist.y * height - 10);
    });

    // Draw FPS
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 100, 30);
    ctx.fillStyle = 'white';
    ctx.font = '16px monospace';
    ctx.fillText(`FPS: ${fps}`, 20, 30);
  }, [hands, fps, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none"
    />
  );
}
