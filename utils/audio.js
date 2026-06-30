// MotoCare Programmatic Audio Synthesizer

class MotoCareAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTick() {
    this.init();
    if (!this.ctx || this.muted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Synthesize a motorcycle engine revving throttle!
  // Combines a low-frequency pulse/sawtooth wave, high pass filter, and pitch ramp sweep.
  playEngineRev() {
    this.init();
    if (!this.ctx || this.muted) return;

    const now = this.ctx.currentTime;

    // We use two oscillators to create a throaty, rich rumble
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    // 1. Idle rumble (low pitch)
    osc1.frequency.setValueAtTime(45, now);
    osc2.frequency.setValueAtTime(46, now); // slightly detuned for chorus beefiness

    // 2. Throttle sweep (Rev up to 180 Hz, then back down to idle)
    // Rev up takes 0.3 seconds
    osc1.frequency.exponentialRampToValueAtTime(190, now + 0.35);
    osc2.frequency.exponentialRampToValueAtTime(192, now + 0.35);
    
    // Rev down back to idle takes 0.5 seconds
    osc1.frequency.exponentialRampToValueAtTime(45, now + 0.95);
    osc2.frequency.exponentialRampToValueAtTime(46, now + 0.95);

    // Filter out very muddy sub-lows to sound like an exhaust pipe
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(90, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + 0.35);
    filter.frequency.exponentialRampToValueAtTime(90, now + 0.95);
    filter.Q.setValueAtTime(1.5, now);

    // Gain envelope (grows on throttle, fades out on release)
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.08); // startup ignition pop
    gainNode.gain.linearRampToValueAtTime(0.18, now + 0.2); // settle to rev onset
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.35); // full throttle roar
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.25); // engine cutoff fade

    // Connections
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    // Run
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.3);
    osc2.stop(now + 1.3);
  }
}

const audio = new MotoCareAudio();
export default audio;
