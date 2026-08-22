interface WebcamErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
}

export function WebcamErrorDisplay({ error, onRetry }: WebcamErrorDisplayProps) {
  if (!error) return null;

  // Parse error to provide user-friendly messages
  const getErrorInfo = (errorMessage: string) => {
    if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
      return {
        title: 'Camera Access Denied',
        message: 'Please allow camera access in your browser settings to use HandTrack3D.',
        suggestion: 'Click the camera icon in your browser\'s address bar and select "Allow".',
        icon: '🚫',
      };
    }

    if (errorMessage.includes('NotFoundError') || errorMessage.includes('DevicesNotFoundError')) {
      return {
        title: 'No Camera Found',
        message: 'No webcam detected on your device.',
        suggestion: 'Please connect a webcam and refresh the page.',
        icon: '📷',
      };
    }

    if (errorMessage.includes('NotReadableError') || errorMessage.includes('TrackStartError')) {
      return {
        title: 'Camera In Use',
        message: 'Your camera is already being used by another application.',
        suggestion: 'Close other apps using the camera (Zoom, Skype, etc.) and try again.',
        icon: '⚠️',
      };
    }

    if (errorMessage.includes('OverconstrainedError')) {
      return {
        title: 'Camera Configuration Error',
        message: 'Your camera doesn\'t support the requested settings.',
        suggestion: 'Try refreshing the page or use a different camera.',
        icon: '⚙️',
      };
    }

    // Generic error
    return {
      title: 'Camera Error',
      message: errorMessage,
      suggestion: 'Try refreshing the page or checking your camera settings.',
      icon: '❌',
    };
  };

  const errorInfo = getErrorInfo(error);

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-red-900/95 border-2 border-red-500 rounded-xl p-6 shadow-2xl">
        <div className="text-center mb-4">
          <div className="text-6xl mb-3">{errorInfo.icon}</div>
          <h2 className="text-2xl font-bold text-red-100 mb-2">{errorInfo.title}</h2>
        </div>

        <div className="space-y-3 text-sm">
          <div className="bg-red-950/50 rounded-lg p-3">
            <p className="text-red-200">{errorInfo.message}</p>
          </div>

          <div className="bg-red-950/30 rounded-lg p-3 border-l-4 border-yellow-500">
            <p className="text-yellow-200 font-medium mb-1">💡 Suggestion:</p>
            <p className="text-yellow-100">{errorInfo.suggestion}</p>
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 w-full bg-red-700 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors font-medium text-sm"
          >
            Retry Camera Access
          </button>
        )}

        <div className="mt-4 text-xs text-red-300/70 text-center">
          <details className="cursor-pointer">
            <summary className="hover:text-red-200">Technical Details</summary>
            <pre className="mt-2 text-left bg-red-950/50 p-2 rounded overflow-x-auto">
              {error}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
