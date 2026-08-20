export type GestureType = 'none' | 'pinch' | 'open' | 'fist';

export interface HandGesture {
  handId: string;
  gesture: GestureType;
  confidence: number;
}
