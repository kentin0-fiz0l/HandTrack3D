import { useState, useEffect } from 'react';
import { useTutorialStore, shouldShowTutorial } from '@/stores/tutorialStore';
import { TUTORIAL_STEPS, getTotalSteps } from '@/data/tutorialSteps';
import { ProgressBar } from './ProgressBar';
import { Spotlight } from './Spotlight';

export function TutorialOverlay() {
  const [visible, setVisible] = useState(false);
  const tutorialState = useTutorialStore();
  const currentStep = tutorialState.currentStep;
  const step = TUTORIAL_STEPS[currentStep];

  // Check if tutorial should be shown on mount
  useEffect(() => {
    const shouldShow = shouldShowTutorial();
    setVisible(shouldShow && !tutorialState.dismissed && !tutorialState.completed);
  }, []);

  // Auto-advance when success condition is met
  useEffect(() => {
    if (!step || !step.successCondition) return;

    const conditionMet = step.successCondition({
      gestureDetected: tutorialState.gestureDetected,
      nearObject: tutorialState.nearObject,
      objectGrabbed: tutorialState.objectGrabbed,
      handDetected: tutorialState.handDetected,
      webcamEnabled: tutorialState.webcamEnabled,
    });

    if (conditionMet) {
      // Add delay so user can see success state
      setTimeout(() => {
        if (currentStep === TUTORIAL_STEPS.length - 1) {
          // Final step - complete tutorial
          handleComplete();
        } else {
          // Advance to next step
          tutorialState.advanceStep();
        }
      }, 1000);
    }
  }, [step, tutorialState, currentStep]);

  const handleNext = () => {
    if (currentStep === TUTORIAL_STEPS.length - 1) {
      handleComplete();
    } else {
      tutorialState.advanceStep();
    }
  };

  const handleDismiss = () => {
    tutorialState.dismissTutorial();
    setVisible(false);
  };

  const handleComplete = () => {
    tutorialState.completeTutorial();
    setVisible(false);
  };

  if (!visible || !step) return null;

  return (
    <>
      {/* Spotlight effect */}
      {step.highlight && <Spotlight target={step.highlight} />}

      {/* Tutorial card */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-gray-900/95 rounded-xl p-6 max-w-md mx-4 border-2 border-blue-500/30 shadow-2xl pointer-events-auto backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {currentStep + 1}
                </div>
                <h2 className="text-xl font-bold text-white">{step.title}</h2>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Skip Tutorial
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-300 mb-4 leading-relaxed">{step.description}</p>

          {/* Help image (if provided) */}
          {step.helpImage && (
            <div className="mb-4 rounded-lg overflow-hidden bg-gray-800 p-4">
              <img 
                src={step.helpImage} 
                alt="Tutorial help" 
                className="w-full h-auto rounded"
                onError={(e) => {
                  // Hide image if it fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Progress bar */}
          <div className="mb-4">
            <ProgressBar current={currentStep + 1} total={getTotalSteps()} />
          </div>

          {/* Action button (for click-continue steps) */}
          {step.action === 'click-continue' && (
            <button
              onClick={handleNext}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Continue
            </button>
          )}

          {/* Waiting indicator (for auto-advance steps) */}
          {step.action !== 'click-continue' && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-sm">
                  {step.action === 'wait-for-webcam' && 'Waiting for camera permission...'}
                  {step.action === 'wait-for-hand-detected' && 'Waiting for hand detection...'}
                  {step.action === 'wait-for-condition' && 'Try it out!'}
                </span>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              💡 Tip: You can replay this tutorial anytime from the Settings panel
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
