/**
 * Seebird AI - Web Audio Procedural Bird Song Synthesizer
 * Synthesizes realistic bird calls, chirps, whistles, and hoots natively using the Web Audio API.
 */

class BirdAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(bird) {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const soundType = bird.soundType || 'whistle';
    const params = bird.soundParams || { freqs: [2000, 2500], duration: 1.0, rate: 0.2 };

    switch (soundType) {
      case 'whistle':
      case 'warble':
        this.synthWhistle(now, params);
        break;
      case 'trill':
      case 'chitter':
      case 'piping':
        this.synthTrill(now, params);
        break;
      case 'chirp':
        this.synthChirp(now, params);
        break;
      case 'hoot':
      case 'croak':
      case 'growl':
        this.synthLowHoot(now, params);
        break;
      case 'screech':
      case 'shrill':
        this.synthScreech(now, params);
        break;
      case 'quack':
      case 'honk':
        this.synthQuack(now, params);
        break;
      case 'drum':
        this.synthDrum(now, params);
        break;
      default:
        this.synthWhistle(now, params);
    }
  }

  synthWhistle(startTime, params) {
    const freqs = params.freqs || [1800, 2200, 1900];
    const duration = params.duration || 1.2;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';

    // Frequency modulation
    osc.frequency.setValueAtTime(freqs[0], startTime);
    const step = duration / freqs.length;
    freqs.forEach((f, idx) => {
      osc.frequency.exponentialRampToValueAtTime(Math.max(100, f), startTime + (idx + 1) * step);
    });

    // Gentle vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(8, startTime);
    lfoGain.gain.setValueAtTime(60, startTime);
    lfo.connect(osc.frequency);
    lfo.start(startTime);
    lfo.stop(startTime + duration);

    // Envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.1);
    gain.gain.linearRampToValueAtTime(0.2, startTime + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  synthTrill(startTime, params) {
    const freqs = params.freqs || [3200, 4200];
    const pulses = 7;
    const pulseLen = 0.12;

    for (let i = 0; i < pulses; i++) {
      const pStart = startTime + i * (pulseLen + 0.04);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const f1 = freqs[i % freqs.length];
      const f2 = freqs[(i + 1) % freqs.length];

      osc.frequency.setValueAtTime(f1, pStart);
      osc.frequency.exponentialRampToValueAtTime(f2, pStart + pulseLen);

      gain.gain.setValueAtTime(0.001, pStart);
      gain.gain.linearRampToValueAtTime(0.25, pStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, pStart + pulseLen);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(pStart);
      osc.stop(pStart + pulseLen);
    }
  }

  synthChirp(startTime, params) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2600, startTime);
    osc.frequency.exponentialRampToValueAtTime(4500, startTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(3100, startTime + 0.22);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.26);
  }

  synthLowHoot(startTime, params) {
    const freqs = params.freqs || [380, 290];
    const duration = params.duration || 1.4;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqs[0], startTime);
    osc.frequency.exponentialRampToValueAtTime(freqs[1], startTime + duration * 0.5);
    osc.frequency.linearRampToValueAtTime(freqs[0] * 0.9, startTime + duration);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.4, startTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  synthScreech(startTime, params) {
    const osc = this.ctx.createOscillator();
    const noiseOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, startTime);
    osc.frequency.exponentialRampToValueAtTime(2200, startTime + 0.4);
    osc.frequency.exponentialRampToValueAtTime(900, startTime + 0.9);

    noiseOsc.type = 'square';
    noiseOsc.frequency.setValueAtTime(45, startTime);

    gain.gain.setValueAtTime(0.01, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.9);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.95);
  }

  synthQuack(startTime, params) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, startTime);
    osc.frequency.linearRampToValueAtTime(240, startTime + 0.4);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, startTime);
    filter.Q.setValueAtTime(4, startTime);

    gain.gain.setValueAtTime(0.01, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.5);
  }

  synthDrum(startTime, params) {
    const strikes = 10;
    const step = 0.06;

    for (let i = 0; i < strikes; i++) {
      const sStart = startTime + i * step;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, sStart);
      osc.frequency.exponentialRampToValueAtTime(80, sStart + 0.04);

      gain.gain.setValueAtTime(0.3, sStart);
      gain.gain.exponentialRampToValueAtTime(0.001, sStart + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(sStart);
      osc.stop(sStart + 0.05);
    }
  }
}

// Global instance
window.birdAudio = new BirdAudioSynthesizer();
