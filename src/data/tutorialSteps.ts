export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  instruction: string;
  successCondition: 'manual' | 'webcam' | 'hand-detected' | 'pinch-near-object' | 'object-grabbed' | 'object-released';
  spotlightTarget?: string; // CSS selector for spotlight
  position: 'center' | 'top' | 'bottom';
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 0,
    title: 'Welcome to HandTrack3D!',
    description: 'Learn to interact with 3D objects using your hands and webcam.',
    instruction: 'This tutorial will guide you through the basics of hand tracking and gesture control. Click "Next" to begin.',
    successCondition: 'manual',
    position: 'center',
  },
  {
    id: 1,
    title: 'Enable Your Webcam',
    description: 'HandTrack3D uses your webcam to track your hand movements.',
    instruction: 'Please allow webcam access when prompted by your browser. We only process video locally - nothing is sent to any server.',
    successCondition: 'webcam',
    position: 'top',
  },
  {
    id: 2,
    title: 'Show Your Hand',
    description: 'Position your hand in front of the camera.',
    instruction: 'Hold your hand up so the webcam can see it. You should see a colored cursor appear in the 3D scene when your hand is detected.',
    successCondition: 'hand-detected',
    spotlightTarget: '.gesture-status-widget',
    position: 'top',
  },
  {
    id: 3,
    title: 'Try the Pinch Gesture',
    description: 'Make a pinch gesture near the blue cube.',
    instruction: 'Bring your thumb and index finger together to make a "pinch" gesture. Move your hand near the blue cube until you see the grab range sphere turn green.',
    successCondition: 'pinch-near-object',
    position: 'bottom',
  },
  {
    id: 4,
    title: 'Grab and Move',
    description: 'While pinching, move the object around.',
    instruction: 'Keep your fingers pinched and move your hand to drag the object. Notice how the object follows your hand movement.',
    successCondition: 'object-grabbed',
    position: 'bottom',
  },
  {
    id: 5,
    title: 'Release the Object',
    description: 'Open your hand to let go.',
    instruction: 'Open your hand to release the object. The object will fall or stay where you placed it. Congratulations! You\'ve mastered the basics!',
    successCondition: 'object-released',
    position: 'bottom',
  },
];

export const getTutorialStep = (stepId: number): TutorialStep | undefined => {
  return tutorialSteps.find((step) => step.id === stepId);
};

export const getTotalSteps = (): number => {
  return tutorialSteps.length;
};
