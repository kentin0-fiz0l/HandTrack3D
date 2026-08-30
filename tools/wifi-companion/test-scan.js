#!/usr/bin/env node

/**
 * WiFi Scan Test Script
 * Quick test to verify WiFi scanning works on your system
 */

import { WiFiScanner } from './wifiScanner.js';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   WiFi Scanner Test                                       ║');
console.log('╠════════════════════════════════════════════════════════════╣');
console.log('║ Testing WiFi scanning capability...                       ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

// Check if WiFi scanning is supported
console.log('[1/3] Checking if WiFi scanning is supported...');
WiFiScanner.isSupported()
  .then((supported) => {
    if (supported) {
      console.log('✓ WiFi scanning is supported on this system\n');
      return runScan();
    } else {
      console.error('✗ WiFi scanning is NOT supported on this system');
      console.error('');
      console.error('Troubleshooting:');
      console.error('  • macOS: Grant location services permission to Terminal');
      console.error('  • Linux: Run with sudo or configure NET_ADMIN capability');
      console.error('  • Windows: Run as Administrator');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('✗ Error checking WiFi support:', error.message);
    process.exit(1);
  });

async function runScan() {
  console.log('[2/3] Scanning WiFi networks...');

  const scanner = new WiFiScanner({ iface: null });

  try {
    const networks = await scanner.scanOnce();

    if (networks.length === 0) {
      console.error('✗ No WiFi networks found');
      console.error('');
      console.error('Troubleshooting:');
      console.error('  • Check if WiFi adapter is enabled');
      console.error('  • Try running with elevated permissions (sudo/Administrator)');
      console.error('  • Ensure you are not in a VM (some VMs cannot scan WiFi)');
      process.exit(1);
    }

    console.log(`✓ Found ${networks.length} WiFi networks\n`);

    console.log('[3/3] Displaying scan results...\n');

    console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║ SSID                     │ BSSID (MAC)       │ RSSI   │ Ch │ Freq   │ Security║');
    console.log('╠════════════════════════════════════════════════════════════════════════════════╣');

    // Sort by signal strength (strongest first)
    networks.sort((a, b) => b.rssi - a.rssi);

    networks.forEach((network) => {
      const ssid = (network.ssid || '(hidden)').padEnd(24).substring(0, 24);
      const bssid = (network.bssid || 'unknown').padEnd(17);
      const rssi = `${network.rssi} dBm`.padEnd(7);
      const channel = `${network.channel || 'N/A'}`.padEnd(2);
      const freq = `${network.frequency || 'N/A'}`.padEnd(6);
      const security = (network.security || 'Open').padEnd(8).substring(0, 8);

      console.log(`║ ${ssid} │ ${bssid} │ ${rssi} │ ${channel} │ ${freq} │ ${security}║`);
    });

    console.log('╚════════════════════════════════════════════════════════════════════════════════╝');
    console.log('');

    // Provide guidance for next steps
    console.log('Next Steps:');
    console.log('');
    console.log('1. Choose 3+ routers with strong signal (RSSI > -70 dBm recommended)');
    console.log('2. Note their BSSIDs (MAC addresses) from the table above');
    console.log('3. Measure physical position of each router in your room (in meters)');
    console.log('4. Update config.json with router BSSIDs and positions');
    console.log('5. Run calibration: stand 1 meter from each router and note RSSI');
    console.log('6. Update referenceRssi in config.json for each router');
    console.log('7. Start companion app: npm start');
    console.log('');
    console.log('Example config.json entry:');
    console.log('{');
    console.log('  "name": "Living Room Router",');
    console.log(`  "bssid": "${networks[0]?.bssid || 'AA:BB:CC:DD:EE:FF'}",`);
    console.log('  "position": { "x": 0, "y": 0, "z": 0 },');
    console.log('  "referenceRssi": -40,');
    console.log('  "pathLossExponent": 2.5');
    console.log('}');
    console.log('');

  } catch (error) {
    console.error('✗ WiFi scan failed:', error.message);
    process.exit(1);
  }
}
