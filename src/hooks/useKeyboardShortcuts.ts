import { useEffect } from 'react';

export function useKeyboardShortcuts(callbacks: {
  onReset?: () => void;
  onTogglePanel?: () => void;
  onToggleSettings?: () => void;
  onToggleBuildMode?: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Space: Reset camera
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        callbacks.onReset?.();
      }

      // H: Toggle panel
      if (event.code === 'KeyH' && !event.repeat) {
        event.preventDefault();
        callbacks.onTogglePanel?.();
      }

      // S: Toggle settings
      if (event.code === 'KeyS' && !event.repeat) {
        event.preventDefault();
        callbacks.onToggleSettings?.();
      }

      // B: Toggle build mode
      if (event.code === 'KeyB' && !event.repeat) {
        event.preventDefault();
        callbacks.onToggleBuildMode?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
}
