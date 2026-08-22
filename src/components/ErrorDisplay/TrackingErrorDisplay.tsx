import { useHandTrackingStore } from '@/stores/handTrackingStore';
import { usePoseTrackingStore } from '@/stores/poseTrackingStore';

interface ErrorDisplayProps {
  onRetry?: () => void;
}

export function TrackingErrorDisplay({ onRetry }: ErrorDisplayProps) {
  const handError = useHandTrackingStore((state) => state.error);
  const poseError = usePoseTrackingStore((state) => state.error);
  const clearHandError = useHandTrackingStore((state) => state.clearError);
  const clearPoseError = usePoseTrackingStore((state) => state.clearError);

  const handInitializing = useHandTrackingStore((state) => state.isInitializing);
  const poseInitializing = usePoseTrackingStore((state) => state.isInitializing);

  // Don't show anything if no errors and not initializing
  if (!handError && !poseError && !handInitializing && !poseInitializing) {
    return null;
  }

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
      {/* Hand tracking errors */}
      {handError && (
        <div className="bg-red-900/90 border border-red-500 rounded-lg p-4 mb-2 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-red-400 text-2xl">⚠️</span>
                <h3 className="text-red-100 font-semibold">Hand Tracking Error</h3>
              </div>
              <p className="text-red-200 text-sm mb-2">{handError.message}</p>
              <p className="text-red-300/70 text-xs">Code: {handError.code}</p>
            </div>
            <button
              onClick={clearHandError}
              className="text-red-300 hover:text-red-100 ml-4"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
          {handError.recoverable && onRetry && (
            <button
              onClick={() => {
                clearHandError();
                onRetry();
              }}
              className="mt-3 w-full bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors text-sm font-medium"
            >
              Retry Hand Tracking
            </button>
          )}
        </div>
      )}

      {/* Pose tracking errors */}
      {poseError && (
        <div className="bg-yellow-900/90 border border-yellow-500 rounded-lg p-4 mb-2 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-yellow-400 text-2xl">⚠️</span>
                <h3 className="text-yellow-100 font-semibold">Pose Tracking Error</h3>
              </div>
              <p className="text-yellow-200 text-sm mb-2">{poseError.message}</p>
              <p className="text-yellow-300/70 text-xs">Code: {poseError.code}</p>
              <p className="text-yellow-300/70 text-xs mt-1">
                Note: Hand tracking will continue without pose-based depth estimation
              </p>
            </div>
            <button
              onClick={clearPoseError}
              className="text-yellow-300 hover:text-yellow-100 ml-4"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
          {poseError.recoverable && onRetry && (
            <button
              onClick={() => {
                clearPoseError();
                onRetry();
              }}
              className="mt-3 w-full bg-yellow-700 hover:bg-yellow-600 text-white py-2 px-4 rounded transition-colors text-sm font-medium"
            >
              Retry Pose Tracking
            </button>
          )}
        </div>
      )}

      {/* Initialization states */}
      {handInitializing && !handError && (
        <div className="bg-blue-900/90 border border-blue-500 rounded-lg p-4 mb-2 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-300 border-t-transparent"></div>
            <div>
              <h3 className="text-blue-100 font-semibold text-sm">Initializing Hand Tracking</h3>
              <p className="text-blue-200 text-xs">Loading MediaPipe Hands model...</p>
            </div>
          </div>
        </div>
      )}

      {poseInitializing && !poseError && (
        <div className="bg-blue-900/90 border border-blue-500 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-300 border-t-transparent"></div>
            <div>
              <h3 className="text-blue-100 font-semibold text-sm">Initializing Pose Tracking</h3>
              <p className="text-blue-200 text-xs">Loading MoveNet model...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
