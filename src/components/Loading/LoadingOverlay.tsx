import { useEffect, useState } from 'react';

export type LoadingStage =
  | 'initializing'
  | 'backend_init'
  | 'model_download'
  | 'model_ready'
  | 'complete';

interface LoadingOverlayProps {
  isLoading: boolean;
  stage?: LoadingStage;
  modelName?: string;
  error?: string | null;
}

const STAGE_INFO: Record<LoadingStage, { label: string; progress: number; description: string }> = {
  initializing: {
    label: 'Initializing',
    progress: 10,
    description: 'Setting up tracking system...',
  },
  backend_init: {
    label: 'Loading Backend',
    progress: 30,
    description: 'Initializing TensorFlow.js WebGL backend...',
  },
  model_download: {
    label: 'Downloading Model',
    progress: 60,
    description: 'Downloading AI model from CDN...',
  },
  model_ready: {
    label: 'Processing',
    progress: 90,
    description: 'Preparing model for inference...',
  },
  complete: {
    label: 'Ready',
    progress: 100,
    description: 'Tracking system ready!',
  },
};

export function LoadingOverlay({ isLoading, stage = 'initializing', modelName = 'Tracking', error }: LoadingOverlayProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const stageInfo = STAGE_INFO[stage];

  useEffect(() => {
    if (!isLoading) {
      setElapsedTime(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Loading {modelName}
          </h2>
          <p className="text-gray-400 text-sm">
            {stageInfo.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>{stageInfo.label}</span>
            <span>{stageInfo.progress}%</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-out"
              style={{ width: `${stageInfo.progress}%` }}
            >
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Stage Details */}
        <div className="space-y-2 mb-6">
          {Object.entries(STAGE_INFO).map(([key, info]) => {
            const isActive = key === stage;
            const isPast = STAGE_INFO[key].progress < stageInfo.progress;

            return (
              <div
                key={key}
                className={`flex items-center gap-3 text-sm transition-opacity ${
                  isActive ? 'opacity-100' : isPast ? 'opacity-60' : 'opacity-30'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isActive
                      ? 'bg-blue-500 animate-pulse'
                      : isPast
                      ? 'bg-green-500'
                      : 'bg-gray-600'
                  }`}
                />
                <span className={isActive ? 'text-white font-medium' : 'text-gray-400'}>
                  {info.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time Elapsed */}
        <div className="text-center text-xs text-gray-500">
          {elapsedTime > 0 && (
            <p>
              Elapsed: {elapsedTime}s
              {elapsedTime > 10 && stage === 'model_download' && (
                <span className="ml-2 text-yellow-400">
                  (Slow connection detected)
                </span>
              )}
            </p>
          )}
        </div>

        {/* First Time Notice */}
        {elapsedTime > 3 && (
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
            <p className="text-xs text-blue-200">
              💡 <strong>First time loading?</strong> Models are cached after initial download.
              Subsequent loads will be faster.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
            <p className="text-xs text-red-200">
              ⚠️ {error}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
