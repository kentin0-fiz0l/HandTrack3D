import { useState } from 'react';
import { usePositioningStore } from '@/stores/positioningStore';
import type { RouterConfig } from '@/stores/positioningStore';

/**
 * Calibration wizard for setting up WiFi router positions
 */
export function CalibrationWizard() {
  const {
    isCalibrating,
    calibrationStep,
    routers,
    lastRssiData,
    addRouter,
    nextCalibrationStep,
    finishCalibration,
    cancelCalibration,
  } = usePositioningStore();

  // Form state for current router
  const [routerName, setRouterName] = useState('');
  const [selectedBssid, setSelectedBssid] = useState('');
  const [positionX, setPositionX] = useState('0');
  const [positionY, setPositionY] = useState('0');
  const [positionZ, setPositionZ] = useState('1.5'); // Default height (desk/router height)
  const [referenceRssi, setReferenceRssi] = useState('');

  if (!isCalibrating) {
    return null;
  }

  const handleAddRouter = () => {
    if (!routerName || !selectedBssid) {
      alert('Please enter router name and select a network');
      return;
    }

    const router: RouterConfig = {
      id: `router-${Date.now()}`,
      name: routerName,
      bssid: selectedBssid,
      position: [parseFloat(positionX), parseFloat(positionY), parseFloat(positionZ)],
      referenceRssi: referenceRssi ? parseFloat(referenceRssi) : undefined,
    };

    addRouter(router);
    nextCalibrationStep();

    // Reset form
    setRouterName('');
    setSelectedBssid('');
    setPositionX('0');
    setPositionY('0');
    setPositionZ('1.5');
    setReferenceRssi('');
  };

  const handleFinish = () => {
    if (routers.length < 3) {
      if (!confirm('You only have ' + routers.length + ' routers configured. Need at least 3 for positioning. Continue anyway?')) {
        return;
      }
    }
    finishCalibration();
  };

  // Find selected network details
  const selectedNetwork = lastRssiData.find((d) => d.bssid === selectedBssid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            WiFi Positioning Calibration
          </h2>
          <p className="text-gray-400 text-sm">
            Configure your WiFi routers for room-scale positioning
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(calibrationStep / 4) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-400">
              Step {calibrationStep} of 4
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded">
          <h3 className="font-semibold text-blue-400 mb-2">
            Step {calibrationStep}: Configure Router {calibrationStep}
          </h3>
          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
            <li>Select a WiFi network from the detected list below</li>
            <li>Measure and enter the router's position in your room (meters)</li>
            <li>Optionally: Stand 1 meter from the router and note the RSSI value for better accuracy</li>
          </ol>
        </div>

        {/* Detected Networks */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-2">
            Detected WiFi Networks:
          </h3>
          {lastRssiData.length === 0 ? (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-200">
              ⚠️ No networks detected. Make sure the companion app is running and connected.
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {lastRssiData.map((network) => (
                <label
                  key={network.bssid}
                  className={`block p-3 rounded border cursor-pointer transition-colors ${
                    selectedBssid === network.bssid
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="network"
                    value={network.bssid}
                    checked={selectedBssid === network.bssid}
                    onChange={(e) => setSelectedBssid(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-white font-medium">{network.ssid}</span>
                  <span className="ml-2 text-gray-400 text-xs">
                    ({network.bssid})
                  </span>
                  <span className="ml-2 text-gray-500 text-xs">
                    RSSI: {network.rssi} dBm
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Router Configuration Form */}
        {selectedBssid && (
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Router Name
              </label>
              <input
                type="text"
                value={routerName}
                onChange={(e) => setRouterName(e.target.value)}
                placeholder="e.g., Living Room Router"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  X Position (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={positionX}
                  onChange={(e) => setPositionX(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Y Position (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={positionY}
                  onChange={(e) => setPositionY(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Z Position (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={positionZ}
                  onChange={(e) => setPositionZ(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-3 bg-gray-800 border border-gray-700 rounded text-sm text-gray-400">
              <p className="mb-1">
                <strong>Position Guide:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Set room origin (0,0,0) at a corner or reference point</li>
                <li>X: left/right, Y: up/down, Z: forward/back (meters)</li>
                <li>Measure from floor level, router height is Z</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Reference RSSI at 1m (optional)
              </label>
              <input
                type="number"
                value={referenceRssi}
                onChange={(e) => setReferenceRssi(e.target.value)}
                placeholder={`Current: ${selectedNetwork?.rssi || 'N/A'} dBm`}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Stand 1 meter from the router and enter the RSSI value for calibration
              </p>
            </div>
          </div>
        )}

        {/* Configured Routers */}
        {routers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-2">
              Configured Routers ({routers.length}):
            </h3>
            <div className="space-y-2">
              {routers.map((router) => (
                <div
                  key={router.id}
                  className="p-3 bg-green-500/10 border border-green-500/30 rounded"
                >
                  <div className="text-white font-medium">{router.name}</div>
                  <div className="text-sm text-gray-400">
                    Position: ({router.position[0]}, {router.position[1]},{' '}
                    {router.position[2]})m
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={cancelCalibration}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Cancel
          </button>
          <div className="flex-1" />
          {calibrationStep < 4 && (
            <button
              onClick={handleAddRouter}
              disabled={!routerName || !selectedBssid}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              Add Router & Continue
            </button>
          )}
          {calibrationStep === 4 && (
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              Finish Calibration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
