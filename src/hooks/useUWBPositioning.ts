/**
 * UWB Positioning Hook
 *
 * Connects to UWB companion service via WebSocket and receives
 * high-accuracy position updates (±10-30cm) at 10Hz.
 *
 * Mock implementation: Connects to tools/uwb-companion/server.js
 * Real hardware: Would connect to UWB bridge service (DWM1001 serial → WebSocket)
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * UWB anchor configuration
 */
export interface UWBAnchor {
  id: number; // Anchor hardware ID
  position: [number, number, number]; // Room coordinates (meters)
  name: string; // Human-readable name
}

/**
 * UWB position measurement
 */
export interface UWBPosition {
  x: number; // Room X coordinate (meters)
  y: number; // Room Y coordinate (meters)
  z: number; // Room Z coordinate (meters)
  quality: number; // Quality metric 0-100 (100 = best)
  anchorsUsed: number; // Number of anchors in range
  timestamp: number; // Measurement timestamp (ms)
}

/**
 * UWB connection state
 */
export interface UWBState {
  isConnected: boolean;
  position: THREE.Vector3 | null;
  quality: number;
  anchorsUsed: number;
  anchors: UWBAnchor[];
  error: string | null;
  updateRate: number; // Actual update rate in Hz
}

/**
 * Hook configuration
 */
export interface UseUWBPositioningOptions {
  wsUrl?: string; // WebSocket URL (default: ws://localhost:8081)
  autoConnect?: boolean; // Auto-connect on mount (default: true)
  onPositionUpdate?: (position: UWBPosition) => void;
}

/**
 * Connect to UWB positioning service
 *
 * @param options - Configuration options
 * @returns UWB state and connection controls
 *
 * @example
 * ```typescript
 * const { position, quality, isConnected, connect, disconnect } = useUWBPositioning({
 *   wsUrl: 'ws://localhost:8081',
 *   onPositionUpdate: (pos) => console.log('UWB update:', pos)
 * });
 * ```
 */
export function useUWBPositioning(
  options: UseUWBPositioningOptions = {}
): UWBState & {
  connect: () => void;
  disconnect: () => void;
} {
  const {
    wsUrl = 'ws://localhost:8081',
    autoConnect = true,
    onPositionUpdate,
  } = options;

  // WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [position, setPosition] = useState<THREE.Vector3 | null>(null);
  const [quality, setQuality] = useState(0);
  const [anchorsUsed, setAnchorsUsed] = useState(0);
  const [anchors, setAnchors] = useState<UWBAnchor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updateRate, setUpdateRate] = useState(0);

  // Update rate tracking
  const lastUpdateRef = useRef(0);
  const updateCountRef = useRef(0);
  const rateWindowRef = useRef<number[]>([]);

  /**
   * Calculate actual update rate (sliding window average)
   */
  const calculateUpdateRate = (): void => {
    const now = Date.now();
    if (lastUpdateRef.current > 0) {
      const delta = now - lastUpdateRef.current;
      const instantRate = 1000 / delta; // Hz
      rateWindowRef.current.push(instantRate);

      // Keep last 10 samples
      if (rateWindowRef.current.length > 10) {
        rateWindowRef.current.shift();
      }

      // Average
      const avgRate =
        rateWindowRef.current.reduce((sum, r) => sum + r, 0) /
        rateWindowRef.current.length;
      setUpdateRate(Math.round(avgRate * 10) / 10); // Round to 1 decimal
    }
    lastUpdateRef.current = now;
    updateCountRef.current++;
  };

  /**
   * Handle WebSocket messages
   */
  const handleMessage = (event: MessageEvent): void => {
    try {
      const message = JSON.parse(event.data);

      if (message.type === 'anchors') {
        // Anchor configuration
        const anchorData = message.data as UWBAnchor[];
        setAnchors(anchorData);
        console.log(
          `[UWB] Received ${anchorData.length} anchor configurations`
        );
      } else if (message.type === 'position') {
        // Position update
        const pos = message.data as UWBPosition;
        const vec = new THREE.Vector3(pos.x, pos.y, pos.z);

        setPosition(vec);
        setQuality(pos.quality);
        setAnchorsUsed(pos.anchorsUsed);
        calculateUpdateRate();

        // Callback
        if (onPositionUpdate) {
          onPositionUpdate(pos);
        }
      }
    } catch (err) {
      console.error('[UWB] Failed to parse message:', err);
      setError('Invalid message format');
    }
  };

  /**
   * Connect to UWB service
   */
  const connect = (): void => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[UWB] Already connected');
      return;
    }

    console.log(`[UWB] Connecting to ${wsUrl}...`);
    setError(null);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[UWB] Connected successfully');
        setIsConnected(true);
        setError(null);
        // Clear reconnect timer
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };

      ws.onmessage = handleMessage;

      ws.onerror = (event) => {
        console.error('[UWB] WebSocket error:', event);
        setError('Connection error');
      };

      ws.onclose = () => {
        console.log('[UWB] Disconnected');
        setIsConnected(false);
        setPosition(null);
        setQuality(0);
        setAnchorsUsed(0);
        setUpdateRate(0);
        rateWindowRef.current = [];

        // Auto-reconnect after 3 seconds
        if (autoConnect && !reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            console.log('[UWB] Attempting to reconnect...');
            reconnectTimerRef.current = null;
            connect();
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[UWB] Failed to connect:', err);
      setError((err as Error).message || 'Connection failed');
    }
  };

  /**
   * Disconnect from UWB service
   */
  const disconnect = (): void => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setPosition(null);
    setQuality(0);
    setAnchorsUsed(0);
    setError(null);
    setUpdateRate(0);
    rateWindowRef.current = [];
  };

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl, autoConnect]);

  return {
    isConnected,
    position,
    quality,
    anchorsUsed,
    anchors,
    error,
    updateRate,
    connect,
    disconnect,
  };
}
