import { useState } from 'react';
import { useSceneStore } from '@/stores/sceneStore';
import { useHintsStore } from '@/stores/hintsStore';
import type { SceneObject } from '@/types/scene.types';

type ObjectType = SceneObject['type'];

const OBJECT_TYPES: { type: ObjectType; label: string }[] = [
  { type: 'box', label: 'Box' },
  { type: 'sphere', label: 'Sphere' },
  { type: 'torus', label: 'Torus' },
  { type: 'cylinder', label: 'Cylinder' },
  { type: 'cone', label: 'Cone' },
  { type: 'capsule', label: 'Capsule' },
];

const PRESET_COLORS = [
  { hex: '#3b82f6', label: 'Blue' },
  { hex: '#10b981', label: 'Green' },
  { hex: '#f59e0b', label: 'Amber' },
  { hex: '#ef4444', label: 'Red' },
  { hex: '#8b5cf6', label: 'Purple' },
  { hex: '#ec4899', label: 'Pink' },
  { hex: '#06b6d4', label: 'Cyan' },
  { hex: '#f97316', label: 'Orange' },
];

interface ObjectSpawnerProps {
  onSelectionChange?: (type: ObjectType, color: string, size: number) => void;
}

export function ObjectSpawner({ onSelectionChange }: ObjectSpawnerProps = {}) {
  const [selectedType, setSelectedType] = useState<ObjectType>('box');
  const [size, setSize] = useState(1.0);
  const [color, setColor] = useState('#3b82f6');
  const addObject = useSceneStore((state) => state.addObject);
  const buildMode = useSceneStore((state) => state.buildMode);
  const toggleBuildMode = useSceneStore((state) => state.toggleBuildMode);
  const incrementObjectsSpawned = useHintsStore((state) => state.incrementObjectsSpawned);

  const handleTypeChange = (type: ObjectType) => {
    setSelectedType(type);
    onSelectionChange?.(type, color, size);
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    onSelectionChange?.(selectedType, color, newSize);
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onSelectionChange?.(selectedType, newColor, size);
  };

  const handleSpawn = () => {
    // Generate unique ID
    const timestamp = Date.now();
    const id = `${selectedType}-${timestamp}`;

    // Randomize position slightly to avoid stacking
    const randomOffset = () => (Math.random() - 0.5) * 1.5;
    const position: [number, number, number] = [
      randomOffset(), // x: -0.75 to 0.75
      2.5 + randomOffset(), // y: above eye level, 2 to 3 units high
      -4 + randomOffset(), // z: in front of camera, slight variation
    ];

    const newObject: SceneObject = {
      id,
      type: selectedType,
      position,
      rotation: [0, 0, 0],
      scale: size,
      color,
    };

    addObject(newObject);
    incrementObjectsSpawned();
  };

  return (
    <div className="absolute top-20 right-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-lg shadow-xl max-w-xs z-20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Object Spawner</h3>
        <button
          onClick={toggleBuildMode}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            buildMode
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          {buildMode ? 'Build Mode: ON' : 'Build Mode: OFF'}
        </button>
      </div>

      {buildMode && (
        <div className="mb-3 p-2 bg-green-900/30 border border-green-600/50 rounded text-xs text-green-200">
          Click anywhere to place objects. Press <strong>B</strong> to exit.
        </div>
      )}

      {/* Object Type Selection */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-300 mb-2">Object Type</label>
        <div className="grid grid-cols-3 gap-2">
          {OBJECT_TYPES.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-3 py-2 text-xs rounded transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Size Slider */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-300 mb-2">
          Size: {size.toFixed(1)}
        </label>
        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={size}
          onChange={(e) => handleSizeChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Color Picker */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-300 mb-2">Color</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {PRESET_COLORS.map(({ hex, label }) => (
            <button
              key={hex}
              onClick={() => handleColorChange(hex)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                color === hex ? 'border-white scale-110' : 'border-gray-600 hover:scale-105'
              }`}
              style={{ backgroundColor: hex }}
              aria-label={label}
              title={label}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-12 h-8 rounded cursor-pointer bg-gray-700 border border-gray-600"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
            placeholder="#3b82f6"
          />
        </div>
      </div>

      {/* Spawn Button */}
      {!buildMode && (
        <button
          onClick={handleSpawn}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
        >
          Spawn Object
        </button>
      )}

      <p className="mt-3 text-xs text-gray-400 text-center">
        {buildMode
          ? 'Click in the scene to place objects'
          : 'Objects spawn in front of the camera'}
      </p>
    </div>
  );
}
