import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { SettingSlider } from '@/components/ui/SettingSlider';
import { SettingToggle } from '@/components/ui/SettingToggle';
import { SceneTemplates } from '@/components/SceneTemplates/SceneTemplates';
import { updateMediaPipeOptions } from '@/services/mediapipeService';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'scene' | 'gestures' | 'physics' | 'tracking' | 'visual';

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('scene');
  const settings = useSettingsStore();

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

  if (!isOpen) return null;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'scene', label: 'Scene' },
    { id: 'gestures', label: 'Gestures' },
    { id: 'physics', label: 'Physics' },
    { id: 'tracking', label: 'Tracking' },
    { id: 'visual', label: 'Visual' },
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
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
