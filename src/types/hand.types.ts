export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export type HandLandmarks = HandLandmark[];

export interface Hand {
  id: string;
  handedness: 'Left' | 'Right';
  landmarks: HandLandmarks;
  worldLandmarks: HandLandmarks;
}

export interface HandState {
  hands: Hand[];
  fps: number;
  lastUpdate: number;
}
