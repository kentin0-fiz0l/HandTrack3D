import { useEffect } from 'react';
import { useBuildModeStore } from '@/stores/buildModeStore';
import { useSceneStore } from '@/stores/sceneStore';

/**
 * BuildMode Component
 *
 * This component manages the build mode UI state and keyboard shortcuts.
 * It displays a banner when build mode is active and handles ESC to cancel.
 * The actual 3D interaction is handled by BuildModeController.
 */
export function BuildMode() {
  const buildMode = useBuildModeStore((state) => state.enabled);
  const gridSnapEnabled = useBuildModeStore((state) => state.gridSnapEnabled);
  const setBuildMode = useBuildModeStore((state) => state.setBuildMode);
  const toggleGridSnap = useBuildModeStore((state) => state.toggleGridSnap);
  const setGhostPreview = useSceneStore((state) => state.setGhostPreview);

  useEffect(() => {
    if (!buildMode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC to cancel build mode
      if (event.code === 'Escape') {
        event.preventDefault();
        setBuildMode(false);
        setGhostPreview(null);
      }

      // G to toggle grid snap (only in build mode)
      if (event.code === 'KeyG' && !event.repeat) {
        event.preventDefault();
        toggleGridSnap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buildMode, setBuildMode, setGhostPreview, toggleGridSnap]);

  // Change cursor to crosshair when in build mode
  useEffect(() => {
    if (buildMode) {
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      document.body.style.cursor = 'default';
    };
  }, [buildMode]);

  if (!buildMode) return null;

  return (
    <>
      {/* BUILD MODE ON Banner */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-green-400 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-ping" />
            <span className="text-lg font-bold">BUILD MODE ON</span>
            <div className="w-3 h-3 bg-white rounded-full animate-ping" />
          </div>
        </div>
      </div>

      {/* Build Mode Instructions */}
      <div className="absolute top-32 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="bg-black/80 text-white px-4 py-2 rounded-lg shadow-xl text-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Click to place object</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">G</span>
              <span>
                Grid Snap: <strong>{gridSnapEnabled ? 'ON' : 'OFF'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">ESC</span>
              <span>Cancel build mode</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
