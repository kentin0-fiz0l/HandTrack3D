/**
 * Tutorial Steps for HandTrack3D
 * 
 * 6-step interactive tutorial that guides new users through core interactions.
 * Each step has a success condition that auto-advances when met.
 */

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  action: 'click-continue' | 'wait-for-webcam' | 'wait-for-hand-detected' | 'wait-for-condition';
  highlight: string | null;
  helpImage?: string;
  successCondition?: (state: {
    gestureDetected: string | null;
    nearObject: boolean;
    objectGrabbed: boolean;
    handDetected: boolean;
    webcamEnabled: boolean;
  }) => boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to HandTrack3D',
    description: 'Control 3D objects with your hands using just your webcam. No special hardware needed! Let\'s learn the basics.',
    action: 'click-continue',
    highlight: null,
  },
  
  {
    id: 'webcam',
    title: 'Allow Webcam Access',
    description: 'We need your camera to track your hands. Click "Allow" when your browser asks for camera permission.',
    action: 'wait-for-webcam',
    highlight: null,
    successCondition: (state) => state.webcamEnabled,
  },
  
  {
    id: 'show-hand',
    title: 'Show Your Hand',
    description: 'Hold your hand in front of the camera with your palm facing forward. You\'ll see a colored cursor appear in the 3D scene.',
    action: 'wait-for-condition',
    highlight: null,
    helpImage: '/tutorial/hand-position.png',
    successCondition: (state) => state.handDetected,
  },
  
  {
    id: 'pinch',
    title: 'Pinch Gesture',
    description: 'Touch your thumb and index finger together to make a pinch gesture. Move your hand near one of the cubes.',
    action: 'wait-for-condition',
    highlight: 'nearest-object',
    successCondition: (state) => state.gestureDetected === 'pinch' && state.nearObject,
  },
  
  {
    id: 'grab',
    title: 'Grab and Move',
    description: 'While pinching near an object, it will attach to your hand. Move your hand around to drag the object in 3D space!',
    action: 'wait-for-condition',
    highlight: 'grabbed-object',
    successCondition: (state) => state.objectGrabbed,
  },
  
  {
    id: 'release',
    title: 'Release the Object',
    description: 'Open your hand (spread your fingers apart) to release the object. It will fall back down with realistic physics!',
    action: 'wait-for-condition',
    highlight: null,
    successCondition: (state) => state.gestureDetected === 'open' && !state.objectGrabbed,
  },
];

/**
 * Get tutorial step by ID
 */
export function getTutorialStep(id: string): TutorialStep | undefined {
  return TUTORIAL_STEPS.find(step => step.id === id);
}

/**
 * Get tutorial step by index
 */
export function getTutorialStepByIndex(index: number): TutorialStep | undefined {
  return TUTORIAL_STEPS[index];
}

/**
 * Get total number of tutorial steps
 */
export function getTotalSteps(): number {
  return TUTORIAL_STEPS.length;
}
