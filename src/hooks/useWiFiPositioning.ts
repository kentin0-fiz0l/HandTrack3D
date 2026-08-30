import { useEffect, useRef, useCallback } from 'react';
import { WiFiCompanionClient } from '@/services/positioning/WiFiCompanionClient';
import { usePositioningStore } from '@/stores/positioningStore';
import { rssiToDistance } from '@/utils/rssiToDistance';
import { trilaterate } from '@/utils/trilateration';
import * as THREE from 'three';

/**
 * Hook to manage WiFi positioning connection and updates
 */
export function useWiFiPositioning() {
  const clientRef = useRef<WiFiCompanionClient | null>(null);
  const {
    enablePositioning,
    positioningMode,
    routers,
    updateInterval,
    setConnected,
    setConnectionError,
    updateRssiData,
    updatePosition,
  } = usePositioningStore();

  /**
   * Calculate position from RSSI data using trilateration
   */
  const calculatePosition = useCallback(
    (rssiData: Array<{ bssid: string; rssi: number; ssid: string }>) => {
      // Need at least 3 routers for 2D positioning, 4 for 3D
      if (routers.length < 3) {
        console.warn('[WiFi Positioning] Need at least 3 configured routers');
        return;
      }

      // Match RSSI data to configured routers
      const measurements: Array<{
        router: typeof routers[0];
        distance: number;
      }> = [];

      for (const router of routers) {
        const rssiEntry = rssiData.find((d) => d.bssid === router.bssid);
        if (rssiEntry) {
          // Convert RSSI to distance using path loss model
          const distance = rssiToDistance(
            rssiEntry.rssi,
            router.referenceRssi || -40, // Default reference RSSI at 1m
            2.5 // Path loss exponent (typical for indoor)
          );
          measurements.push({ router, distance });
        }
      }

      // Need at least 3 measurements for positioning
      if (measurements.length < 3) {
        console.warn(
          `[WiFi Positioning] Only ${measurements.length} routers visible, need 3+`
        );
        return;
      }

      // Prepare data for trilateration
      const routerPositions = measurements.map(
        (m) => new THREE.Vector3(...m.router.position)
      );
      const distances = measurements.map((m) => m.distance);

      // Calculate position using trilateration
      const result = trilaterate(routerPositions, distances);

      if (result) {
        const position: [number, number, number] = [
          result.position.x,
          result.position.y,
          result.position.z,
        ];
        updatePosition(position, result.accuracy);

        console.log(
          `[WiFi Positioning] Position: (${position[0].toFixed(2)}, ${position[1].toFixed(2)}, ${position[2].toFixed(2)}) ±${result.accuracy.toFixed(2)}m`
        );
      } else {
        console.warn('[WiFi Positioning] Trilateration failed');
      }
    },
    [routers, updatePosition]
  );

  /**
   * Handle RSSI data from companion app
   */
  const handleRssiUpdate = useCallback(
    (data: Array<{ bssid: string; rssi: number; ssid: string }>) => {
      // Update store with raw data
      updateRssiData(data);

      // Calculate position if in wifi-only or fusion mode
      if (
        positioningMode !== 'disabled' &&
        (positioningMode === 'wifi-only' || positioningMode === 'fusion')
      ) {
        calculatePosition(data);
      }
    },
    [positioningMode, updateRssiData, calculatePosition]
  );

  /**
   * Connect to WiFi companion app
   */
  const connect = useCallback(() => {
    if (clientRef.current) {
      console.warn('[WiFi Positioning] Already connected');
      return;
    }

    try {
      const client = new WiFiCompanionClient('ws://localhost:8080');

      // Connection events
      client.onConnect(() => {
        console.log('[WiFi Positioning] Connected to companion app');
        setConnected(true);
        setConnectionError(null);
      });

      client.onDisconnect(() => {
        console.log('[WiFi Positioning] Disconnected from companion app');
        setConnected(false);
      });

      client.onError((error) => {
        console.error('[WiFi Positioning] Error:', error);
        setConnectionError(error.message);
      });

      // RSSI data events
      client.onRssiUpdate((data) => {
        handleRssiUpdate(data);
      });

      // Connect
      client.connect();
      clientRef.current = client;
    } catch (error) {
      console.error('[WiFi Positioning] Failed to create client:', error);
      setConnectionError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }, [setConnected, setConnectionError, handleRssiUpdate]);

  /**
   * Disconnect from WiFi companion app
   */
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
      setConnected(false);
    }
  }, [setConnected]);

  /**
   * Auto-connect/disconnect based on settings
   */
  useEffect(() => {
    if (enablePositioning && positioningMode !== 'disabled') {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enablePositioning, positioningMode, connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected: clientRef.current !== null,
  };
}
