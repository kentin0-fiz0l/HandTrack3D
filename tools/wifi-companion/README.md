# HandTrack3D WiFi Companion App

WiFi RSSI scanning companion application for HandTrack3D room-scale positioning.

## Overview

This Node.js application scans WiFi networks and sends RSSI (signal strength) data to the HandTrack3D browser application via WebSocket. This enables WiFi-based positioning without requiring browser extensions or router modifications.

## Architecture

```
[WiFi Hardware] → [node-wifi] → [WebSocket Server] → [Browser (HandTrack3D)]
                   (scanning)      (localhost:8080)     (positioning)
```

## Requirements

- **Node.js**: 18.0.0 or higher
- **Operating System**: macOS, Windows, or Linux
- **Permissions**: May require administrator/root access to scan WiFi networks
- **WiFi Adapter**: Built-in or USB WiFi adapter

## Installation

```bash
cd tools/wifi-companion
npm install
```

## Configuration

Edit `config.json` to configure your WiFi routers:

```json
{
  "routers": [
    {
      "name": "Router 1",
      "bssid": "AA:BB:CC:DD:EE:FF",  // Router MAC address
      "position": {
        "x": 0,    // meters from origin
        "y": 0,
        "z": 0
      },
      "referenceRssi": -40,           // RSSI at 1 meter
      "pathLossExponent": 2.5         // Environment-specific (2.0-4.0)
    }
  ]
}
```

### Finding Router BSSID (MAC Address)

**macOS**:
```bash
# Option 1: Using airport utility
/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s

# Option 2: System Preferences
# System Preferences → Network → WiFi → Advanced → Show WiFi status in menu bar
# Option+Click WiFi icon in menu bar
```

**Windows**:
```powershell
# Command Prompt
netsh wlan show networks mode=bssid
```

**Linux**:
```bash
# Using iwlist
sudo iwlist wlan0 scan | grep -E "Address|ESSID|Signal level"

# Using nmcli
nmcli dev wifi list
```

### Measuring Router Positions

1. Choose a corner of your room as origin (0, 0, 0)
2. Measure distance from origin to each router in meters
3. Update `position` values in `config.json`

**Example**:
```
Room: 5m x 5m
Origin: Bottom-left corner

Router 1: Top-left corner → (0, 5, 0)
Router 2: Top-right corner → (5, 5, 0)
Router 3: Bottom-right corner → (5, 0, 0)
```

### Calibrating Path Loss Parameters

**Reference RSSI (A)**:
1. Stand exactly 1 meter from router
2. Run companion app and note RSSI value
3. Update `referenceRssi` in config.json

**Path Loss Exponent (n)**:
- Open space / line-of-sight: `2.0`
- Office with cubicles: `2.5 - 3.0`
- Home with walls: `3.0 - 4.0`
- Dense walls / metal: `4.0+`

## Usage

### Start the companion app

```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║   HandTrack3D WiFi Companion App                          ║
╠════════════════════════════════════════════════════════════╣
║ WebSocket Server: ws://localhost:8080                     ║
║ Scan Interval: 500ms                                       ║
║ Configured Routers: 3                                      ║
╠════════════════════════════════════════════════════════════╣
║ Waiting for browser connection...                         ║
╚════════════════════════════════════════════════════════════╝
```

### Connect HandTrack3D

1. Keep companion app running
2. Open HandTrack3D in browser: `http://localhost:5173`
3. WiFi positioning should automatically connect

### Development mode (auto-reload)

```bash
npm run dev
```

## WebSocket Protocol

### Messages from Companion → Browser

**WiFi Scan Data**:
```json
{
  "type": "wifi-scan",
  "timestamp": 1725043200000,
  "scanCount": 42,
  "data": [
    {
      "ssid": "HomeRouter_2G",
      "bssid": "AA:BB:CC:DD:EE:FF",
      "rssi": -45,
      "frequency": 2437,
      "channel": 6,
      "security": "WPA2"
    }
  ]
}
```

**Router Configuration**:
```json
{
  "type": "config",
  "timestamp": 1725043200000,
  "routers": [
    {
      "name": "Router 1",
      "bssid": "AA:BB:CC:DD:EE:FF",
      "position": { "x": 0, "y": 0, "z": 0 },
      "referenceRssi": -40,
      "pathLossExponent": 2.5
    }
  ]
}
```

### Messages from Browser → Companion

**Request Configuration**:
```json
{
  "type": "request-config"
}
```

**Ping (Health Check)**:
```json
{
  "type": "ping"
}
```

Response:
```json
{
  "type": "pong",
  "timestamp": 1725043200000
}
```

## Troubleshooting

### WiFi scanning not working

**macOS**: Grant terminal/node access to location services
```
System Preferences → Security & Privacy → Privacy → Location Services → Terminal → Enable
```

**Linux**: Run with sudo (or configure capabilities)
```bash
sudo npm start

# Or configure capabilities (more secure)
sudo setcap cap_net_raw,cap_net_admin+eip $(which node)
npm start
```

**Windows**: Run as Administrator

### WebSocket connection refused

- Check firewall settings (allow port 8080)
- Ensure companion app is running before opening browser
- Try `ws://127.0.0.1:8080` instead of `localhost`

### No routers detected

- Verify BSSID in config.json matches router MAC address (case-insensitive)
- Check if routers are broadcasting SSID (hidden networks may not appear)
- Ensure WiFi adapter is enabled

### Poor positioning accuracy

1. Add more routers (4+ recommended)
2. Calibrate `referenceRssi` and `pathLossExponent`
3. Check for interference (microwave, Bluetooth, etc.)
4. Verify router positions are correct in config.json

## Platform-Specific Notes

### macOS
- Location services permission required
- Works with built-in WiFi and USB adapters
- May not work in virtual machines

### Windows
- Administrator privileges required
- Compatible with most WiFi adapters
- Some adapters may not report RSSI correctly

### Linux
- Requires `sudo` or NET_ADMIN capability
- Tested with `iw` and `iwlist` compatible adapters
- May need to install `wireless-tools` package

## Performance

- **Scan Interval**: 500ms (2 Hz update rate)
- **CPU Usage**: ~1-2% on modern hardware
- **Memory**: ~30-50 MB
- **Network**: ~500 bytes/scan (minimal bandwidth)

## Security Considerations

- Companion app only listens on `localhost` by default
- No data is sent to external servers
- BSSID exposure is limited to local WebSocket clients
- Consider firewall rules if changing host from `localhost`

## Future Improvements

- [ ] Electron GUI for easier configuration
- [ ] Automatic router discovery and position calibration
- [ ] Support for Bluetooth RSSI (BLE beacons)
- [ ] Export scan data for offline analysis
- [ ] Multi-client support with separate positioning

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [HandTrack3D Issues](https://github.com/yourusername/HandTrack3D/issues)
- Documentation: `/docs/phase4/POSITIONING_RESEARCH.md`
