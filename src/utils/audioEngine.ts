/**
 * Procedural Motorcycle Engine Sound Synthesizer using Web Audio API
 * Generates realistic high-performance engine rumble, idle, throttle revs, and limiter pops
 */

class MotorcycleAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private oscLow: OscillatorNode | null = null;
  private oscMid: OscillatorNode | null = null;
  private oscHigh: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private distortion: WaveShaperNode | null = null;
  private currentRpm = 1400; // idle RPM
  private targetRpm = 1400;
  private animFrameId: number | null = null;

  private makeDistortionCurve(amount = 20) {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public init() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtxClass();
  }

  public start(engineType: string = 'v4') {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isRunning) {
      this.stop();
    }

    this.isRunning = true;
    this.currentRpm = 1400;
    this.targetRpm = 1400;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.28, this.ctx.currentTime + 0.4);

    // Distortion
    this.distortion = this.ctx.createWaveShaper();
    this.distortion.curve = this.makeDistortionCurve(35);
    this.distortion.oversample = '4x';

    // Low-Pass Exhaust Filter
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    // Primary firing oscillators (simulating cylinder combustions)
    const baseFreq = engineType.toLowerCase().includes('v4') ? 35 : 28;

    this.oscLow = this.ctx.createOscillator();
    this.oscLow.type = 'sawtooth';
    this.oscLow.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    this.oscMid = this.ctx.createOscillator();
    this.oscMid.type = 'triangle';
    this.oscMid.frequency.setValueAtTime(baseFreq * 2.01, this.ctx.currentTime);

    this.oscHigh = this.ctx.createOscillator();
    this.oscHigh.type = 'sawtooth';
    this.oscHigh.frequency.setValueAtTime(baseFreq * 3.98, this.ctx.currentTime);

    const oscMix = this.ctx.createGain();
    oscMix.gain.value = 0.6;

    this.oscLow.connect(oscMix);
    this.oscMid.connect(oscMix);
    this.oscHigh.connect(oscMix);

    oscMix.connect(this.distortion);
    this.distortion.connect(this.filter);
    this.filter.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.oscLow.start();
    this.oscMid.start();
    this.oscHigh.start();

    this.startRpmLoop();
  }

  private startRpmLoop() {
    const update = () => {
      if (!this.isRunning || !this.ctx) return;

      // Smooth lerp to target RPM
      this.currentRpm += (this.targetRpm - this.currentRpm) * 0.12;

      // Base cylinder frequency proportional to RPM
      // 4-stroke: RPM / 60 * (cylinders / 2)
      const freq = (this.currentRpm / 60) * 1.5;

      const t = this.ctx.currentTime;
      if (this.oscLow) this.oscLow.frequency.setValueAtTime(Math.max(20, freq), t);
      if (this.oscMid) this.oscMid.frequency.setValueAtTime(Math.max(40, freq * 2.02), t);
      if (this.oscHigh) this.oscHigh.frequency.setValueAtTime(Math.max(80, freq * 4.04), t);

      if (this.filter) {
        const filterFreq = 300 + (this.currentRpm / 12000) * 2800;
        this.filter.frequency.setValueAtTime(filterFreq, t);
      }

      this.animFrameId = requestAnimationFrame(update);
    };

    this.animFrameId = requestAnimationFrame(update);
  }

  public revThrottle() {
    if (!this.isRunning) {
      this.start();
    }
    // High rev burst
    this.targetRpm = 9500 + Math.random() * 2000;
    setTimeout(() => {
      if (this.isRunning) {
        this.targetRpm = 1400; // settle back to idle
      }
    }, 1200);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      } catch {
        // ignore
      }
    }
    setTimeout(() => {
      if (this.oscLow) {
        try { this.oscLow.stop(); } catch {}
        this.oscLow.disconnect();
      }
      if (this.oscMid) {
        try { this.oscMid.stop(); } catch {}
        this.oscMid.disconnect();
      }
      if (this.oscHigh) {
        try { this.oscHigh.stop(); } catch {}
        this.oscHigh.disconnect();
      }
      if (this.noiseNode) {
        try { this.noiseNode.stop(); } catch {}
        this.noiseNode.disconnect();
      }
    }, 350);
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }
}

export const audioEngine = new MotorcycleAudioEngine();
