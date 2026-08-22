import { useEffect } from 'react';
import { HintTooltip } from './HintTooltip';
import { useHintsStore } from '@/stores/hintsStore';
import { useSceneStore } from '@/stores/sceneStore';
import { useGestureStore } from '@/hooks/useGestureRecognition';

export function HintsManager() {
  const shouldShowWelcome = useHintsStore((state) => state.shouldShow('welcome'));
  const shouldShowFirstGrab = useHintsStore((state) => state.shouldShow('firstGrab'));
  const shouldShowBuildMode = useHintsStore((state) => state.shouldShow('buildMode'));
  const shouldShowObjectSpawned = useHintsStore((state) => state.shouldShow('objectSpawned'));

  const buildMode = useSceneStore((state) => state.buildMode);
  const objects = useSceneStore((state) => state.objects);
  const gestures = useGestureStore((state) => state.gestures);

  const markShown = useHintsStore((state) => state.markShown);

  // Track first pinch gesture
  useEffect(() => {
    const hasPinch = gestures.some((g) => g.gesture === 'pinch');
    if (hasPinch && shouldShowFirstGrab) {
      // Delay showing the hint slightly so it appears after the pinch
      setTimeout(() => {
        markShown('firstGrab');
      }, 500);
    }
  }, [gestures, shouldShowFirstGrab, markShown]);

  // Track build mode activation
  useEffect(() => {
    if (buildMode && shouldShowBuildMode) {
      markShown('buildMode');
    }
  }, [buildMode, shouldShowBuildMode, markShown]);

  // Track object spawning
  useEffect(() => {
    // Show hint when user spawns their first non-default object
    // (there are 3 default objects in the scene initially)
    if (objects.length > 3 && shouldShowObjectSpawned) {
      markShown('objectSpawned');
    }
  }, [objects.length, shouldShowObjectSpawned, markShown]);

  return (
    <>
      {/* Welcome hint - shown on first visit */}
      <HintTooltip
        type="welcome"
        title="Welcome to HandTrack3D"
        message="Use your hand to interact with 3D objects! Try pinching near an object to grab it, then move your hand to drag it around."
        position="center"
        autoHideDelay={10000}
      />

      {/* First grab hint - shown after first pinch */}
      {!shouldShowWelcome && (
        <HintTooltip
          type="firstGrab"
          title="Great job!"
          message="You can release objects by opening your hand. Try different gestures to interact with the scene."
          position="top-right"
        />
      )}

      {/* Build mode hint */}
      <HintTooltip
        type="buildMode"
        title="Build Mode Activated"
        message="Click anywhere in the scene to place objects. Use the Object Spawner on the right to select type, size, and color. Press B to exit build mode."
        position="top-left"
        autoHideDelay={10000}
      />

      {/* Object spawned hint */}
      <HintTooltip
        type="objectSpawned"
        title="Object Spawned"
        message="New objects spawn in front of the camera. You can right-click any object to edit its properties, or use Build Mode (press B) for precise placement."
        position="top-right"
      />

      {/* Camera controls hint - shown after welcome */}
      {!shouldShowWelcome && (
        <HintTooltip
          type="cameraControls"
          title="Camera Controls"
          message="Use your mouse to control the camera: Left-click + drag to rotate, right-click + drag to pan, and scroll to zoom."
          position="bottom-right"
        />
      )}

      {/* Property editor hint */}
      <HintTooltip
        type="propertyEditor"
        title="Property Editor"
        message="Right-click any object to open the property editor. You can adjust physics, appearance, and lock/unlock objects."
        position="bottom-left"
      />
    </>
  );
}
