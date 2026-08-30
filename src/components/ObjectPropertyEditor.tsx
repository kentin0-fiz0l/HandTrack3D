import { useSceneStore } from '@/stores/sceneStore';
import type { ObjectProperties } from '@/types/scene.types';
import { useEffect, useRef } from 'react';

export function ObjectPropertyEditor() {
  const selectedObjectId = useSceneStore((state) => state.selectedObjectId);
  const objects = useSceneStore((state) => state.objects);
  const getObjectProperties = useSceneStore((state) => state.getObjectProperties);
  const setObjectProperty = useSceneStore((state) => state.setObjectProperty);
  const resetObjectProperties = useSceneStore((state) => state.resetObjectProperties);
  const selectObject = useSceneStore((state) => state.selectObject);
  const removeObject = useSceneStore((state) => state.removeObject);
  const panelRef = useRef<HTMLDivElement>(null);

  // ESC key handler to close panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedObjectId) {
        selectObject(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, selectObject]);

  // Click-outside handler to close panel
  useEffect(() => {
    if (!selectedObjectId) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        // Don't close if clicking on the 3D canvas (right-click to select another object)
        if ((event.target as HTMLElement).tagName === 'CANVAS') {
          return;
        }
        selectObject(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedObjectId, selectObject]);

  // If no object selected, show instructions
  if (!selectedObjectId) {
    return (
      <div className="absolute top-20 right-4 bg-gray-900/95 text-white p-4 rounded-lg shadow-xl max-w-xs">
        <h3 className="text-lg font-bold mb-2">Object Properties</h3>
        <p className="text-sm text-gray-300">Right-click an object to edit its properties.</p>
      </div>
    );
  }

  // Get selected object and properties
  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
  if (!selectedObject) {
    return null;
  }

  const properties = getObjectProperties(selectedObjectId);

  // Helper to update a property
  const updateProperty = <K extends keyof ObjectProperties>(key: K, value: ObjectProperties[K]) => {
    setObjectProperty(selectedObjectId, key, value);
  };

  return (
    <div ref={panelRef} className="absolute top-20 right-4 bg-gray-900/95 text-white p-4 rounded-lg shadow-xl max-w-sm max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">Object Properties</h3>
          <p className="text-xs text-gray-400">{selectedObject.type} ({selectedObject.id})</p>
        </div>
        <button
          onClick={() => selectObject(null)}
          className="text-gray-400 hover:text-white transition-colors"
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Physics Properties */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 text-blue-400">Physics</h4>

        <PropertySlider
          label="Mass"
          value={properties.mass}
          min={0.1}
          max={10}
          step={0.1}
          onChange={(val) => updateProperty('mass', val)}
        />

        <PropertySlider
          label="Bounciness"
          value={properties.restitution}
          min={0}
          max={1}
          step={0.05}
          onChange={(val) => updateProperty('restitution', val)}
        />

        <PropertySlider
          label="Friction"
          value={properties.friction}
          min={0}
          max={1}
          step={0.05}
          onChange={(val) => updateProperty('friction', val)}
        />

        <PropertySlider
          label="Linear Damping"
          value={properties.linearDamping}
          min={0}
          max={2}
          step={0.1}
          onChange={(val) => updateProperty('linearDamping', val)}
        />

        <PropertySlider
          label="Angular Damping"
          value={properties.angularDamping}
          min={0}
          max={2}
          step={0.1}
          onChange={(val) => updateProperty('angularDamping', val)}
        />

        <PropertySlider
          label="Gravity Scale"
          value={properties.gravityScale}
          min={0}
          max={2}
          step={0.1}
          onChange={(val) => updateProperty('gravityScale', val)}
        />
      </div>

      {/* Visual Properties */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 text-purple-400">Visual</h4>

        <PropertyColor
          label="Color"
          value={properties.color}
          onChange={(val) => updateProperty('color', val)}
        />

        <PropertySlider
          label="Scale"
          value={properties.scale}
          min={0.5}
          max={3}
          step={0.1}
          onChange={(val) => updateProperty('scale', val)}
        />

        <PropertySlider
          label="Opacity"
          value={properties.opacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(val) => updateProperty('opacity', val)}
        />

        <PropertySlider
          label="Emissive"
          value={properties.emissiveIntensity}
          min={0}
          max={1}
          step={0.05}
          onChange={(val) => updateProperty('emissiveIntensity', val)}
        />

        <PropertySlider
          label="Metalness"
          value={properties.metalness}
          min={0}
          max={1}
          step={0.05}
          onChange={(val) => updateProperty('metalness', val)}
        />

        <PropertySlider
          label="Roughness"
          value={properties.roughness}
          min={0}
          max={1}
          step={0.05}
          onChange={(val) => updateProperty('roughness', val)}
        />
      </div>

      {/* Interaction Properties */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 text-green-400">Interaction</h4>

        <PropertyToggle
          label="Static"
          value={properties.isStatic ?? false}
          onChange={(val) => updateProperty('isStatic', val)}
          description="Immune to gravity, cannot be grabbed"
        />

        <PropertyToggle
          label="Locked"
          value={properties.locked}
          onChange={(val) => updateProperty('locked', val)}
          description="Prevents grabbing"
        />

        <PropertyToggle
          label="Visible"
          value={properties.visible}
          onChange={(val) => updateProperty('visible', val)}
          description="Show/hide object"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <button
          onClick={() => resetObjectProperties(selectedObjectId)}
          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => {
            if (confirm('Delete this object?')) {
              removeObject(selectedObjectId);
              selectObject(null);
            }
          }}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// Reusable slider component
function PropertySlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-300">{label}</label>
        <span className="text-xs text-gray-400">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}

// Reusable color picker component
function PropertyColor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-3">
      <label className="text-xs text-gray-300 block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 rounded cursor-pointer border border-gray-600"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-gray-800 text-white px-2 py-1 rounded text-xs font-mono border border-gray-600"
          placeholder="#ffffff"
        />
      </div>
    </div>
  );
}

// Reusable toggle component
function PropertyToggle({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}) {
  return (
    <div className="mb-3">
      <label className="flex items-center justify-between cursor-pointer">
        <div>
          <span className="text-xs text-gray-300">{label}</span>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
        <div
          className={`relative w-11 h-6 rounded-full transition-colors ${
            value ? 'bg-blue-600' : 'bg-gray-700'
          }`}
          onClick={() => onChange(!value)}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              value ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
      </label>
    </div>
  );
}
