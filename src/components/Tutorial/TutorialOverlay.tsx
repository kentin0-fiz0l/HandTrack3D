import { useEffect, useState } from 'react';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useHandTrackingStore } from '@/stores/handTrackingStore';
import { useGestureStore } from '@/hooks/useGestureRecognition';
import { useSceneStore } from '@/stores/sceneStore';
import { getTutorialStep } from '@/data/tutorialSteps';
import { ProgressBar } from './ProgressBar';
import { Spotlight } from './Spotlight';

export function TutorialOverlay() {
  const {
    isActive,
    currentStep,
    completedSteps,
    nextStep,
    skipTutorial,
  } = useTutorialStore();

  const hands = useHandTrackingStore((state) => state.hands);
  const gestures = useGestureStore((state) => state.gestures);
  const objects = useSceneStore((state) => state.objects);
  const grabbedObjects = useSceneStore((state) => state.grabbedObjects);
  const getNearObjects = useSceneStore((state) => state.getNearObjects);

  const [webcamGranted, setWebcamGranted] = useState(false);
  const [objectGrabbed, setObjectGrabbed] = useState(false);
  const [objectReleased, setObjectReleased] = useState(false);

  const step = getTutorialStep(currentStep);

  // Check webcam permission
  useEffect(() => {
    const checkWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        setWebcamGranted(true);
      } catch {
        setWebcamGranted(false);
      }
    };

    const interval = setInterval(checkWebcam, 1000);
    checkWebcam();

    return () => clearInterval(interval);
  }, []);

  // Auto-advance based on success conditions
  useEffect(() => {
    if (!step || !isActive) return;

    const checkCondition = async () => {
      switch (step.successCondition) {
        case 'manual':
          // User must click "Next"
          break;

        case 'webcam':
          if (webcamGranted) {
            setTimeout(() => nextStep(), 1000);
          }
          break;

        case 'hand-detected':
          if (hands.length > 0) {
            setTimeout(() => nextStep(), 1500);
          }
          break;

        case 'pinch-near-object': {
          // Check if any hand is pinching near an object
          const isPinchingNearObject = gestures.some((gesture) => {
            if (gesture.gesture !== 'pinch') return false;

            // Find the hand cursor position
            const hand = hands.find((h) => h.id === gesture.handId);
            if (!hand) return false;

            // Check if near any object (using grab range of 1.5)
            const nearObjects = getNearObjects(
              { x: hand.landmarks[0].x, y: hand.landmarks[0].y, z: hand.landmarks[0].z } as any,
              1.5
            );

            return nearObjects.length > 0;
          });

          if (isPinchingNearObject) {
            setTimeout(() => nextStep(), 1000);
          }
          break;
        }

        case 'object-grabbed':
          if (grabbedObjects.size > 0) {
            setObjectGrabbed(true);
            setTimeout(() => nextStep(), 1500);
          }
          break;

        case 'object-released':
          // Check if object was grabbed and then released
          if (objectGrabbed && grabbedObjects.size === 0) {
            setObjectReleased(true);
            setTimeout(() => nextStep(), 2000);
          }
          break;
      }
    };

    const interval = setInterval(checkCondition, 100);
    return () => clearInterval(interval);
  }, [
    step,
    isActive,
    currentStep,
    webcamGranted,
    hands,
    gestures,
    objects,
    grabbedObjects,
    objectGrabbed,
    nextStep,
    getNearObjects,
  ]);

  if (!isActive || !step) {
    return null;
  }

  const isManualStep = step.successCondition === 'manual';

  return (
    <>
      {/* Spotlight effect */}
      {step.spotlightTarget && <Spotlight targetSelector={step.spotlightTarget} />}

      {/* Tutorial overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
        <div
          className={`
            pointer-events-auto bg-gray-900/95 text-white rounded-xl shadow-2xl border border-white/20
            max-w-md mx-4 p-6
            ${step.position === 'top' ? 'self-start mt-20' : ''}
            ${step.position === 'bottom' ? 'self-end mb-20' : ''}
          `}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">{step.title}</h2>
                <span className="text-xs text-gray-400">
                  Step {currentStep + 1} of 6
                </span>
              </div>
              <p className="text-sm text-gray-300">{step.description}</p>
            </div>

            {/* Instruction */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-sm">{step.instruction}</p>
            </div>

            {/* Status indicator for auto-advance steps */}
            {!isManualStep && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Waiting for completion...
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={skipTutorial}
                className="text-sm text-gray-400 hover:text-white transition underline"
              >
                Skip Tutorial
              </button>

              {isManualStep && (
                <button
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
