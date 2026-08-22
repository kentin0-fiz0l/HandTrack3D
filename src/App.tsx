import { useState } from 'react';
import { HandTrackingCanvas } from './components/HandTrackingCanvas/HandTrackingCanvas';
import { WebcamFeed } from './components/WebcamFeed/WebcamFeed';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel';
import { ObjectSpawner } from './components/ObjectSpawner/ObjectSpawner';
import { PerformanceMonitor } from './components/PerformanceMonitor/PerformanceMonitor';
import { GestureStatusWidget } from './components/GestureStatusWidget/GestureStatusWidget';
import { ObjectPropertyEditor } from './components/ObjectPropertyEditor';
import { HintsManager } from './components/Hints';
import { TutorialOverlay } from './components/Tutorial/TutorialOverlay';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useSceneStore } from './stores/sceneStore';
import type { SceneObject } from './types/scene.types';

function App() {
  const [showPanel, setShowPanel] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedType, setSelectedType] = useState<SceneObject['type']>('box');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [selectedSize, setSelectedSize] = useState(1.0);
  const toggleBuildMode = useSceneStore((state) => state.toggleBuildMode);

  const handleSelectionChange = (
    type: SceneObject['type'],
    color: string,
    size: number
  ) => {
    setSelectedType(type);
    setSelectedColor(color);
    setSelectedSize(size);
  };

  useKeyboardShortcuts({
    onTogglePanel: () => setShowPanel((prev) => !prev),
    onToggleSettings: () => setShowSettings((prev) => !prev),
    onToggleBuildMode: toggleBuildMode,
  });

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">HandTrack3D</h1>
          <p className="text-sm text-gray-300">Webcam-Based 3D Hand Interaction</p>
        </div>
        {/* Settings Button */}
        <button
          onClick={() => setShowSettings((prev) => !prev)}
          className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
          aria-label="Toggle Settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {/* Control Panel */}
      {showPanel && <ControlPanel />}

      {/* Settings Panel */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Object Spawner */}
      <ObjectSpawner onSelectionChange={handleSelectionChange} />

      {/* Performance Monitor */}
      <PerformanceMonitor />

      {/* Gesture Status Widget */}
      <GestureStatusWidget />

      {/* Object Property Editor */}
      <ObjectPropertyEditor />

      {/* Hints Manager */}
      <HintsManager />

      {/* Tutorial Overlay */}
      <TutorialOverlay />

      {/* 3D Canvas */}
      <HandTrackingCanvas
        selectedType={selectedType}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
      />

      {/* Webcam Feed */}
      <WebcamFeed showPreview={true} />

      {/* Instructions panel */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg text-sm max-w-xs z-30">
        <h3 className="font-semibold mb-2">How to Use</h3>
        <ul className="space-y-1 text-xs text-gray-300">
          <li>• <strong>Pinch</strong> near object to grab</li>
          <li>• <strong>Move hand</strong> to drag object</li>
          <li>• <strong>Open hand</strong> to release</li>
          <li>• <strong>Right-click</strong> object to edit properties</li>
          <li>• Press <strong>H</strong> to toggle status panel</li>
          <li>• Press <strong>S</strong> to open settings</li>
          <li>• Press <strong>B</strong> to toggle build mode</li>
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
