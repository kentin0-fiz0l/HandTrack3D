import { useState } from 'react';
import { HandTrackingCanvas } from './components/HandTrackingCanvas/HandTrackingCanvas';
import { WebcamFeed } from './components/WebcamFeed/WebcamFeed';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  const [showPanel, setShowPanel] = useState(true);

  useKeyboardShortcuts({
    onTogglePanel: () => setShowPanel((prev) => !prev),
  });

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <h1 className="text-2xl font-bold text-white">HandTrack3D</h1>
        <p className="text-sm text-gray-300">Webcam-Based 3D Hand Interaction</p>
      </div>

      {/* Control Panel */}
      {showPanel && <ControlPanel />}

      {/* 3D Canvas */}
      <HandTrackingCanvas />

      {/* Webcam Feed */}
      <WebcamFeed showPreview={true} />

      {/* Instructions panel */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg text-sm max-w-xs z-30">
        <h3 className="font-semibold mb-2">How to Use</h3>
        <ul className="space-y-1 text-xs text-gray-300">
          <li>• <strong>Pinch</strong> near object to grab</li>
          <li>• <strong>Move hand</strong> to drag object</li>
          <li>• <strong>Open hand</strong> to release</li>
          <li>• Press <strong>H</strong> to toggle status panel</li>
        </ul>
        <div className="mt-3 pt-3 border-t border-white/20">
          <h4 className="font-semibold mb-1 text-xs">Camera Controls</h4>
          <ul className="space-y-1 text-xs text-gray-400">
            <li>• Left click + drag: Rotate</li>
            <li>• Right click + drag: Pan</li>
            <li>• Scroll: Zoom</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
