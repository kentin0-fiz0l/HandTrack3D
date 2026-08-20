import { HandTrackingCanvas } from './components/HandTrackingCanvas/HandTrackingCanvas';
import { WebcamFeed } from './components/WebcamFeed/WebcamFeed';

function App() {
  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <h1 className="text-2xl font-bold text-white">HandTrack3D</h1>
        <p className="text-sm text-gray-300">Webcam-Based 3D Hand Interaction</p>
      </div>

      {/* 3D Canvas */}
      <HandTrackingCanvas />

      {/* Webcam Feed */}
      <WebcamFeed showPreview={true} />

      {/* Info panel */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg text-sm max-w-xs">
        <h3 className="font-semibold mb-2">Controls</h3>
        <ul className="space-y-1 text-xs text-gray-300">
          <li>• Left click + drag: Rotate camera</li>
          <li>• Right click + drag: Pan camera</li>
          <li>• Scroll: Zoom in/out</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
