import { useEffect, useRef } from 'react';
import { usePoseTrackingStore, PoseLandmarks } from '@/stores/poseTrackingStore';

interface PoseSkeletonOverlayProps {
  videoWidth: number;
  videoHeight: number;
  show: boolean;
}

// MoveNet skeleton connections (OPTIMIZED: Only arm connections)
// We only store 6 keypoints (shoulders, elbows, wrists) to reduce memory by 65%
const POSE_CONNECTIONS = [
  // Shoulder connection (to show body orientation)
  [PoseLandmarks.LEFT_SHOULDER, PoseLandmarks.RIGHT_SHOULDER],

  // Arms (IMPORTANT for depth tracking)
  [PoseLandmarks.LEFT_SHOULDER, PoseLandmarks.LEFT_ELBOW],
  [PoseLandmarks.LEFT_ELBOW, PoseLandmarks.LEFT_WRIST],
  [PoseLandmarks.RIGHT_SHOULDER, PoseLandmarks.RIGHT_ELBOW],
  [PoseLandmarks.RIGHT_ELBOW, PoseLandmarks.RIGHT_WRIST],
];

export function PoseSkeletonOverlay({ videoWidth, videoHeight, show }: PoseSkeletonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pose = usePoseTrackingStore((state) => state.pose);
  const isTracking = usePoseTrackingStore((state) => state.isTracking);

  useEffect(() => {
    if (!show || !canvasRef.current || !pose || !isTracking) {
      // Clear canvas if not showing
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, videoWidth, videoHeight);
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    const landmarks = pose.landmarks;

    // Draw skeleton lines
    ctx.strokeStyle = '#10b981'; // Green
    ctx.lineWidth = 3;

    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      // Only draw if both keypoints are confident
      if (start && end && start.visibility > 0.3 && end.visibility > 0.3) {
        ctx.beginPath();
        ctx.moveTo(start.x * videoWidth, start.y * videoHeight);
        ctx.lineTo(end.x * videoWidth, end.y * videoHeight);

        // Color-code confidence: green (high) → yellow (medium) → red (low)
        const avgConfidence = (start.visibility + end.visibility) / 2;
        if (avgConfidence > 0.7) {
          ctx.strokeStyle = '#10b981'; // Green
        } else if (avgConfidence > 0.5) {
          ctx.strokeStyle = '#fbbf24'; // Yellow
        } else {
          ctx.strokeStyle = '#ef4444'; // Red
        }

        ctx.stroke();
      }
    });

    // Draw keypoints (only the 6 arm keypoints we're storing)
    landmarks.forEach((landmark, idx) => {
      if (!landmark || landmark.visibility < 0.3) return; // Skip undefined or low-confidence points

      const x = landmark.x * videoWidth;
      const y = landmark.y * videoHeight;

      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);

      // Color-code by confidence
      if (landmark.visibility > 0.7) {
        ctx.fillStyle = '#10b981'; // Green
      } else if (landmark.visibility > 0.5) {
        ctx.fillStyle = '#fbbf24'; // Yellow
      } else {
        ctx.fillStyle = '#ef4444'; // Red
      }

      ctx.fill();

      // Highlight arm keypoints (important for depth tracking)
      const isArmKeypoint = [
        PoseLandmarks.LEFT_SHOULDER,
        PoseLandmarks.LEFT_ELBOW,
        PoseLandmarks.LEFT_WRIST,
        PoseLandmarks.RIGHT_SHOULDER,
        PoseLandmarks.RIGHT_ELBOW,
        PoseLandmarks.RIGHT_WRIST,
      ].includes(idx);

      if (isArmKeypoint) {
        ctx.strokeStyle = '#fbbf24'; // Yellow ring for arm points
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    // Draw arm extension indicator
    const leftWrist = landmarks[PoseLandmarks.LEFT_WRIST];
    const rightWrist = landmarks[PoseLandmarks.RIGHT_WRIST];

    if (leftWrist?.visibility > 0.5) {
      drawArmExtensionIndicator(ctx, 'Left', leftWrist, videoWidth, videoHeight);
    }
    if (rightWrist?.visibility > 0.5) {
      drawArmExtensionIndicator(ctx, 'Right', rightWrist, videoWidth, videoHeight);
    }

  }, [pose, isTracking, show, videoWidth, videoHeight]);

  // Helper to draw arm extension visualization
  function drawArmExtensionIndicator(
    ctx: CanvasRenderingContext2D,
    side: 'Left' | 'Right',
    wrist: { x: number; y: number; visibility: number },
    width: number,
    height: number
  ) {
    const x = wrist.x * width;
    const y = wrist.y * height;

    // Draw "ARM TRACKING" label near wrist
    ctx.font = '12px monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`${side} Arm`, x + 10, y - 10);
    ctx.fillText(`Conf: ${(wrist.visibility * 100).toFixed(0)}%`, x + 10, y + 5);
  }

  if (!show) return null;

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
}
