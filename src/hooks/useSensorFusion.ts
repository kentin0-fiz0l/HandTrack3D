import { useEffect, useRef } from 'react';
import { sensorFusion, type HandState, type FusedHandState } from '@/services/sensorFusion/SensorFusionService';
import { usePositioningStore } from '@/stores/positioningStore';
import { useHandCursorStore } from '@/hooks/useHandTo3DMapping';
import * as THREE from 'three';

/**
 * Hook to manage sensor fusion between WiFi positioning and hand tracking
 *
 * Integrates:
 * - WiFi positioning updates → camera pose
 * - Hand tracking updates → fused hand positions
 * - Outputs room-relative hand positions when fusion mode is active
 */
export function useSensorFusion() {
  const { roomPosition, positioningMode, enablePositioning } = usePositioningStore();
  const cursors = useHandCursorStore((state) => state.cursors);
  const lastRoomPositionRef = useRef<[number, number, number] | null>(null);

  // Update camera pose from WiFi positioning
  useEffect(() => {
    if (!enablePositioning || positioningMode === 'disabled') {
      // Fusion disabled - reset service
      sensorFusion.reset();
      return;
    }

    if (positioningMode === 'wifi-only') {
      // WiFi-only mode - no fusion needed
      // Camera pose is updated but not used for fusion
      return;
    }

    // Fusion mode - update camera pose when WiFi position changes
    if (roomPosition) {
      const [x, y, z] = roomPosition;
      const prevPos = lastRoomPositionRef.current;

      // Check if position actually changed (avoid redundant updates)
      if (
        !prevPos ||
        Math.abs(prevPos[0] - x) > 0.01 ||
        Math.abs(prevPos[1] - y) > 0.01 ||
        Math.abs(prevPos[2] - z) > 0.01
      ) {
        const position = new THREE.Vector3(x, y, z);
        const accuracy = usePositioningStore.getState().positionAccuracy || 2.5;

        sensorFusion.updateCameraPose(position, accuracy);
        lastRoomPositionRef.current = [x, y, z];
      }
    }
  }, [roomPosition, positioningMode, enablePositioning]);

  // Update hand tracking for sensor fusion
  useEffect(() => {
    if (positioningMode !== 'fusion' || !enablePositioning) {
      return;
    }

    // Convert hand cursors to HandState format for fusion service
    const hands: HandState[] = cursors.map((cursor) => ({
      id: cursor.id,
      position: cursor.position.clone(),
      confidence: 0.9, // MediaPipe provides high confidence
      timestamp: Date.now(),
    }));

    // Update sensor fusion with latest hand tracking
    if (hands.length > 0) {
      sensorFusion.updateHandTracking(hands);
    }
  }, [cursors, positioningMode, enablePositioning]);

  // Get fused hand states
  const getFusedHands = (): FusedHandState[] => {
    if (positioningMode !== 'fusion' || !sensorFusion.isActive()) {
      return [];
    }
    return sensorFusion.getAllHandStates();
  };

  // Get fused position for a specific hand
  const getFusedPosition = (handId: string): THREE.Vector3 | null => {
    const state = sensorFusion.getHandState(handId);
    return state ? state.roomPosition : null;
  };

  // Check if fusion is active
  const isFusionActive = (): boolean => {
    return (
      enablePositioning &&
      positioningMode === 'fusion' &&
      sensorFusion.isActive()
    );
  };

  return {
    getFusedHands,
    getFusedPosition,
    isFusionActive,
    sensorFusion, // Expose service for debugging
  };
}
