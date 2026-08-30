/**
 * WiFi Scanner Module
 * Handles WiFi network scanning and RSSI data extraction
 */

import wifi from 'node-wifi';

export class WiFiScanner {
  constructor(config = {}) {
    this.iface = config.iface || null; // null = use default interface
    this.scanInterval = config.scanInterval || 500; // ms
    this.isScanning = false;
    this.scanTimer = null;

    // Initialize node-wifi
    wifi.init({ iface: this.iface });
  }

  /**
   * Scan WiFi networks once and return RSSI data
   * @returns {Promise<Array>} Array of network objects with RSSI
   */
  async scanOnce() {
    try {
      const networks = await wifi.scan();

      // Transform to our format
      return networks.map((network) => ({
        ssid: network.ssid,
        bssid: network.bssid || network.mac, // node-wifi uses 'bssid' or 'mac' depending on platform
        rssi: network.signal_level || network.quality, // dBm (negative value)
        frequency: network.frequency,
        channel: network.channel,
        security: network.security,
      }));
    } catch (error) {
      console.error('WiFi scan failed:', error.message);
      return [];
    }
  }

  /**
   * Start continuous scanning
   * @param {Function} onScan - Callback function called with scan results
   */
  startScanning(onScan) {
    if (this.isScanning) {
      console.warn('WiFi scanner already running');
      return;
    }

    this.isScanning = true;
    console.log(`Starting WiFi scan (interval: ${this.scanInterval}ms)`);

    const scan = async () => {
      if (!this.isScanning) return;

      const networks = await this.scanOnce();
      onScan(networks);

      // Schedule next scan
      this.scanTimer = setTimeout(scan, this.scanInterval);
    };

    // Start first scan immediately
    scan();
  }

  /**
   * Stop continuous scanning
   */
  stopScanning() {
    if (!this.isScanning) return;

    this.isScanning = false;
    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }

    console.log('WiFi scanner stopped');
  }

  /**
   * Check if WiFi scanning is supported on this platform
   * @returns {Promise<boolean>}
   */
  static async isSupported() {
    try {
      wifi.init({ iface: null });
      await wifi.scan();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default WiFiScanner;
