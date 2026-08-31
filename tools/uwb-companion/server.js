/**
 * Mock UWB Companion Service
 *
 * Simulates UWB positioning hardware (DWM1001) for development/testing.
 * Generates synthetic position data with realistic noise characteristics.
 *
 * Real hardware implementation would:
 * - Read from serial port (DWM1001 via UART)
 * - Parse Time-of-Flight ranging data
 * - Forward actual position measurements
 *
 * Mock implementation:
 * - Generates positions in a 5m × 5m × 3m room
 * - Adds ±10-30cm Gaussian noise
 * - Updates at 10Hz (vs 2Hz for WiFi)
 * - Simulates quality metrics and anchor visibility
 */

const WebSocket = require('ws');

// Configuration
const WS_PORT = 8081;
const UPDATE_RATE_HZ = 10; // UWB update rate (10Hz vs WiFi 2Hz)
const UPDATE_INTERVAL_MS = 1000 / UPDATE_RATE_HZ;

// Mock UWB anchors (simulating DWM1001 setup)
const ANCHORS = [
  { id: 0x0000, position: [0.0, 0.0, 0.0], name: 'Anchor 0 (Origin)' },
  { id: 0x0001, position: [5.0, 0.0, 0.0], name: 'Anchor 1 (Right)' },
  { id: 0x0002, position: [0.0, 5.0, 2.0], name: 'Anchor 2 (Forward High)' },
  { id: 0x0003, position: [5.0, 5.0, 2.0], name: 'Anchor 3 (Far High)' },
  { id: 0x0004, position: [2.5, 2.5, 0.0], name: 'Anchor 4 (Center Low)' },
  { id: 0x0005, position: [2.5, 5.0, 2.5], name: 'Anchor 5 (Center High)' },
];

// Room bounds (5m × 5m × 3m)
const ROOM_BOUNDS = {
  x: [0, 5],
  y: [0, 5],
  z: [0, 3],
};

class MockUWBCompanion {
  constructor() {
    this.wsServer = null;
    this.clients = new Set();
    this.updateTimer = null;
    this.tagPosition = this.getInitialPosition();
    this.velocity = { x: 0, y: 0, z: 0 }; // m/s
  }

  /**
   * Get initial tag position (center of room)
   */
  getInitialPosition() {
    return {
      x: 2.5,
      y: 2.5,
      z: 1.5,
    };
  }

  /**
   * Initialize WebSocket server
   */
  initWebSocket() {
    this.wsServer = new WebSocket.Server({ port: WS_PORT });

    this.wsServer.on('connection', (ws) => {
      console.log('[Mock UWB] Client connected');
      this.clients.add(ws);

      // Send anchor configuration immediately
      ws.send(JSON.stringify({
        type: 'anchors',
        data: ANCHORS,
      }));

      // Send current position
      const position = this.generatePosition();
      ws.send(JSON.stringify({
        type: 'position',
        data: position,
      }));

      ws.on('close', () => {
        console.log('[Mock UWB] Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (err) => {
        console.error('[Mock UWB] Client error:', err.message);
        this.clients.delete(ws);
      });
    });

    console.log(`[Mock UWB] WebSocket server listening on ws://localhost:${WS_PORT}`);
    console.log('[Mock UWB] Simulating 6 UWB anchors');
    console.log('[Mock UWB] Update rate: 10Hz (100ms interval)');
    console.log('[Mock UWB] Accuracy: ±10-30cm (simulated noise)');
  }

  /**
   * Generate synthetic position with motion and noise
   */
  generatePosition() {
    // Simple random walk motion model
    const dt = UPDATE_INTERVAL_MS / 1000; // seconds

    // Random acceleration (simulates natural movement)
    const accel = {
      x: (Math.random() - 0.5) * 0.5, // ±0.25 m/s²
      y: (Math.random() - 0.5) * 0.5,
      z: (Math.random() - 0.5) * 0.2, // Less vertical movement
    };

    // Update velocity with damping (prevents runaway)
    const damping = 0.9;
    this.velocity.x = (this.velocity.x + accel.x * dt) * damping;
    this.velocity.y = (this.velocity.y + accel.y * dt) * damping;
    this.velocity.z = (this.velocity.z + accel.z * dt) * damping;

    // Update position
    this.tagPosition.x += this.velocity.x * dt;
    this.tagPosition.y += this.velocity.y * dt;
    this.tagPosition.z += this.velocity.z * dt;

    // Clamp to room bounds (soft boundaries)
    this.tagPosition.x = this.clampWithBounce(
      this.tagPosition.x,
      ROOM_BOUNDS.x[0],
      ROOM_BOUNDS.x[1],
      'x'
    );
    this.tagPosition.y = this.clampWithBounce(
      this.tagPosition.y,
      ROOM_BOUNDS.y[0],
      ROOM_BOUNDS.y[1],
      'y'
    );
    this.tagPosition.z = this.clampWithBounce(
      this.tagPosition.z,
      ROOM_BOUNDS.z[0],
      ROOM_BOUNDS.z[1],
      'z'
    );

    // Add UWB measurement noise (±10-30cm Gaussian)
    // Standard deviation: 15cm (center of ±10-30cm range)
    const noise = {
      x: this.gaussianRandom(0, 0.15),
      y: this.gaussianRandom(0, 0.15),
      z: this.gaussianRandom(0, 0.15),
    };

    const noisyPosition = {
      x: this.tagPosition.x + noise.x,
      y: this.tagPosition.y + noise.y,
      z: this.tagPosition.z + noise.z,
    };

    // Compute distances to anchors (for quality simulation)
    const anchorDistances = ANCHORS.map((anchor) => {
      const dx = noisyPosition.x - anchor.position[0];
      const dy = noisyPosition.y - anchor.position[1];
      const dz = noisyPosition.z - anchor.position[2];
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    });

    // Quality metric: 100 = best, 0 = worst
    // Based on: average distance to anchors (closer = better)
    // and number of anchors in range (<4m)
    const avgDistance = anchorDistances.reduce((a, b) => a + b, 0) / anchorDistances.length;
    const anchorsInRange = anchorDistances.filter((d) => d < 4.0).length;
    const distanceQuality = Math.max(0, 100 - avgDistance * 20); // 100 at 0m, 0 at 5m
    const rangeQuality = (anchorsInRange / ANCHORS.length) * 100;
    const quality = Math.round((distanceQuality + rangeQuality) / 2);

    return {
      x: parseFloat(noisyPosition.x.toFixed(3)),
      y: parseFloat(noisyPosition.y.toFixed(3)),
      z: parseFloat(noisyPosition.z.toFixed(3)),
      quality: Math.max(0, Math.min(100, quality)),
      anchorsUsed: anchorsInRange,
      timestamp: Date.now(),
    };
  }

  /**
   * Clamp value with bounce effect at boundaries
   */
  clampWithBounce(value, min, max, axis) {
    if (value < min) {
      this.velocity[axis] *= -0.5; // Bounce with energy loss
      return min;
    }
    if (value > max) {
      this.velocity[axis] *= -0.5;
      return max;
    }
    return value;
  }

  /**
   * Generate Gaussian random number (Box-Muller transform)
   */
  gaussianRandom(mean, stdDev) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Start position update loop
   */
  startUpdates() {
    this.updateTimer = setInterval(() => {
      const position = this.generatePosition();
      this.broadcastPosition(position);
    }, UPDATE_INTERVAL_MS);

    console.log('[Mock UWB] Position updates started (10Hz)');
  }

  /**
   * Broadcast position to all connected clients
   */
  broadcastPosition(position) {
    const message = JSON.stringify({
      type: 'position',
      data: position,
    });

    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Start mock UWB companion service
   */
  start() {
    this.initWebSocket();
    this.startUpdates();

    console.log('\n[Mock UWB] Service started successfully');
    console.log('[Mock UWB] Connect HandTrack3D to ws://localhost:8081');
    console.log('[Mock UWB] Simulating tag moving in 5m × 5m × 3m room\n');
  }

  /**
   * Stop service
   */
  stop() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    if (this.wsServer) {
      this.wsServer.close();
    }
    console.log('[Mock UWB] Service stopped');
  }
}

// Start service
const companion = new MockUWBCompanion();
companion.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Mock UWB] Shutting down...');
  companion.stop();
  process.exit(0);
});
