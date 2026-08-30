# WiFi Positioning Quick Start Guide

**Goal**: Get WiFi positioning working in 15 minutes.

## Prerequisites

- Node.js 18+ installed
- WiFi adapter (built-in or USB)
- 3+ WiFi routers/access points in your space

## Step 1: Test WiFi Scanning (2 minutes)

```bash
cd tools/wifi-companion
npm install
npm run test-scan
```

**Expected Output**:
```
╔════════════════════════════════════════════════════════════╗
║   WiFi Scanner Test                                       ║
╚════════════════════════════════════════════════════════════╝

✓ WiFi scanning is supported on this system
✓ Found 12 WiFi networks

╔══════════════════════════════════════════════════════════════════╗
║ SSID            │ BSSID (MAC)       │ RSSI   │ Ch │ Freq   │ Sec ║
╠══════════════════════════════════════════════════════════════════╣
║ HomeRouter_2G   │ AA:BB:CC:DD:EE:FF │ -45 dBm│ 6  │ 2437   │ WPA2║
║ HomeRouter_5G   │ AA:BB:CC:DD:EE:00 │ -52 dBm│ 36 │ 5180   │ WPA2║
...
```

**Troubleshooting**:
- **macOS**: System Preferences → Security & Privacy → Location Services → Terminal → Enable
- **Linux**: `sudo npm run test-scan` (or configure NET_ADMIN capability)
- **Windows**: Run PowerShell as Administrator

## Step 2: Choose Routers (5 minutes)

From the scan results, select 3-4 routers with:
- **Strong signal**: RSSI > -70 dBm
- **Good coverage**: Spread around your room (not all in one corner)
- **Stable**: Not mobile hotspots or neighbor's WiFi

Note their **BSSIDs** (MAC addresses).

## Step 3: Measure Router Positions (5 minutes)

1. Choose a corner of your room as **origin** (0, 0, 0)
2. Use a tape measure to find each router's position
3. Record positions in meters

**Example**:
```
Room: 5m x 5m x 2.5m (ceiling height)

Origin: Bottom-left corner (floor level)

Router 1 (Living Room): Top-left corner, ceiling → (0, 5, 2.5)
Router 2 (Kitchen): Top-right corner, ceiling → (5, 5, 2.5)
Router 3 (Bedroom): Bottom-right corner, desk → (5, 0, 0.8)
```

## Step 4: Update Configuration (2 minutes)

Edit `tools/wifi-companion/config.json`:

```json
{
  "routers": [
    {
      "name": "Living Room Router",
      "bssid": "AA:BB:CC:DD:EE:FF",
      "position": { "x": 0, "y": 5, "z": 2.5 },
      "referenceRssi": -40,
      "pathLossExponent": 2.5
    },
    {
      "name": "Kitchen Router",
      "bssid": "AA:BB:CC:DD:EE:00",
      "position": { "x": 5, "y": 5, "z": 2.5 },
      "referenceRssi": -40,
      "pathLossExponent": 2.5
    },
    {
      "name": "Bedroom Router",
      "bssid": "AA:BB:CC:DD:EE:11",
      "position": { "x": 5, "y": 0, "z": 0.8 },
      "referenceRssi": -40,
      "pathLossExponent": 2.5
    }
  ]
}
```

**Note**: Use actual BSSIDs from Step 1, and measured positions from Step 3.

## Step 5: Start Companion App (1 minute)

```bash
npm start
```

**Expected Output**:
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

Keep this terminal window open.

## Step 6: Test in Browser (Optional)

Create a simple test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>WiFi Positioning Test</title>
</head>
<body>
  <h1>WiFi Positioning Test</h1>
  <div id="status">Connecting...</div>
  <div id="position"></div>
  <pre id="debug"></pre>

  <script type="module">
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      document.getElementById('status').textContent = 'Connected ✓';
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'wifi-scan') {
        const debug = document.getElementById('debug');
        debug.textContent = JSON.stringify(data, null, 2);

        // Show detected routers
        const detected = data.data.filter(n =>
          ['AA:BB:CC:DD:EE:FF', 'AA:BB:CC:DD:EE:00', 'AA:BB:CC:DD:EE:11']
          .includes(n.bssid.toUpperCase())
        );

        document.getElementById('position').innerHTML =
          `<h2>Detected Routers: ${detected.length}/3</h2>` +
          detected.map(n =>
            `<p>${n.ssid}: ${n.rssi} dBm</p>`
          ).join('');
      }
    };

    ws.onerror = (error) => {
      document.getElementById('status').textContent = 'Error: ' + error;
    };
  </script>
</body>
</html>
```

Open in browser and verify you see RSSI data updating every 500ms.

## Optional: Calibration (10 minutes)

For better accuracy, calibrate path loss parameters:

1. **Stand 1 meter from Router 1**
2. Note RSSI from companion app output (e.g., -42 dBm)
3. Update `referenceRssi` in config.json for Router 1
4. Repeat for all routers
5. Restart companion app: `Ctrl+C`, then `npm start`

**Advanced Calibration** (measure path loss exponent):

1. Stand at 1m, 2m, 3m, 5m from router
2. Record RSSI at each distance
3. Use linear regression to fit path loss model:

```javascript
// In browser console or Node.js
const measurements = [
  { distance: 1, rssi: -42 },
  { distance: 2, rssi: -50 },
  { distance: 3, rssi: -55 },
  { distance: 5, rssi: -62 },
];

// Least squares fit
const n = measurements.length;
let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

measurements.forEach(({ distance, rssi }) => {
  const x = Math.log10(distance);
  const y = rssi;
  sumX += x;
  sumY += y;
  sumXY += x * y;
  sumX2 += x * x;
});

const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
const intercept = (sumY - slope * sumX) / n;

const pathLossExponent = -slope / 10;
const referenceRssi = intercept;

console.log('referenceRssi:', referenceRssi.toFixed(1));
console.log('pathLossExponent:', pathLossExponent.toFixed(2));
```

4. Update config.json with calculated values
5. Restart companion app

## Troubleshooting

### No routers detected

- Verify BSSIDs match exactly (case-insensitive)
- Check if routers are broadcasting (not hidden network)
- Ensure WiFi adapter is enabled

### Poor positioning accuracy

- Add more routers (4+ recommended)
- Calibrate `referenceRssi` and `pathLossExponent`
- Check for interference (microwave, Bluetooth)
- Verify router positions are accurate (measure twice)
- Improve router geometry (spread out in 3D, not all on ceiling)

### Companion app crashes

- Check Node.js version (need 18+)
- Linux: May need `sudo` or NET_ADMIN capability
- Check WiFi adapter is not being used by another app

### WebSocket connection refused

- Ensure companion app is running (`npm start`)
- Check firewall settings (allow port 8080)
- Try `ws://127.0.0.1:8080` instead of `localhost`

## Next Steps

Once basic WiFi positioning is working:

1. **Integrate with HandTrack3D** (Phase 4B)
   - Combine WiFi position with hand tracking
   - Add sensor fusion (Kalman filter)
   - Create calibration wizard UI

2. **Improve Accuracy** (optional)
   - Add 4th+ router for better coverage
   - Fine-tune path loss calibration
   - Add motion smoothing filters

3. **Upgrade to UWB** (Phase 4C - future)
   - Purchase Decawave DWM1001 modules
   - Test ±10-30cm accuracy
   - Migrate from WiFi to UWB positioning

## Resources

- **Full Documentation**: `/docs/phase4/POSITIONING_RESEARCH.md`
- **Companion App README**: `/tools/wifi-companion/README.md`
- **GitHub Issues**: Report bugs or ask questions

Good luck with WiFi positioning! 🎯
