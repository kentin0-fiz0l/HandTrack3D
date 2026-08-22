import { useState, useEffect } from 'react';
import { useHandTrackingStore } from '@/stores/handTrackingStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function PerformanceWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const fps = useHandTrackingStore((state) => state.fps);
  const poseTrackingEnabled = useSettingsStore((state) => state.poseTrackingEnabled);
  const updatePerformanceSetting = useSettingsStore((state) => state.updatePerformanceSetting);

  useEffect(() => {
    // Don't show warning if already dismissed or pose tracking already disabled
    if (dismissed || !poseTrackingEnabled) {
      setShowWarning(false);
      return;
    }

    // Check if FPS is consistently low (< 25 FPS)
    // Only show warning after giving it time to stabilize
    if (fps > 0 && fps < 25) {
      // Wait 5 seconds before showing warning (let initialization complete)
      const timer = setTimeout(() => {
        if (fps < 25 && poseTrackingEnabled) {
          setShowWarning(true);
        }
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      // FPS is good, hide warning
      setShowWarning(false);
    }
  }, [fps, dismissed, poseTrackingEnabled]);

  const handleEnablePerformanceMode = () => {
    updatePerformanceSetting('poseTrackingEnabled', false);
    setShowWarning(false);
    setDismissed(true);
  };

  const handleDismiss = () => {
    setShowWarning(false);
    setDismissed(true);
    // Save dismissal to localStorage
    localStorage.setItem('performance_warning_dismissed', 'true');
  };

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-20 right-4 max-w-sm z-40 animate-slide-up">
      <div className="bg-yellow-900/95 border-2 border-yellow-500 rounded-lg p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="text-3xl">⚡</div>
          <div className="flex-1">
            <h3 className="text-yellow-100 font-semibold mb-1">
              Low Frame Rate Detected
            </h3>
            <p className="text-yellow-200 text-sm mb-3">
              Your device is running at {fps} FPS. Disabling pose tracking may improve performance.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleEnablePerformanceMode}
                className="flex-1 bg-yellow-700 hover:bg-yellow-600 text-white py-2 px-3 rounded transition-colors text-sm font-medium"
              >
                Enable Performance Mode
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-yellow-300 hover:text-yellow-100 transition-colors text-sm"
              >
                Dismiss
              </button>
            </div>

            <p className="text-yellow-300/70 text-xs mt-2">
              💡 You can re-enable pose tracking anytime in Settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
