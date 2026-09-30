/**
 * Web Audio API Sound Synthesizer for "Don't Wake the Ghost"
 * Pure browser-synthesized atmospheric sound effects and dynamic horror tension.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.75;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private windOsc: OscillatorNode | null = null;
  private droneOsc: OscillatorNode | null = null;
  private heartbeatTimer: number | null = null;
  private lastFootstepTime: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.startAmbience();
      }
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public enableAudio() {
    this.initContext();
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Continuous subtle horror wind / low drone
   */
  private startAmbience() {
    if (!this.ctx || !this.masterGain) return;

    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // Low hollow wind noise using bandpass-filtered noise + oscillator
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);
      filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.ambientGain);
      whiteNoise.start();

      // Deep harmonic sub-drone
      this.droneOsc = this.ctx.createOscillator();
      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      this.droneOsc.connect(droneGain);
      droneGain.connect(this.masterGain);
      this.droneOsc.start();
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Footstep sound (crouch is whisper quiet, run is louder and sharper)
   */
  public playFootstep(isRunning: boolean, isCrouching: boolean) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = Date.now();
    const interval = isRunning ? 260 : isCrouching ? 520 : 380;
    if (now - this.lastFootstepTime < interval) return;
    this.lastFootstepTime = now;

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = isCrouching ? 80 : isRunning ? 120 : 95;
    const vol = isCrouching ? 0.025 : isRunning ? 0.09 : 0.05;
    const duration = isRunning ? 0.07 : 0.05;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq + (Math.random() * 20 - 10), ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + duration);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(ctx.currentTime + duration);

    // Occasional subtle floorboard creak on run or random walk
    if (isRunning || Math.random() < 0.15) {
      this.playWoodCreak(isCrouching ? 0.02 : 0.06);
    }
  }

  public playWoodCreak(volume = 0.06) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const startFreq = 220 + Math.random() * 80;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(startFreq - 60, ctx.currentTime + 0.12);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  /**
   * Jump & Land sounds
   */
  public playJump() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(190, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  public playLand() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);

    this.playWoodCreak(0.08);
  }

  /**
   * Heavy dragging / pushing sound for crates and chairs
   */
  public playScrape() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70 + Math.random() * 20, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.1);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  /**
   * Door opening or closing
   */
  public playDoor(open: boolean) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;

    // Squeak
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(open ? 180 : 320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(open ? 360 : 120, ctx.currentTime + 0.25);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);

    // Latch click
    setTimeout(() => {
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(600, this.ctx.currentTime);
      clickGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      click.connect(clickGain);
      clickGain.connect(this.masterGain);
      click.start();
      click.stop(this.ctx.currentTime + 0.06);
    }, 150);
  }

  /**
   * Clock / Bell Toll for Caretaker's arrival or clock chiming
   */
  public playBellToll() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;

    [110, 164.8, 220, 277].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, ctx.currentTime + 2.4);

      gain.gain.setValueAtTime(0.12 / (idx + 1), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.6);
    });
  }

  /**
   * Wardrobe / cabinet hide sound
   */
  public playHide(entering: boolean) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    this.playDoor(entering);
  }

  /**
   * Item pickup chime
   */
  public playPickup() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;
    
    // Gentle dual harmonic chime
    [440, 660, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(ctx.currentTime + idx * 0.06);
      osc.stop(ctx.currentTime + idx * 0.06 + 0.36);
    });
  }

  /**
   * Key unlock / puzzle solved
   */
  public playUnlock() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;

    [300, 480, 720].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.42);
    });
  }

  /**
   * Flashlight click
   */
  public playFlashlight() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  }

  /**
   * Distraction throw / shatter
   */
  public playDistractionShatter() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;

    // Sharp ceramic clatter & resonance
    const bufferSize = ctx.sampleRate * 0.35;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(900, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();

    // Metallic chime ringing after shatter
    const ring = ctx.createOscillator();
    const ringGain = ctx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(1400, ctx.currentTime);
    ringGain.gain.setValueAtTime(0.12, ctx.currentTime);
    ringGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    ring.connect(ringGain);
    ringGain.connect(this.masterGain);
    ring.start();
    ring.stop(ctx.currentTime + 0.6);
  }

  /**
   * Monster heavy footsteps
   */
  public playMonsterStep(distanceFactor: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;
    
    // distanceFactor: 1 is very close, 0 is far away
    const volume = Math.max(0.02, Math.min(0.28, distanceFactor * 0.28));
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.26);

    // Eerie low creak with monster weight
    if (Math.random() < 0.6) {
      this.playWoodCreak(volume * 0.7);
    }
  }

  /**
   * Monster alert / growl / breath
   */
  public playMonsterAlert() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.35);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(4.0, ctx.currentTime);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.52);
  }

  /**
   * Heartbeat for tension during monster chase or proximity
   */
  public playHeartbeat(bpm: number = 80, intensity: number = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;

    // Double beat: lub-dub
    const vol = Math.min(0.22, intensity * 0.22);

    const beat1 = () => {
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    };

    const beat2 = () => {
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(vol * 0.7, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    };

    beat1();
    setTimeout(beat2, 140);
  }

  /**
   * Game Over sting
   */
  public playGameOver() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;

    // Low dark dissonant cluster
    [65, 69, 78, 110].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq - 15, ctx.currentTime + 1.2);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    });
  }

  /**
   * Ominous door rattling and iron latch clicking from outside
   */
  public playDoorRattle() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;

    // Heavy wooden thuds and iron metallic clatter
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.12;

      // Heavy wood knock
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(85, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + delay + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.13);

      // Iron latch rattle noise
      const bufferSize = ctx.sampleRate * 0.08;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.02));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, ctx.currentTime + delay);
      filter.Q.setValueAtTime(4.0, ctx.currentTime + delay);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.12, ctx.currentTime + delay);
      nGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.08);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.masterGain!);
      noise.start(ctx.currentTime + delay);
    }
  }

  /**
   * Escape / Victory chord
   */
  public playVictory() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;

    // Uplifting resonant chime sequence
    [261.6, 329.6, 392.0, 523.25, 659.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.2 + 1.8);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(ctx.currentTime + idx * 0.2);
      osc.stop(ctx.currentTime + idx * 0.2 + 2.0);
    });
  }
}

export const soundEngine = new SoundEngine();
