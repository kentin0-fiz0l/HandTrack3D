#!/usr/bin/env node

/**
 * HandTrack3D WiFi Companion App
 * Scans WiFi networks and sends RSSI data to browser via WebSocket
 */

import { WebSocketServer } from 'ws';
import { WiFiScanner } from './wifiScanner.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// WebSocket server
const wss = new WebSocketServer({
  port: config.websocket.port,
  host: config.websocket.host,
});

// WiFi scanner
const scanner = new WiFiScanner({
  iface: config.wifi.iface,
  scanInterval: config.wifi.scanInterval,
});

// Connected clients
const clients = new Set();

// Statistics
let scanCount = 0;
let lastScanTime = 0;

/**
 * Broadcast WiFi scan data to all connected clients
 */
function broadcastScan(networks) {
  if (clients.size === 0) return;

  scanCount++;
  lastScanTime = Date.now();

  const message = JSON.stringify({
    type: 'wifi-scan',
    timestamp: lastScanTime,
    scanCount,
    data: networks,
  });

  clients.forEach((client) => {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      client.send(message);
    }
  });

  // Log summary (only show configured routers)
  const knownBssids = new Set(config.routers.map((r) => r.bssid.toUpperCase()));
  const knownNetworks = networks.filter((n) =>
    knownBssids.has(n.bssid?.toUpperCase() || '')
  );

  if (knownNetworks.length > 0) {
    console.log(
      `[${new Date(lastScanTime).toLocaleTimeString()}] Scan #${scanCount}: ${knownNetworks.length} configured routers detected`
    );
    knownNetworks.forEach((n) => {
      console.log(`  - ${n.ssid} (${n.bssid}): ${n.rssi} dBm`);
    });
  }
}

/**
 * Send router configuration to client
 */
function sendConfig(client) {
  const message = JSON.stringify({
    type: 'config',
    timestamp: Date.now(),
    routers: config.routers,
  });

  client.send(message);
  console.log('Sent router configuration to client');
}

// WebSocket server event handlers
wss.on('connection', (ws) => {
  console.log('Browser client connected');
  clients.add(ws);

  // Send configuration immediately
  sendConfig(ws);

  // Start scanning if first client
  if (clients.size === 1) {
    scanner.startScanning(broadcastScan);
  }

  // Handle client messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received message from client:', message.type);

      if (message.type === 'request-config') {
        sendConfig(ws);
      } else if (message.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch (error) {
      console.error('Failed to parse client message:', error.message);
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    console.log('Browser client disconnected');
    clients.delete(ws);

    // Stop scanning if no clients
    if (clients.size === 0) {
      scanner.stopScanning();
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
    clients.delete(ws);
  });
});

wss.on('listening', () => {
  const address = wss.address();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   HandTrack3D WiFi Companion App                          ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║ WebSocket Server: ws://${address.address}:${address.port}${' '.repeat(25 - address.address.length - address.port.toString().length)}║`);
  console.log(`║ Scan Interval: ${config.wifi.scanInterval}ms${' '.repeat(43 - config.wifi.scanInterval.toString().length)}║`);
  console.log(`║ Configured Routers: ${config.routers.length}${' '.repeat(37)}║`);
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║ Waiting for browser connection...                         ║');
  console.log('║                                                            ║');
  console.log('║ Next Steps:                                                ║');
  console.log('║ 1. Update config.json with your router BSSIDs             ║');
  console.log('║ 2. Measure router positions and update config.json        ║');
  console.log('║ 3. Open HandTrack3D in browser (http://localhost:5173)    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
});

wss.on('error', (error) => {
  console.error('WebSocket server error:', error.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down WiFi companion app...');
  scanner.stopScanning();
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

// Periodic status update
setInterval(() => {
  if (clients.size > 0) {
    const uptime = process.uptime();
    const avgScanRate = scanCount / uptime;
    console.log(
      `[Status] Clients: ${clients.size}, Scans: ${scanCount}, Avg Rate: ${avgScanRate.toFixed(2)} Hz`
    );
  }
}, 30000); // Every 30 seconds
