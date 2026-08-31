import { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';

/**
 * IMU orientation state
 */
export interface IMUOrientationState {
  /** Current device orientation as Three.js quaternion (null = no IMU data) */
  orientation: THREE.Quaternion | null;
  /** Device has gyroscope/accelerometer */
  isAvailable: boolean;
  /** Permission state (iOS requires explicit permission) */
  permissionState: 'granted' | 'denied' | 'prompt' | 'unsupported';
  /** Raw Euler angles from device (degrees) */
  eulerAngles: { alpha: number; beta: number; gamma: number } | null;
  /** Request permission (iOS only) */
  requestPermission: () => Promise<void>;
}

/**
 * Convert DeviceOrientationEvent data to Three.js quaternion
 *
 * Coordinate system conversion:
 * - Device: Z-up (screen normal), Y-top (screen top), X-right (screen right)
 * - Three.js: Y-up, Z-forward, X-right
 *
 * @param alpha - Z-axis rotation (compass heading, 0-360°)
 * @param beta - X-axis rotation (front-to-back tilt, -180 to 180°)
 * @param gamma - Y-axis rotation (left-to-right tilt, -90 to 90°)
 * @returns Three.js quaternion representing device orientation
 */
function convertDeviceOrientationToThreeJS(
  alpha: number,
  beta: number,
  gamma: number
): THREE.Quaternion {
  // Step 1: Convert degrees to radians
  const alphaRad = THREE.MathUtils.degToRad(alpha);
  const betaRad = THREE.MathUtils.degToRad(beta);
  const gammaRad = THREE.MathUtils.degToRad(gamma);

  // Step 2: Create Euler angles (YXZ order matches DeviceOrientationEvent)
  const euler = new THREE.Euler(betaRad, alphaRad, -gammaRad, 'YXZ');

  // Step 3: Convert to quaternion
  const quat = new THREE.Quaternion().setFromEuler(euler);

  // Step 4: Apply coordinate system correction (device Z-up → Three.js Y-up)
  // Rotate -90° around X-axis to align Z-up with Y-up
  const correction = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    -Math.PI / 2
  );
  quat.premultiply(correction);

  return quat;
}

/**
 * Hook to track device orientation using IMU (gyroscope/accelerometer)
 *
 * Features:
 * - Subscribes to DeviceOrientationEvent for real-time orientation
 * - Converts device orientation to Three.js quaternion
 * - Handles iOS permission requests (iOS 13+)
 * - Graceful fallback when IMU unavailable (desktop browsers)
 * - Returns null orientation when permission denied or device lacks sensors
 *
 * @returns IMU orientation state
 */
export function useIMUOrientation(): IMUOrientationState {
  const [orientation, setOrientation] = useState<THREE.Quaternion | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [permissionState, setPermissionState] = useState<
    'granted' | 'denied' | 'prompt' | 'unsupported'
  >('unsupported');
  const [eulerAngles, setEulerAngles] = useState<{
    alpha: number;
    beta: number;
    gamma: number;
  } | null>(null);

  /**
   * Request DeviceOrientation permission (iOS 13+ only)
   */
  const requestPermission = useCallback(async () => {
    // Check if running on iOS with permission API
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();

        if (permission === 'granted') {
          setPermissionState('granted');
          setIsAvailable(true);
          console.log('[IMU] Permission granted (iOS)');
        } else {
          setPermissionState('denied');
          setIsAvailable(false);
          console.warn('[IMU] Permission denied (iOS)');
        }
      } catch (error) {
        console.error('[IMU] Permission request failed:', error);
        setPermissionState('denied');
        setIsAvailable(false);
      }
    } else {
      console.warn('[IMU] Permission API not available (not iOS or older version)');
    }
  }, []);

  /**
   * Handle DeviceOrientationEvent
   */
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const { alpha, beta, gamma } = event;

    // Check if all orientation values are present
    if (alpha === null || beta === null || gamma === null) {
      console.warn('[IMU] Received null orientation values (device may lack sensors)');
      setOrientation(null);
      setEulerAngles(null);
      setIsAvailable(false);
      return;
    }

    // Store Euler angles (for debugging)
    setEulerAngles({ alpha, beta, gamma });

    // Convert to Three.js quaternion
    const quat = convertDeviceOrientationToThreeJS(alpha, beta, gamma);
    setOrientation(quat);

    // Mark as available (first successful event)
    setIsAvailable(true);
  }, []);

  /**
   * Initialize IMU listener
   */
  useEffect(() => {
    // Check if DeviceOrientationEvent is supported
    if (typeof DeviceOrientationEvent === 'undefined') {
      console.log('[IMU] DeviceOrientationEvent not supported (likely desktop browser)');
      setPermissionState('unsupported');
      setIsAvailable(false);
      return;
    }

    // Check if permission API exists (iOS 13+)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // iOS - permission required
      setPermissionState('prompt');
      console.log('[IMU] iOS detected - permission required');
      // Don't start listening yet - wait for user to call requestPermission()
      return;
    }

    // Non-iOS (Android, desktop) - auto-start listening
    console.log('[IMU] Starting orientation listener (auto-granted)');
    setPermissionState('granted');

    window.addEventListener('deviceorientation', handleOrientation);

    // Test if device actually has sensors by waiting for first event
    const timeout = setTimeout(() => {
      if (!isAvailable) {
        console.warn('[IMU] No orientation data received after 2s (device may lack sensors)');
        setIsAvailable(false);
      }
    }, 2000);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      clearTimeout(timeout);
    };
  }, [handleOrientation, isAvailable]);

  /**
   * Start listening after iOS permission granted
   */
  useEffect(() => {
    if (permissionState === 'granted' && typeof DeviceOrientationEvent !== 'undefined') {
      // iOS permission granted - start listening
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        console.log('[IMU] Starting orientation listener (iOS permission granted)');
        window.addEventListener('deviceorientation', handleOrientation);

        return () => {
          window.removeEventListener('deviceorientation', handleOrientation);
        };
      }
    }
  }, [permissionState, handleOrientation]);

  return {
    orientation,
    isAvailable,
    permissionState,
    eulerAngles,
    requestPermission,
  };
}
