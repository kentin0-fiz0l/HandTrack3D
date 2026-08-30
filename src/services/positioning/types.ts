/**
 * WiFi Positioning Types
 * Type definitions for WiFi-based positioning system
 */

import { Vector3 } from 'three';

export interface RssiData {
  ssid: string;
  bssid: string; // MAC address
  rssi: number; // Signal strength in dBm (negative value)
  frequency: number; // MHz
  channel: number;
  security?: string;
}

export interface RouterConfig {
  name: string;
  bssid: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  referenceRssi: number; // RSSI at 1 meter (typically -40 to -50 dBm)
  pathLossExponent: number; // 2.0 = free space, 2.5-4.0 = indoor
}

export interface WiFiScanMessage {
  type: 'wifi-scan';
  timestamp: number;
  scanCount: number;
  data: RssiData[];
}

export interface ConfigMessage {
  type: 'config';
  timestamp: number;
  routers: RouterConfig[];
}

export type CompanionMessage = WiFiScanMessage | ConfigMessage;

export interface PositionEstimate {
  position: Vector3;
  accuracy: number; // Estimated error in meters
  timestamp: number;
  routersUsed: number; // How many routers were used for trilateration
}

export interface PositioningProviderOptions {
  websocketUrl?: string;
  minRouters?: number; // Minimum routers needed for positioning (default: 3)
  autoConnect?: boolean;
  onPositionUpdate?: (estimate: PositionEstimate) => void;
  onConnectionChange?: (connected: boolean) => void;
}
