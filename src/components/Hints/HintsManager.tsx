import { useState, useEffect } from 'react';
import { useHintsStore } from '@/stores/hintsStore';
import { HINTS } from '@/data/hints';
import { HintTooltip } from './HintTooltip';
import type { Hint } from '@/data/hints';

/**
 * HintsManager
 * 
 * Orchestrates all hints based on triggers and user actions.
 * Shows hints one at a time to avoid overwhelming the user.
 */
export function HintsManager() {
  const hintsStore = useHintsStore();
  const [activeHint, setActiveHint] = useState<Hint | null>(null);

  useEffect(() => {
    // Don't show hints if one is already active
    if (activeHint) return;

    // Check each hint to see if it should be shown
    for (const hint of HINTS) {
      // Skip if already shown
      if (hintsStore.shownHints.has(hint.id)) continue;

      let shouldShow = false;

      // Check trigger conditions
      switch (hint.trigger.type) {
        case 'timer':
          // Timer-based hints are handled separately with setTimeout
          // This is checked on component mount
          if (hint.trigger.delay) {
            setTimeout(() => {
              if (!hintsStore.shownHints.has(hint.id) && !activeHint) {
                setActiveHint(hint);
                hintsStore.markHintAsShown(hint.id);
              }
            }, hint.trigger.delay);
          }
          break;

        case 'event':
          if (hint.trigger.event === 'camera-rotated') {
            shouldShow = hintsStore.cameraRotations >= (hint.trigger.count || 1);
          }
          break;

        case 'gesture-count':
          if (hint.trigger.gesture) {
            const count = hintsStore.gestureCount[hint.trigger.gesture] || 0;
            shouldShow = count >= (hint.trigger.count || 1);
          }
          break;

        case 'objects-spawned':
          shouldShow = hintsStore.objectsSpawned >= (hint.trigger.count || 1);
          break;

        case 'session-count':
          shouldShow = hintsStore.sessionCount >= (hint.trigger.count || 1);
          break;
      }

      if (shouldShow) {
        setActiveHint(hint);
        hintsStore.markHintAsShown(hint.id);
        break; // Show only one hint at a time
      }
    }
  }, [
    hintsStore.cameraRotations,
    hintsStore.gestureCount,
    hintsStore.objectsSpawned,
    hintsStore.sessionCount,
    hintsStore.shownHints,
    activeHint,
  ]);

  const handleDismiss = () => {
    setActiveHint(null);
  };

  if (!activeHint) return null;

  return <HintTooltip hint={activeHint} onDismiss={handleDismiss} />;
}
