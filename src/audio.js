// INTAKE — synthesized audio. No external assets.
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.ambient = null;
    this.ambientGain = null;
    this.heartbeatTimer = null;
    this.enabled = false;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.55;
    this.master.connect(this.ctx.destination);
    this.enabled = true;
    this.startAmbient();
  }

  now() { return this.ctx ? this.ctx.currentTime : 0; }

  makeNoise(duration = 0.3) {
    const rate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, Math.max(1, Math.floor(rate * duration)), rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  noise({ duration = 0.2, gain = 0.2, type = "bandpass", freq = 1200, q = 0.8, delay = 0, pan = 0 }) {
    if (!this.enabled) return;
    const t = this.now() + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.makeNoise(duration);
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) { panner.pan.value = pan; src.connect(filter).connect(g).connect(panner).connect(this.master); }
    else src.connect(filter).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + duration + 0.02);
  }

  tone({ freq = 220, endFreq = freq, duration = 0.5, type = "sine", gain = 0.1, delay = 0, pan = 0 }) {
    if (!this.enabled) return;
    const t = this.now() + delay;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t + duration);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) { panner.pan.value = pan; osc.connect(g).connect(panner).connect(this.master); }
    else osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  startAmbient() {
    if (!this.ctx || this.ambient) return;
    const g = this.ctx.createGain();
    g.gain.value = 0.0001;
    g.gain.exponentialRampToValueAtTime(0.06, this.now() + 2.0);
    g.connect(this.master);
    this.ambientGain = g;

    const osc1 = this.ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 38;
    const osc2 = this.ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.value = 57;
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.07;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 4;
    lfo.connect(lfoGain).connect(osc1.frequency);
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 180;
    const n = this.ctx.createBufferSource();
    n.buffer = this.makeNoise(4);
    n.loop = true;
    const nf = this.ctx.createBiquadFilter();
    nf.type = "bandpass";
    nf.frequency.value = 420;
    nf.Q.value = 0.6;
    const ng = this.ctx.createGain();
    ng.gain.value = 0.035;
    n.connect(nf).connect(ng).connect(g);
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(g);
    osc1.start(); osc2.start(); lfo.start(); n.start();
    this.ambient = { osc1, osc2, lfo, n };
  }

  setAmbient(level = 0.06) {
    if (!this.ambientGain) return;
    this.ambientGain.gain.setTargetAtTime(level, this.now(), 0.6);
  }

  setMaster(level = 0.55) {
    if (!this.master) return;
    this.master.gain.setTargetAtTime(level, this.now(), 0.2);
  }

  ui() {
    this.tone({ freq: 220, endFreq: 160, duration: 0.06, type: "square", gain: 0.035 });
  }

  step(strong = false) {
    this.noise({ duration: 0.09, gain: strong ? 0.09 : 0.045, type: "lowpass", freq: strong ? 260 : 420, q: 0.4 });
    this.noise({ duration: 0.04, gain: strong ? 0.035 : 0.02, type: "highpass", freq: 1200 });
  }

  metal() {
    this.noise({ duration: 0.18, gain: 0.11, type: "bandpass", freq: 1600, q: 2.2 });
    this.noise({ duration: 0.08, gain: 0.06, type: "highpass", freq: 3200, delay: 0.04 });
    this.tone({ freq: 180, endFreq: 70, duration: 0.12, type: "triangle", gain: 0.025 });
  }

  alarm(duration = 3.2) {
    const n = Math.floor(duration / 0.5);
    for (let i = 0; i < n; i++) {
      this.tone({ freq: 620, endFreq: 580, duration: 0.22, type: "square", gain: 0.05, delay: i * 0.5 });
      this.tone({ freq: 430, endFreq: 400, duration: 0.22, type: "square", gain: 0.04, delay: i * 0.5 + 0.25 });
    }
  }

  heartbeat(intensity = 0.1) {
    this.tone({ freq: 54, endFreq: 38, duration: 0.13, type: "sine", gain: intensity });
    this.tone({ freq: 48, endFreq: 34, duration: 0.12, type: "sine", gain: intensity * 0.8, delay: 0.18 });
  }

  whisper() {
    this.noise({ duration: 0.65, gain: 0.03, type: "bandpass", freq: 900, q: 3.5, pan: Math.random() * 1.6 - 0.8 });
    this.noise({ duration: 0.32, gain: 0.02, type: "bandpass", freq: 1700, q: 5, delay: 0.18, pan: Math.random() * 1.6 - 0.8 });
  }

  scrape() {
    this.noise({ duration: 0.4, gain: 0.075, type: "bandpass", freq: 2200, q: 1.4 });
    this.noise({ duration: 0.25, gain: 0.05, type: "bandpass", freq: 900, q: 2, delay: 0.12 });
  }

  scream() {
    this.tone({ freq: 980, endFreq: 140, duration: 0.55, type: "sawtooth", gain: 0.11 });
    this.tone({ freq: 1440, endFreq: 220, duration: 0.48, type: "square", gain: 0.045 });
    this.noise({ duration: 0.6, gain: 0.11, type: "highpass", freq: 900, q: 0.5 });
  }

  gunshot() {
    this.noise({ duration: 0.13, gain: 0.2, type: "highpass", freq: 700, q: 0.5 });
    this.noise({ duration: 0.35, gain: 0.09, type: "lowpass", freq: 180, q: 0.7 });
    this.tone({ freq: 100, endFreq: 40, duration: 0.18, type: "triangle", gain: 0.08 });
  }

  click() {
    this.noise({ duration: 0.03, gain: 0.05, type: "highpass", freq: 2200 });
    this.tone({ freq: 900, endFreq: 500, duration: 0.03, type: "square", gain: 0.02 });
  }

  flash() {
    this.noise({ duration: 0.45, gain: 0.13, type: "highpass", freq: 1200 });
    this.tone({ freq: 70, endFreq: 25, duration: 0.7, type: "sine", gain: 0.1 });
  }

  rat() {
    this.tone({ freq: 1800, endFreq: 900, duration: 0.08, type: "sawtooth", gain: 0.035 });
    this.noise({ duration: 0.16, gain: 0.055, type: "bandpass", freq: 2500, q: 3 });
  }

  boom() {
    this.tone({ freq: 80, endFreq: 18, duration: 1.3, type: "sine", gain: 0.22 });
    this.noise({ duration: 0.8, gain: 0.12, type: "lowpass", freq: 220 });
  }

  beacon() {
    this.tone({ freq: 440, endFreq: 440, duration: 0.5, type: "sine", gain: 0.02 });
    this.tone({ freq: 660, endFreq: 660, duration: 0.5, type: "sine", gain: 0.012, delay: 0.18 });
  }

  stopAll() {
    if (this.master) this.master.gain.setTargetAtTime(0.0001, this.now(), 0.2);
  }
}
