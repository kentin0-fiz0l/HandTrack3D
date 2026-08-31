/**
 * IMU Simulator for Desktop Testing
 *
 * Mocks DeviceOrientationEvent for browsers that don't support it (desktop).
 * Allows testing IMU integration without physical mobile device.
 *
 * Controls:
 * - Arrow Up/Down: Pitch (beta, -180° to 180°)
 * - Arrow Left/Right: Yaw (alpha, 0° to 360°)
 * - Q/E: Roll (gamma, -90° to 90°)
 * - R: Reset to neutral (0°, 0°, 0°)
 *
 * Usage:
 * ```ts
 * const simulator = new IMUSimulator();
 * simulator.start();
 * simulator.addEventListener('deviceorientation', handleOrientation);
 * ```
 */
export class IMUSimulator extends EventTarget {
  private alpha = 0; // Yaw (compass heading, 0-360°)
  private beta = 0; // Pitch (front-to-back tilt, -180 to 180°)
  private gamma = 0; // Roll (left-to-right tilt, -90 to 90°)

  private readonly step = 5; // Degrees per key press
  private animationFrameId: number | null = null;
  private isActive = false;

  constructor() {
    super();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Start simulator (begin listening to keyboard)
   */
  start(): void {
    if (this.isActive) {
      console.warn('[IMU Simulator] Already active');
      return;
    }

    console.log('[IMU Simulator] Started - keyboard controls enabled');
    console.log('  ↑↓: Pitch (beta)');
    console.log('  ←→: Yaw (alpha)');
    console.log('  Q/E: Roll (gamma)');
    console.log('  R: Reset');

    this.isActive = true;
    window.addEventListener('keydown', this.handleKeyDown);

    // Start emission loop
    this.emitLoop();
  }

  /**
   * Stop simulator
   */
  stop(): void {
    if (!this.isActive) {
      return;
    }

    console.log('[IMU Simulator] Stopped');
    this.isActive = false;
    window.removeEventListener('keydown', this.handleKeyDown);

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Handle keyboard input
   */
  private handleKeyDown(event: KeyboardEvent): void {
    let changed = false;

    switch (event.key) {
      case 'ArrowUp':
        // Pitch up (nose up)
        this.beta = this.clamp(this.beta + this.step, -180, 180);
        changed = true;
        break;

      case 'ArrowDown':
        // Pitch down (nose down)
        this.beta = this.clamp(this.beta - this.step, -180, 180);
        changed = true;
        break;

      case 'ArrowLeft':
        // Yaw left (turn left)
        this.alpha = (this.alpha - this.step + 360) % 360;
        changed = true;
        break;

      case 'ArrowRight':
        // Yaw right (turn right)
        this.alpha = (this.alpha + this.step) % 360;
        changed = true;
        break;

      case 'q':
      case 'Q':
        // Roll left
        this.gamma = this.clamp(this.gamma - this.step, -90, 90);
        changed = true;
        break;

      case 'e':
      case 'E':
        // Roll right
        this.gamma = this.clamp(this.gamma + this.step, -90, 90);
        changed = true;
        break;

      case 'r':
      case 'R':
        // Reset to neutral
        this.alpha = 0;
        this.beta = 0;
        this.gamma = 0;
        changed = true;
        console.log('[IMU Simulator] Reset to neutral');
        break;

      default:
        return; // Not a simulator key
    }

    if (changed) {
      // Prevent default browser behavior (e.g., scrolling)
      event.preventDefault();

      // Log orientation change
      console.log(
        `[IMU Simulator] α=${this.alpha.toFixed(1)}° β=${this.beta.toFixed(1)}° γ=${this.gamma.toFixed(1)}°`
      );
    }
  }

  /**
   * Continuously emit DeviceOrientationEvent (at ~60Hz)
   */
  private emitLoop(): void {
    if (!this.isActive) {
      return;
    }

    // Create and dispatch DeviceOrientationEvent
    this.emitEvent();

    // Schedule next emission (~60Hz)
    this.animationFrameId = requestAnimationFrame(() => this.emitLoop());
  }

  /**
   * Emit a single DeviceOrientationEvent
   */
  private emitEvent(): void {
    // Create mock DeviceOrientationEvent
    const event = new DeviceOrientationEvent('deviceorientation', {
      alpha: this.alpha,
      beta: this.beta,
      gamma: this.gamma,
      absolute: true,
    });

    // Dispatch to listeners
    this.dispatchEvent(event);
  }

  /**
   * Clamp value to range
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Get current orientation (for debugging)
   */
  getOrientation(): { alpha: number; beta: number; gamma: number } {
    return {
      alpha: this.alpha,
      beta: this.beta,
      gamma: this.gamma,
    };
  }

  /**
   * Set orientation manually (for testing)
   */
  setOrientation(alpha: number, beta: number, gamma: number): void {
    this.alpha = (alpha + 360) % 360;
    this.beta = this.clamp(beta, -180, 180);
    this.gamma = this.clamp(gamma, -90, 90);

    console.log(
      `[IMU Simulator] Set orientation: α=${this.alpha.toFixed(1)}° β=${this.beta.toFixed(1)}° γ=${this.gamma.toFixed(1)}°`
    );
  }
}

/**
 * Global singleton instance (auto-created in dev mode on desktop)
 */
let globalSimulator: IMUSimulator | null = null;

/**
 * Auto-start simulator in development mode on desktop browsers
 *
 * @returns Simulator instance if auto-started, null otherwise
 */
export function autoStartSimulator(): IMUSimulator | null {
  // Only in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  // Only if DeviceOrientationEvent is NOT supported (desktop)
  if (typeof DeviceOrientationEvent !== 'undefined') {
    console.log('[IMU Simulator] DeviceOrientationEvent available - simulator not needed');
    return null;
  }

  // Create and start simulator
  if (!globalSimulator) {
    globalSimulator = new IMUSimulator();
    globalSimulator.start();
    console.log('[IMU Simulator] Auto-started (development mode, desktop browser)');
  }

  return globalSimulator;
}

/**
 * Get global simulator instance (if active)
 */
export function getSimulator(): IMUSimulator | null {
  return globalSimulator;
}
