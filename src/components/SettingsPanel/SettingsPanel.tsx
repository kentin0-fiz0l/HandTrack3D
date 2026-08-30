import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useHintsStore } from '@/stores/hintsStore';
import { usePositioningStore } from '@/stores/positioningStore';
import { SettingSlider } from '@/components/ui/SettingSlider';
import { SettingToggle } from '@/components/ui/SettingToggle';
import { SceneTemplates } from '@/components/SceneTemplates/SceneTemplates';
import { updateMediaPipeOptions } from '@/services/mediapipeService';
import { PRESETS } from '@/data/settingsPresets';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'scene' | 'gestures' | 'physics' | 'tracking' | 'visual' | 'positioning';

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('scene');
  const settings = useSettingsStore();
  const { resetTutorial } = useTutorialStore();
  const { resetHints } = useHintsStore();
  const positioning = usePositioningStore();

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Re-initialize MediaPipe when tracking settings change
  useEffect(() => {
    if (isOpen) return; // Don't reinitialize while panel is open
    updateMediaPipeOptions();
  }, [settings.maxHands, settings.detectionConfidence, settings.trackingConfidence, isOpen]);

  // Apply preset and reinitialize MediaPipe
  const handlePresetSelect = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      settings.applyPreset(preset);
      // MediaPipe will reinitialize via the useEffect above
    }
  };

  if (!isOpen) return null;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'scene', label: 'Scene' },
    { id: 'gestures', label: 'Gestures' },
    { id: 'physics', label: 'Physics' },
    { id: 'tracking', label: 'Tracking' },
    { id: 'visual', label: 'Visual' },
    { id: 'positioning', label: 'Positioning' },
  ];

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-gray-900 text-white rounded-lg w-full max-w-md mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
            <h2 className="text-lg font-semibold">Settings</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={settings.reset}
                className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded transition"
                title="Reset to defaults"
              >
                Reset to Defaults
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition"
                title="Close (ESC)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Preset Selector */}
          <div className="px-6 py-4 border-b border-white/20 bg-gray-800/30">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300">Quick Presets</h3>
              {settings.currentPreset === null && (
                <span className="px-2 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded">
                  Custom
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition
                    ${
                      settings.currentPreset === preset.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                  title={preset.description}
                >
                  <div className="text-lg mb-1">{preset.icon}</div>
                  <div className="text-xs">{preset.name}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Changes to individual settings will switch to Custom mode
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/20 bg-gray-800/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 px-4 py-3 text-sm font-medium transition
                  ${
                    activeTab === tab.id
                      ? 'text-primary-400 border-b-2 border-primary-400 bg-gray-800'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Scene Tab */}
            {activeTab === 'scene' && (
              <div>
                <SceneTemplates />
              </div>
            )}

            {/* Gestures Tab */}
            {activeTab === 'gestures' && (
              <div className="space-y-4">
            <SettingSlider
              label="Pinch Threshold"
              value={settings.pinchThreshold}
              min={0.03}
              max={0.08}
              step={0.01}
              onChange={(value) => settings.updateGestureSetting('pinchThreshold', value)}
              description="Lower = fingers must be closer to pinch"
            />

            <SettingSlider
              label="Finger Extension Angle"
              value={settings.fingerExtensionAngle}
              min={140}
              max={175}
              step={5}
              unit="°"
              onChange={(value) => settings.updateGestureSetting('fingerExtensionAngle', value)}
              description="Higher = stricter 'open hand' detection"
            />

            <SettingSlider
              label="Fist Curl Threshold"
              value={settings.fistCurlThreshold}
              min={0.10}
              max={0.20}
              step={0.01}
              onChange={(value) => settings.updateGestureSetting('fistCurlThreshold', value)}
              description="Lower = tighter fist required"
            />

            <SettingSlider
              label="Point Extension Angle"
              value={settings.pointExtensionAngle}
              min={140}
              max={175}
              step={5}
              unit="°"
              onChange={(value) => settings.updateGestureSetting('pointExtensionAngle', value)}
              description="Higher = stricter point gesture detection"
            />

            <SettingSlider
              label="Swipe Velocity Threshold"
              value={settings.swipeVelocityThreshold}
              min={0.3}
              max={1.0}
              step={0.1}
              onChange={(value) => settings.updateGestureSetting('swipeVelocityThreshold', value)}
              description="Minimum velocity to trigger swipe gesture"
            />

            <SettingSlider
              label="Swipe Cooldown"
              value={settings.swipeCooldown}
              min={300}
              max={1000}
              step={50}
              unit="ms"
              onChange={(value) => settings.updateGestureSetting('swipeCooldown', value)}
              description="Time between consecutive swipe detections"
            />
              </div>
            )}

            {/* Physics Tab */}
            {activeTab === 'physics' && (
              <div className="space-y-4">
            <SettingToggle
              label="Gravity Enabled"
              checked={settings.gravityEnabled}
              onChange={(checked) => settings.updatePhysicsSetting('gravityEnabled', checked)}
              description="Toggle physics simulation"
            />

            <SettingSlider
              label="Grab Range"
              value={settings.grabRange}
              min={1.0}
              max={3.0}
              step={0.1}
              onChange={(value) => settings.updatePhysicsSetting('grabRange', value)}
              description="How close hand must be to grab objects"
            />

            <SettingSlider
              label="Restitution (Bounciness)"
              value={settings.restitution}
              min={0.0}
              max={1.0}
              step={0.1}
              onChange={(value) => settings.updatePhysicsSetting('restitution', value)}
              description="0 = no bounce, 1 = perfect bounce"
            />

            <SettingSlider
              label="Friction"
              value={settings.friction}
              min={0.0}
              max={1.0}
              step={0.1}
              onChange={(value) => settings.updatePhysicsSetting('friction', value)}
              description="Surface friction coefficient"
            />
              </div>
            )}

            {/* Tracking Tab */}
            {activeTab === 'tracking' && (
              <div className="space-y-4">
            <SettingSlider
              label="Max Hands"
              value={settings.maxHands}
              min={1}
              max={2}
              step={1}
              onChange={(value) => settings.updateTrackingSetting('maxHands', value)}
              description="Number of hands to detect"
            />

            <SettingSlider
              label="Detection Confidence"
              value={settings.detectionConfidence}
              min={0.3}
              max={0.9}
              step={0.1}
              onChange={(value) => settings.updateTrackingSetting('detectionConfidence', value)}
              description="Higher = fewer false positives"
            />

            <SettingSlider
              label="Tracking Confidence"
              value={settings.trackingConfidence}
              min={0.3}
              max={0.9}
              step={0.1}
              onChange={(value) => settings.updateTrackingSetting('trackingConfidence', value)}
              description="Higher = more stable tracking"
            />
              </div>
            )}

            {/* Visual Tab */}
            {activeTab === 'visual' && (
              <div className="space-y-4">
            <SettingToggle
              label="Show Trails"
              checked={settings.showTrails}
              onChange={(checked) => settings.updateVisualSetting('showTrails', checked)}
              description="Display visual trails on hand cursors"
            />

            <SettingToggle
              label="Show Grab Range"
              checked={settings.showGrabRange}
              onChange={(checked) => settings.updateVisualSetting('showGrabRange', checked)}
              description="Show grab range visualization spheres around hands"
            />

            <SettingToggle
              label="Show Hand Skeleton"
              checked={settings.showHandSkeleton}
              onChange={(checked) => settings.updateVisualSetting('showHandSkeleton', checked)}
              description="Visualize hand landmarks and bones in 3D"
            />

            <SettingToggle
              label="Show Performance"
              checked={settings.showPerformance}
              onChange={(checked) => settings.updateVisualSetting('showPerformance', checked)}
              description="Display performance metrics dashboard"
            />

            <SettingToggle
              label="Show Webcam"
              checked={settings.showWebcam}
              onChange={(checked) => settings.updateVisualSetting('showWebcam', checked)}
              description="Show debug webcam preview"
            />

            {/* Replay Tutorial Button */}
            <div className="pt-4 border-t border-white/20 space-y-3">
              <button
                onClick={() => {
                  resetTutorial();
                  onClose();
                }}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
              >
                🎓 Replay Tutorial
              </button>
              <p className="text-xs text-gray-500">
                Restart the interactive tutorial from the beginning
              </p>

              <button
                onClick={() => {
                  resetHints();
                  onClose();
                }}
                className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition font-medium"
              >
                💡 Reset Hints
              </button>
              <p className="text-xs text-gray-500">
                Clear all shown hints to see them again
              </p>
            </div>
              </div>
            )}

            {/* Positioning Tab */}
            {activeTab === 'positioning' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded">
                  <h4 className="font-semibold text-blue-400 mb-2">WiFi Room-Scale Positioning</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    Combine WiFi positioning with hand tracking for room-scale spatial awareness.
                  </p>
                  <p className="text-xs text-gray-500">
                    Requires WiFi companion app running on this device.
                  </p>
                </div>

                <SettingToggle
                  label="Enable Positioning"
                  checked={positioning.enablePositioning}
                  onChange={(checked) => positioning.updateSetting('enablePositioning', checked)}
                  description="Enable WiFi positioning system"
                />

                {positioning.enablePositioning && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Positioning Mode
                      </label>
                      <select
                        value={positioning.positioningMode}
                        onChange={(e) => positioning.setPositioningMode(e.target.value as any)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="disabled">Disabled</option>
                        <option value="wifi-only">WiFi Only</option>
                        <option value="fusion">Sensor Fusion (WiFi + Camera)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {positioning.positioningMode === 'wifi-only' &&
                          'Use only WiFi RSSI for positioning (±2-5m accuracy)'}
                        {positioning.positioningMode === 'fusion' &&
                          'Combine WiFi and camera tracking for best accuracy'}
                        {positioning.positioningMode === 'disabled' && 'Positioning disabled'}
                      </p>
                    </div>

                    <SettingSlider
                      label="Update Interval"
                      value={positioning.updateInterval}
                      min={100}
                      max={2000}
                      step={100}
                      unit="ms"
                      onChange={(value) => positioning.updateSetting('updateInterval', value)}
                      description="How often to update position (lower = more responsive)"
                    />

                    <div className="pt-4 border-t border-white/20 space-y-3">
                      <button
                        onClick={() => {
                          positioning.startCalibration();
                          onClose();
                        }}
                        disabled={!positioning.isConnected}
                        className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition font-medium"
                      >
                        📍 Calibrate Routers ({positioning.routers.length}/4)
                      </button>
                      <p className="text-xs text-gray-500">
                        {positioning.isConnected
                          ? 'Configure router positions for room-scale tracking'
                          : '⚠️ Connect to companion app first'}
                      </p>

                      {positioning.routers.length > 0 && (
                        <>
                          <button
                            onClick={() => {
                              if (
                                confirm('This will delete all configured routers. Continue?')
                              ) {
                                positioning.setRouters([]);
                              }
                            }}
                            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
                          >
                            🗑️ Clear All Routers
                          </button>
                        </>
                      )}
                    </div>

                    {/* Router List */}
                    {positioning.routers.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-300">
                          Configured Routers:
                        </h4>
                        {positioning.routers.map((router) => (
                          <div
                            key={router.id}
                            className="p-3 bg-gray-800 border border-gray-700 rounded"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-white font-medium">{router.name}</div>
                                <div className="text-xs text-gray-400">
                                  Position: ({router.position[0].toFixed(1)},{' '}
                                  {router.position[1].toFixed(1)}, {router.position[2].toFixed(1)})m
                                </div>
                              </div>
                              <button
                                onClick={() => positioning.removeRouter(router.id)}
                                className="text-red-400 hover:text-red-300 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
