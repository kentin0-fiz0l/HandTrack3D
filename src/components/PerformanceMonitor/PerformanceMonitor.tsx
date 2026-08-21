import { usePerformanceMetricsStore } from './PerformanceTracker';
import { useSettingsStore } from '@/stores/settingsStore';
import { useHandTrackingStore } from '@/stores/handTrackingStore';
import { useSceneStore } from '@/stores/sceneStore';

interface MetricDisplayProps {
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  unit?: string;
}

function MetricDisplay({ label, value, status, unit = '' }: MetricDisplayProps) {
  const colors = {
    good: 'text-green-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400',
  };

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-400 text-xs">{label}</span>
      <span className={`font-mono text-sm font-semibold ${colors[status]}`}>
        {value}
        {unit}
      </span>
    </div>
  );
}

function getStatus(
  value: number,
  goodThreshold: number,
  warningThreshold: number,
  invert = false
): 'good' | 'warning' | 'critical' {
  if (invert) {
    if (value <= goodThreshold) return 'good';
    if (value <= warningThreshold) return 'warning';
    return 'critical';
  } else {
    if (value >= goodThreshold) return 'good';
    if (value >= warningThreshold) return 'warning';
    return 'critical';
  }
}

export function PerformanceMonitor() {
  const showPerformance = useSettingsStore((state) => state.showPerformance);
  const updateVisualSetting = useSettingsStore((state) => state.updateVisualSetting);

  const { fps, frameTime } = usePerformanceMetricsStore((state) => state.metrics);
  const handTrackingFps = useHandTrackingStore((state) => state.fps);
  const objectCount = useSceneStore((state) => state.objects.length);

  // Get memory usage if available (Chrome only)
  const memoryUsage =
    (performance as any).memory?.usedJSHeapSize
      ? Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024))
      : null;

  if (!showPerformance) return null;

  const fpsStatus = getStatus(fps, 55, 30);
  const frameTimeStatus = getStatus(frameTime, 16.67, 33.33, true);
  const handTrackingStatus = getStatus(handTrackingFps, 25, 15);

  return (
    <div className="fixed top-4 right-4 z-40 bg-gray-900/95 text-white rounded-lg shadow-lg border border-white/20 w-64">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/20">
        <h3 className="text-sm font-semibold">Performance</h3>
        <button
          onClick={() => updateVisualSetting('showPerformance', false)}
          className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded transition text-xs"
          title="Hide Performance Monitor"
        >
          ✕
        </button>
      </div>

      {/* Metrics */}
      <div className="px-4 py-3 space-y-1">
        <MetricDisplay
          label="FPS"
          value={fps}
          status={fpsStatus}
          unit=" fps"
        />

        <MetricDisplay
          label="Frame Time"
          value={frameTime}
          status={frameTimeStatus}
          unit=" ms"
        />

        <MetricDisplay
          label="Hand Tracking"
          value={handTrackingFps}
          status={handTrackingStatus}
          unit=" fps"
        />

        <MetricDisplay
          label="Objects"
          value={objectCount}
          status="good"
        />

        {memoryUsage !== null && (
          <MetricDisplay
            label="Memory"
            value={memoryUsage}
            status={
              memoryUsage > 500
                ? 'critical'
                : memoryUsage > 300
                ? 'warning'
                : 'good'
            }
            unit=" MB"
          />
        )}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-white/20 text-xs text-gray-500">
        Target: 60 FPS / &lt;16.67ms
      </div>
    </div>
  );
}
