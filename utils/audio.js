// motoCare Programmatic Audio Synthesizer

class MotoCareAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.idleInterval = null;
    this.isEngineRunning = false;
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
    if (this.muted && this.isEngineRunning) {
      this.stopEngine();
    }
    return this.muted;
  }

  playTick() {
    this.init();
    if (!this.ctx || this.muted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playRegisterChime() {
    this.init();
    if (!this.ctx || this.muted) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1567.98, now + 0.08); // G6
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.12, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(this.ctx.destination);
    gain2.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.7);
  }

  // Synthesize single mechanical exhaust thud/pop
  _playSingleIdlePop() {
    if (!this.ctx || this.muted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    // Deep, throaty single thud
    osc.frequency.setValueAtTime(42, now);
    osc.frequency.exponentialRampToValueAtTime(8, now + 0.07);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(85, now);
    filter.Q.setValueAtTime(2.2, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Start continuous mechanical thumping engine idle
  startEngine() {
    this.init();
    if (!this.ctx || this.muted || this.isEngineRunning) return;

    this.isEngineRunning = true;
    const now = this.ctx.currentTime;

    // 1. Ignition Start: Initial Starter motor whir & rev sweep
    const starterOsc = this.ctx.createOscillator();
    const starterGain = this.ctx.createGain();
    starterOsc.type = 'sawtooth';
    starterOsc.frequency.setValueAtTime(45, now);
    starterOsc.frequency.linearRampToValueAtTime(150, now + 0.2); // Whir whir
    starterOsc.frequency.exponentialRampToValueAtTime(40, now + 0.4); // Rev settle
    
    starterGain.gain.setValueAtTime(0.001, now);
    starterGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    starterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    starterOsc.connect(starterGain);
    starterGain.connect(this.ctx.destination);
    starterOsc.start(now);
    starterOsc.stop(now + 0.45);

    // 2. Idle thumping triggers after starter completes (0.3s delay)
    const period = 60 / (1100 / 2); // 1100 RPM idle thumping interval (~0.109s)
    
    setTimeout(() => {
      if (!this.isEngineRunning) return;
      
      this.idleInterval = setInterval(() => {
        this._playSingleIdlePop();
      }, period * 1000);
    }, 300);
  }

  stopEngine() {
    this.isEngineRunning = false;
    if (this.idleInterval) {
      clearInterval(this.idleInterval);
      this.idleInterval = null;
    }
  }

  playEngineRev() {
    this.init();
    if (!this.ctx || this.muted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    // Rev sweep: 50Hz -> 180Hz -> 60Hz
    osc.frequency.setValueAtTime(50, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(100, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.15);
    filter.Q.setValueAtTime(2, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }
}

const audio = new MotoCareAudio();
export default audio;
