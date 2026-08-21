export type GestureType =
  | 'none'
  | 'pinch'
  | 'open'
  | 'fist'
  | 'point'
  | 'swipeLeft'
  | 'swipeRight'
  | 'swipeUp'
  | 'swipeDown';

export interface HandGesture {
  handId: string;
  gesture: GestureType;
  confidence: number;
}

export interface SwipeDetectionState {
  positionHistory: { x: number; y: number; z: number; timestamp: number }[];
  lastSwipeTimestamp: number;
}
