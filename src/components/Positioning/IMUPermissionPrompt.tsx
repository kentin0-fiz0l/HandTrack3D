import { useEffect, useState } from 'react';
import { useIMUOrientation } from '@/hooks/useIMUOrientation';

/**
 * Modal permission prompt for iOS devices
 *
 * Auto-shows when:
 * 1. Device is iOS (has permission API)
 * 2. Permission state is 'prompt'
 * 3. User hasn't dismissed it yet (this session)
 *
 * Provides clear UI for requesting DeviceOrientation permission,
 * which is required on iOS 13+ for accessing gyroscope/accelerometer.
 */
export function IMUPermissionPrompt() {
  const { permissionState, requestPermission } = useIMUOrientation();
  const [dismissed, setDismissed] = useState(false);

  // Auto-dismiss after permission granted/denied
  useEffect(() => {
    if (permissionState === 'granted' || permissionState === 'denied') {
      setDismissed(true);
    }
  }, [permissionState]);

  // Don't show if:
  // - Permission not needed (granted/denied/unsupported)
  // - User dismissed the prompt
  if (permissionState !== 'prompt' || dismissed) {
    return null;
  }

  const handleAllow = async () => {
    await requestPermission();
    // Permission state will update automatically, triggering auto-dismiss
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-purple-700/50 rounded-lg p-6 max-w-md mx-4 shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white text-center mb-2">
          Enable Camera Orientation
        </h2>

        {/* Description */}
        <p className="text-gray-300 text-sm text-center mb-6">
          HandTrack3D needs access to your device's motion sensors to track camera orientation.
          This enables accurate hand tracking even when you move or rotate your device.
        </p>

        {/* Info */}
        <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-3 mb-6">
          <div className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs text-gray-400">
              Your orientation data stays on your device and is only used for hand tracking.
              This permission is required on iOS 13+ for privacy reasons.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg transition-colors text-sm font-medium"
          >
            Not Now
          </button>
          <button
            onClick={handleAllow}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-lg transition-colors text-sm font-medium"
          >
            Allow
          </button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          You can change this in your browser settings later
        </p>
      </div>
    </div>
  );
}
