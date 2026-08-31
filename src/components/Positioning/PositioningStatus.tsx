import { usePositioningStore } from '@/stores/positioningStore';
import { useWiFiPositioning } from '@/hooks/useWiFiPositioning';
import { useSensorFusion } from '@/hooks/useSensorFusion';

/**
 * Positioning status indicator showing connection and current position
 */
export function PositioningStatus() {
  const {
    isConnected,
    connectionError,
    roomPosition,
    positionAccuracy,
    enablePositioning,
    positioningMode,
    routers,
    lastUpdateTime,
  } = usePositioningStore();

  const { connect, disconnect } = useWiFiPositioning();
  const { uwbState } = useSensorFusion();

  // Don't render if positioning is disabled
  if (!enablePositioning || positioningMode === 'disabled') {
    return null;
  }

  // Determine if we're using UWB
  const isUWBMode = positioningMode === 'uwb-only' || (positioningMode === 'fusion' && uwbState?.isConnected);

  // Calculate time since last update
  const timeSinceUpdate = lastUpdateTime
    ? Date.now() - lastUpdateTime
    : null;
  const isStale = timeSinceUpdate !== null && timeSinceUpdate > 2000; // 2s threshold

  return (
    <div className="absolute top-20 right-4 z-20 bg-black/80 backdrop-blur-sm rounded-lg p-3 min-w-[200px] border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">
          {isUWBMode ? 'UWB Positioning' : 'WiFi Positioning'}
        </h3>
        <div
          className={`w-2 h-2 rounded-full ${
            isUWBMode
              ? uwbState?.isConnected ? 'bg-green-500' : 'bg-red-500'
              : isConnected ? 'bg-green-500' : 'bg-red-500'
          } ${(isUWBMode ? uwbState?.isConnected : isConnected) ? 'animate-pulse' : ''}`}
          title={(isUWBMode ? uwbState?.isConnected : isConnected) ? 'Connected' : 'Disconnected'}
        />
      </div>

      {/* Connection Error */}
      {(isUWBMode ? uwbState?.error : connectionError) && (
        <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-200">
          {isUWBMode ? uwbState?.error : connectionError}
        </div>
      )}

      {/* Mode */}
      <div className="text-xs text-gray-400 mb-2">
        Mode:{' '}
        <span className="text-white font-medium">
          {positioningMode === 'wifi-only' && 'WiFi Only'}
          {positioningMode === 'uwb-only' && 'UWB Only'}
          {positioningMode === 'fusion' && 'Sensor Fusion'}
        </span>
      </div>

      {/* UWB-specific info */}
      {isUWBMode && uwbState && (
        <>
          <div className="text-xs text-gray-400 mb-2">
            Anchors:{' '}
            <span className={`font-medium ${
              uwbState.anchorsUsed >= 4 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {uwbState.anchorsUsed}/{uwbState.anchors.length}
            </span>
          </div>
          <div className="text-xs text-gray-400 mb-2">
            Update Rate:{' '}
            <span className="text-white font-medium">
              {uwbState.updateRate.toFixed(1)} Hz
            </span>
          </div>
          <div className="text-xs text-gray-400 mb-2">
            Quality:{' '}
            <span className={`font-medium ${
              uwbState.quality >= 80 ? 'text-green-400' :
              uwbState.quality >= 50 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {uwbState.quality}/100
            </span>
          </div>
        </>
      )}

      {/* WiFi-specific info */}
      {!isUWBMode && (
        <div className="text-xs text-gray-400 mb-2">
          Routers:{' '}
          <span
            className={`font-medium ${
              routers.length >= 3 ? 'text-green-400' : 'text-yellow-400'
            }`}
          >
            {routers.length}/4
          </span>
          {routers.length < 3 && (
            <span className="text-yellow-400 ml-1">(need 3+)</span>
          )}
        </div>
      )}

      {/* Current Position */}
      {(isUWBMode ? uwbState?.position : roomPosition) && (
        <div className="mb-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
          <div className="text-xs text-gray-400 mb-1">Room Position:</div>
          {isUWBMode && uwbState?.position ? (
            <>
              <div className="text-sm font-mono text-white">
                X: {uwbState.position.x.toFixed(3)}m
              </div>
              <div className="text-sm font-mono text-white">
                Y: {uwbState.position.y.toFixed(3)}m
              </div>
              <div className="text-sm font-mono text-white">
                Z: {uwbState.position.z.toFixed(3)}m
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Accuracy: ±0.02m (UWB)
              </div>
            </>
          ) : roomPosition ? (
            <>
              <div className="text-sm font-mono text-white">
                X: {roomPosition[0].toFixed(2)}m
              </div>
              <div className="text-sm font-mono text-white">
                Y: {roomPosition[1].toFixed(2)}m
              </div>
              <div className="text-sm font-mono text-white">
                Z: {roomPosition[2].toFixed(2)}m
              </div>
              {positionAccuracy !== null && (
                <div className="text-xs text-gray-400 mt-1">
                  Accuracy: ±{positionAccuracy.toFixed(2)}m
                </div>
              )}
              {isStale && (
                <div className="text-xs text-yellow-400 mt-1">
                  ⚠️ Data stale ({Math.floor((timeSinceUpdate || 0) / 1000)}s old)
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* No Position */}
      {!(isUWBMode ? uwbState?.position : roomPosition) && (isUWBMode ? uwbState?.isConnected : isConnected) && (
        <div className="text-xs text-gray-500 italic mb-2">
          {isUWBMode
            ? 'Waiting for UWB position data...'
            : routers.length < 3
            ? 'Configure routers to enable positioning'
            : 'Waiting for position data...'}
        </div>
      )}

      {/* Connection Controls - WiFi only (UWB auto-connects) */}
      {!isUWBMode && (
        <div className="flex gap-2">
          {!isConnected ? (
            <button
              onClick={connect}
              className="flex-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Connect
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="flex-1 px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>
      )}

      {/* Help Text */}
      {isUWBMode && !uwbState?.isConnected && (
        <div className="mt-2 text-xs text-gray-500">
          Start UWB server: <code className="text-gray-400">npm run uwb:mock</code>
        </div>
      )}
      {!isUWBMode && !isConnected && (
        <div className="mt-2 text-xs text-gray-500">
          Start companion app: <code className="text-gray-400">npm run companion</code>
        </div>
      )}
    </div>
  );
}
