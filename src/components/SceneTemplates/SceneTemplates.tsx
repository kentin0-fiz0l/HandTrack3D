import { useState } from 'react';
import { useSceneStore } from '@/stores/sceneStore';
import { sceneTemplates, getTemplateById, type SceneTemplate } from '@/data/sceneTemplates';
import {
  loadTemplate,
  exportSceneToFile,
  importSceneFromFile,
  saveSceneToStorage,
  getCustomScenes,
  deleteCustomScene,
  type SavedScene,
} from '@/services/sceneManager';

export function SceneTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('playground');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [customScenes, setCustomScenes] = useState<SavedScene[]>(getCustomScenes());

  const objects = useSceneStore((state) => state.objects);
  const setObjects = useSceneStore((state) => state.setObjects);
  const clearObjects = useSceneStore((state) => state.clearObjects);

  const handleLoadTemplate = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (!template) return;

    const newObjects = loadTemplate(template);
    setObjects(newObjects);
    setSelectedTemplate(templateId);
  };

  const handleLoadCustomScene = (scene: SavedScene) => {
    setObjects(scene.objects);
  };

  const handleSaveToStorage = () => {
    if (!saveName.trim()) return;

    saveSceneToStorage(saveName, saveDescription, objects);
    setCustomScenes(getCustomScenes());
    setShowSaveDialog(false);
    setSaveName('');
    setSaveDescription('');
  };

  const handleDeleteCustomScene = (id: string) => {
    deleteCustomScene(id);
    setCustomScenes(getCustomScenes());
  };

  const handleExport = () => {
    const name = prompt('Enter scene name:', 'My Scene');
    if (!name) return;

    const description = prompt('Enter description (optional):', '');
    exportSceneToFile(name, description || '', objects);
  };

  const handleImport = async () => {
    try {
      const scene = await importSceneFromFile();
      setObjects(scene.objects);
    } catch (error) {
      console.error('Failed to import scene:', error);
      alert('Failed to import scene. Please check the file format.');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all objects from the scene?')) {
      clearObjects();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Scene Templates</h3>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {sceneTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleLoadTemplate(template.id)}
              className={`p-3 rounded-lg text-left transition-all ${
                selectedTemplate === template.id
                  ? 'bg-blue-600 text-white border-2 border-blue-400'
                  : 'bg-gray-700/80 text-gray-200 hover:bg-gray-600/80 border-2 border-transparent'
              }`}
            >
              <div className="font-semibold text-xs mb-1">{template.name}</div>
              <div className="text-xs opacity-80">{template.description}</div>
              <div className="text-xs mt-1 opacity-60">{template.objects.length} objects</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Saved Scenes */}
      {customScenes.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-300 mb-2">Saved Scenes</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {customScenes.map((scene) => (
              <div
                key={scene.id}
                className="flex items-center justify-between p-2 bg-gray-700/60 rounded text-xs"
              >
                <button
                  onClick={() => handleLoadCustomScene(scene)}
                  className="flex-1 text-left hover:text-blue-400 transition-colors"
                >
                  <div className="font-medium">{scene.name}</div>
                  {scene.description && (
                    <div className="text-gray-400 text-xs">{scene.description}</div>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteCustomScene(scene.id)}
                  className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                  aria-label="Delete"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition-colors"
        >
          Save Current Scene
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={handleImport}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors"
          >
            Import JSON
          </button>
        </div>

        <button
          onClick={handleReset}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
        >
          Reset Scene
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Save Scene</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Scene Name *
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  placeholder="My Awesome Scene"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none"
                  placeholder="A brief description of your scene..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveToStorage}
                  disabled={!saveName.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveName('');
                    setSaveDescription('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
