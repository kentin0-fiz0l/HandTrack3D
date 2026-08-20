import { useEffect } from 'react';

export function useKeyboardShortcuts(callbacks: {
  onReset?: () => void;
  onTogglePanel?: () => void;
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
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
}
