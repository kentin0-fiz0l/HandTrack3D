import { useState, useEffect } from 'react';
import { useHandCursorStore } from '@/hooks/useHandTo3DMapping';
import { usePoseTrackingStore } from '@/stores/poseTrackingStore';

interface DepthBreakdownPanelProps {
  show: boolean;
}

interface DepthData {
  handId: string;
  totalDepth: number;
  mediaPipeZ: number;
  handSize: number;
  armExtension: number;
  confidence: number;
  poseAvailable: boolean;
}

export function DepthBreakdownPanel({ show }: DepthBreakdownPanelProps) {
  const cursors = useHandCursorStore((state) => state.cursors);
  const pose = usePoseTrackingStore((state) => state.pose);
  const [depthData, setDepthData] = useState<DepthData[]>([]);

  useEffect(() => {
    if (!show) return;

    // Update depth data for each hand
    const data: DepthData[] = cursors.map((cursor) => ({
      handId: cursor.id,
      totalDepth: cursor.position.z,
      // These will be calculated from the actual depth calculation
      mediaPipeZ: 0, // Will be populated from actual calculations
      handSize: 0,
      armExtension: 0,
      confidence: 0,
      poseAvailable: !!pose && pose.landmarks.length > 0,
    }));

    setDepthData(data);
  }, [cursors, pose, show]);

  if (!show) return null;

  return (
    <div className="absolute top-24 right-4 bg-gray-900/90 text-white p-4 rounded-lg shadow-lg z-30 font-mono text-sm max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-green-400">🎯 Depth Tracking Debug</h3>
        <span className="text-xs text-gray-400">Press D to toggle</span>
      </div>

      {/* Pose Tracking Status */}
      <div className="mb-3 pb-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className={pose ? 'text-green-400' : 'text-red-400'}>
            {pose ? '✓' : '✗'}
          </span>
          <span className="text-gray-300">
            MoveNet Pose Tracking: {pose ? 'Active' : 'Inactive'}
          </span>
        </div>
        {pose && (
          <div className="text-xs text-gray-400 mt-1 ml-6">
            {pose.landmarks.length} keypoints detected
          </div>
        )}
      </div>

      {/* Hand Depth Data */}
      {depthData.length === 0 && (
        <div className="text-gray-400 text-center py-4">
          No hands detected
        </div>
      )}

      {depthData.map((data) => (
        <div key={data.handId} className="mb-4 last:mb-0">
          <div className="font-bold text-blue-400 mb-2">
            {data.handId === 'left' ? '👈 Left Hand' : '👉 Right Hand'}
          </div>

          {/* Total Depth */}
          <div className="bg-gray-800 p-2 rounded mb-2">
            <div className="text-gray-400 text-xs">Total Depth (Z)</div>
            <div className="text-2xl font-bold text-white">
              {data.totalDepth.toFixed(2)}m
            </div>
          </div>

          {/* Depth Components */}
          <div className="space-y-1 text-xs">
            <DepthComponent
              label="MediaPipe Z"
              value={data.mediaPipeZ}
              weight={20}
              color="blue"
            />
            <DepthComponent
              label="Hand Size"
              value={data.handSize}
              weight={50}
              color="purple"
            />
            <DepthComponent
              label="Arm Extension"
              value={data.armExtension}
              weight={30}
              color="yellow"
              available={data.poseAvailable}
            />
          </div>

          {!data.poseAvailable && (
            <div className="mt-2 text-xs text-orange-400 bg-orange-900/30 p-2 rounded">
              ⚠️ Arm extension unavailable - pose not detected
            </div>
          )}
        </div>
      ))}

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-400">
        <div>Formula: 0.2×MediaPipe + 0.5×Size + 0.3×Arm</div>
        <div className="mt-1">Smoothing: EMA (α=0.3)</div>
      </div>
    </div>
  );
}

interface DepthComponentProps {
  label: string;
  value: number;
  weight: number;
  color: 'blue' | 'purple' | 'yellow';
  available?: boolean;
}

function DepthComponent({ label, value, weight, color, available = true }: DepthComponentProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
  };

  const textColorClasses = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
  };

  return (
    <div className={`flex items-center gap-2 ${!available ? 'opacity-50' : ''}`}>
      <div className={`w-2 h-2 rounded-full ${colorClasses[color]}`} />
      <div className="flex-1">
        <span className={textColorClasses[color]}>{label}</span>
        <span className="text-gray-500"> ({weight}%)</span>
      </div>
      <div className="text-white font-mono">
        {available ? `${value.toFixed(2)}m` : 'N/A'}
      </div>
    </div>
  );
}
