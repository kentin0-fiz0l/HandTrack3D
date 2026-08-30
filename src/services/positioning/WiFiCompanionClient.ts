/**
 * WiFi Companion Client
 * WebSocket client for connecting to WiFi companion app
 */

import type {
  RssiData,
  RouterConfig,
  CompanionMessage,
  PositioningProviderOptions,
} from './types';

export class WiFiCompanionClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // ms
  private reconnectTimer: number | null = null;
  private isManualDisconnect = false;

  // Callbacks
  private onRssiUpdate: ((data: RssiData[]) => void) | null = null;
  private onConfigUpdate: ((routers: RouterConfig[]) => void) | null = null;
  private onConnectionChange: ((connected: boolean) => void) | null = null;

  constructor(options: PositioningProviderOptions = {}) {
    this.url = options.websocketUrl || 'ws://localhost:8080';
    this.onConnectionChange = options.onConnectionChange || null;

    if (options.autoConnect) {
      this.connect();
    }
  }

  /**
   * Connect to WiFi companion app
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.warn('WiFi companion already connected');
        resolve();
        return;
      }

      this.isManualDisconnect = false;
      console.log(`Connecting to WiFi companion at ${this.url}...`);

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WiFi companion connected');
          this.reconnectAttempts = 0;
          this.notifyConnectionChange(true);
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('WiFi companion error:', error);
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('Failed to connect to WiFi companion'));
          }
        };

        this.ws.onclose = () => {
          console.log('WiFi companion disconnected');
          this.notifyConnectionChange(false);

          // Auto-reconnect if not manually disconnected
          if (!this.isManualDisconnect) {
            this.scheduleReconnect();
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const message: CompanionMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse companion message:', error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WiFi companion app
   */
  disconnect(): void {
    this.isManualDisconnect = true;

    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.notifyConnectionChange(false);
  }

  /**
   * Check if connected to companion app
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Request router configuration from companion app
   */
  requestConfig(): void {
    if (!this.isConnected()) {
      console.warn('Cannot request config: not connected');
      return;
    }

    this.send({ type: 'request-config' });
  }

  /**
   * Send ping to companion app
   */
  ping(): void {
    if (!this.isConnected()) {
      console.warn('Cannot ping: not connected');
      return;
    }

    this.send({ type: 'ping' });
  }

  /**
   * Register callback for RSSI updates
   */
  onRssi(callback: (data: RssiData[]) => void): void {
    this.onRssiUpdate = callback;
  }

  /**
   * Register callback for router configuration updates
   */
  onConfig(callback: (routers: RouterConfig[]) => void): void {
    this.onConfigUpdate = callback;
  }

  /**
   * Handle incoming message from companion app
   */
  private handleMessage(message: CompanionMessage): void {
    switch (message.type) {
      case 'wifi-scan':
        if (this.onRssiUpdate) {
          this.onRssiUpdate(message.data);
        }
        break;

      case 'config':
        if (this.onConfigUpdate) {
          this.onConfigUpdate(message.routers);
        }
        break;

      default:
        console.warn('Unknown message type:', message);
    }
  }

  /**
   * Send message to companion app
   */
  private send(data: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: not connected');
      return;
    }

    this.ws.send(JSON.stringify(data));
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `Failed to reconnect after ${this.maxReconnectAttempts} attempts`
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Notify connection state change
   */
  private notifyConnectionChange(connected: boolean): void {
    if (this.onConnectionChange) {
      this.onConnectionChange(connected);
    }
  }
}

export default WiFiCompanionClient;
