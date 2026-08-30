import { useEffect, useState } from 'react';
import { useSensorFusion } from '@/hooks/useSensorFusion';
import { usePositioningStore } from '@/stores/positioningStore';

/**
 * Sensor fusion debug panel
 *
 * Displays real-time fusion statistics:
 * - Active Kalman filters
 * - Camera pose status
 * - Average position uncertainty
 * - Per-hand fusion data
 */
export function SensorFusionDebug() {
  const { sensorFusion, isFusionActive } = useSensorFusion();
  const { positioningMode, enablePositioning } = usePositioningStore();
  const [stats, setStats] = useState({
    activeFilters: 0,
    cameraPoseAvailable: false,
    averageUncertainty: 0,
    hands: [] as Array<{
      id: string;
      roomPos: [number, number, number];
      uncertainty: number;
    }>,
  });

  // Update stats every 100ms
  useEffect(() => {
    if (!enablePositioning || positioningMode !== 'fusion') {
      return;
    }

    const interval = setInterval(() => {
      const newStats = sensorFusion.getStats();
      setStats(newStats);
    }, 100);

    return () => clearInterval(interval);
  }, [sensorFusion, enablePositioning, positioningMode]);

  // Don't render if not in fusion mode
  if (!enablePositioning || positioningMode !== 'fusion') {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-4 z-20 bg-black/80 backdrop-blur-sm rounded-lg p-3 min-w-[280px] border border-purple-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-purple-400">Sensor Fusion</h3>
        <div
          className={`w-2 h-2 rounded-full ${
            isFusionActive() ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
          }`}
          title={isFusionActive() ? 'Active' : 'Inactive'}
        />
      </div>

      {/* Overall Stats */}
      <div className="space-y-1 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Active Filters:</span>
          <span className="text-white font-mono">{stats.activeFilters}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Camera Pose:</span>
          <span
            className={`font-mono ${
              stats.cameraPoseAvailable ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {stats.cameraPoseAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Avg Uncertainty:</span>
          <span className="text-white font-mono">
            ±{stats.averageUncertainty.toFixed(3)}m
          </span>
        </div>
      </div>

      {/* Per-Hand Stats */}
      {stats.hands.length > 0 && (
        <div className="border-t border-purple-700/30 pt-2">
          <div className="text-xs text-gray-400 mb-2">Hand Positions:</div>
          <div className="space-y-2">
            {stats.hands.map((hand) => (
              <div
                key={hand.id}
                className="p-2 bg-purple-500/10 border border-purple-500/30 rounded"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-purple-300 capitalize">
                    {hand.id}
                  </span>
                  <span className="text-xs text-gray-400">
                    ±{hand.uncertainty.toFixed(3)}m
                  </span>
                </div>
                <div className="text-xs font-mono text-white">
                  X: {hand.roomPos[0].toFixed(2)}m
                </div>
                <div className="text-xs font-mono text-white">
                  Y: {hand.roomPos[1].toFixed(2)}m
                </div>
                <div className="text-xs font-mono text-white">
                  Z: {hand.roomPos[2].toFixed(2)}m
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!stats.cameraPoseAvailable && (
        <div className="mt-2 text-xs text-yellow-400 border-t border-purple-700/30 pt-2">
          ⚠️ Waiting for WiFi position data
        </div>
      )}
    </div>
  );
}
