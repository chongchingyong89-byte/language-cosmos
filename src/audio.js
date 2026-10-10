// Procedural soundscape (Web Audio API, no audio files).
// Ambient: gliding pad chords + filtered "cosmic wind" + sparse star twinkles.
// Interaction: every sound is pitched on C major pentatonic, so any
// combination of clicks stays consonant with the pad underneath.

const PREF_KEY = 'language-cosmos.sound';
const PENTA = [0, 2, 4, 7, 9];
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const penta = (deg, base = 60) => base + 12 * Math.floor(deg / 5) + PENTA[((deg % 5) + 5) % 5];
const rand = (a, b) => a + Math.random() * (b - a);

// Slow progression; pad voices glide from one chord to the next.
const CHORDS = [
  [36, 43, 52, 59, 62], // Cmaj9
  [33, 40, 48, 55, 59], // Am9
  [29, 36, 45, 52, 55], // Fmaj7 (#11 colour from the pentatonic)
  [31, 38, 47, 50, 57], // G6/9
];

function loadPref() {
  try { return JSON.parse(localStorage.getItem(PREF_KEY)) ?? {}; } catch { return {}; }
}
function savePref(p) {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
}

export class SoundScape {
  constructor() {
    const pref = loadPref();
    this.enabled = pref.on ?? true;
    this.volume = pref.vol ?? 0.6;
    this.ctx = null;
    this.lastTick = 0;
    this.lexRange = [1, 1];

    // Browsers only start audio inside a real user gesture. On touch screens
    // that is the finger lifting (pointerup / touchend / click), not
    // pointerdown. Keep listening until audio is running: it can also need
    // waking again after the tab has been in the background.
    const wake = () => {
      if (this.enabled && this.ctx?.state !== 'running') this.#start();
    };
    for (const ev of ['pointerup', 'touchend', 'click', 'keydown']) {
      window.addEventListener(ev, wake, { passive: true });
    }
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx || !this.enabled) return;
      if (document.hidden) this.ctx.suspend(); else this.ctx.resume();
    });
  }

  // ── Controls ─────────────────────────────────────────────────────────────
  setEnabled(on) {
    this.enabled = on;
    savePref({ on, vol: this.volume });
    if (on) {
      this.#start();
      this.#bell(mtof(penta(7)), { gain: 0.12, decay: 2.2 });
    } else if (this.ctx) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(0, t, 0.15);
      clearTimeout(this.twinkleTimer);
      setTimeout(() => { if (!this.enabled) this.ctx.suspend(); }, 800);
    }
  }

  setVolume(v) {
    this.volume = v;
    savePref({ on: this.enabled, vol: v });
    if (this.ctx && this.enabled) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1);
  }

  setLexiconRange(min, max) { this.lexRange = [Math.log(min), Math.log(max)]; }

  // ── Interaction cues ─────────────────────────────────────────────────────
  hover(kind, seed = 0) {
    if (!this.#ready()) return;
    const now = performance.now();
    if (now - this.lastTick < 70) return;
    this.lastTick = now;
    const f = mtof(penta(15 + (seed % 5)));
    this.#blip(f, f * (kind === 'core' ? 1.0 : 1.5), { gain: kind === 'core' ? 0.035 : 0.022, dur: 0.07, verb: 0.35 });
  }

  // Bigger vocabulary → deeper note: large stars ring low.
  selectCore(lexicon) {
    if (!this.#ready()) return;
    const [lo, hi] = this.lexRange;
    const t = hi > lo ? (Math.log(lexicon) - lo) / (hi - lo) : 0.5;
    const deg = Math.round((1 - t) * 9);
    const m = penta(deg, 55);
    this.#whoosh(true, { dur: 1.5, gain: 0.05 });
    this.#bell(mtof(m), { gain: 0.2, decay: 3.2, bright: 0.9 });
    this.#bell(mtof(m - 12), { gain: 0.1, decay: 4, bright: 0.3, when: 0.02 });
    this.#bell(mtof(m + 7), { gain: 0.05, decay: 2.5, bright: 0.6, when: 0.12, pan: 0.4 });
  }

  // Each trait domain has its own note; stronger evidence rings brighter.
  selectLeaf(catIndex, evRank = 2, isConcept = false) {
    if (!this.#ready()) return;
    const f = mtof(penta(catIndex + 5, 60));
    const bright = 0.35 + evRank * 0.18;
    this.#bell(f, { gain: 0.16, decay: 1.8, bright, pan: rand(-0.3, 0.3) });
    if (isConcept) this.#bell(f * 1.5, { gain: 0.07, decay: 2.2, bright: 0.4, when: 0.09, pan: 0.3 });
  }

  bridge() {
    if (!this.#ready()) return;
    this.#whoosh(true, { dur: 2, gain: 0.04 });
    [0, 2, 4, 7].forEach((d, i) => this.#bell(mtof(penta(d + 7, 60)), {
      gain: 0.12 - i * 0.015, decay: 2.6, bright: 0.5, when: i * 0.11, pan: -0.5 + i * 0.33,
    }));
  }

  toggle(on, index = 0) {
    if (!this.#ready()) return;
    const f = mtof(penta(index + 7, 60));
    if (on) this.#blip(f, f * 1.5, { gain: 0.07, dur: 0.18 });
    else this.#blip(f * 1.5, f, { gain: 0.05, dur: 0.18 });
  }

  click() {
    if (!this.#ready()) return;
    this.#blip(mtof(penta(12)), mtof(penta(12)), { gain: 0.045, dur: 0.06, verb: 0.2 });
  }

  sweep() {
    if (!this.#ready()) return;
    [0, 1, 2, 3, 4].forEach((d, i) => this.#bell(mtof(penta(d + 5)), { gain: 0.07, decay: 1.2, bright: 0.4, when: i * 0.07 }));
  }

  overview() {
    if (!this.#ready()) return;
    this.#whoosh(false, { dur: 2.2, gain: 0.07 });
    this.#bell(mtof(48), { gain: 0.12, decay: 5, bright: 0.25 });
    this.#bell(mtof(55), { gain: 0.06, decay: 5, bright: 0.2, when: 0.15 });
  }


  cheer() {
    if (!this.#ready()) return;
    [0, 2, 4, 5, 7, 10].forEach((d, i) => this.#bell(mtof(penta(d + 5, 60)), { gain: 0.11, decay: 1.6, bright: 0.6, when: i * 0.07, pan: -0.6 + i * 0.24 }));
  }

  oops() {
    if (!this.#ready()) return;
    this.#blip(mtof(penta(9)), mtof(penta(5)), { gain: 0.06, dur: 0.3 });
  }

  // A synthetic "ma" whose pitch follows `points` ([t 0..1, Hz] pairs).
  // Used by Tone Detective; plays even when ambient sound is muted, because
  // the player asked to hear it.
  syllable(points, dur = 0.5) {
    if (!this.ctx) this.#build();
    this.ctx.resume();
    const ctx = this.ctx, t0 = ctx.currentTime + 0.03;
    const src = ctx.createOscillator();
    src.type = 'sawtooth';
    src.frequency.setValueAtTime(points[0][1], t0);
    for (const [x, hz] of points.slice(1)) src.frequency.linearRampToValueAtTime(hz, t0 + 0.07 + x * dur);

    // Nasal "m" murmur, then the open vowel "a" (formants ≈ 800 / 1200 / 2600 Hz).
    const nasal = ctx.createBiquadFilter();
    nasal.type = 'lowpass';
    nasal.frequency.value = 350;
    const nasalG = ctx.createGain();
    nasalG.gain.setValueAtTime(0.0001, t0);
    nasalG.gain.exponentialRampToValueAtTime(0.5, t0 + 0.02);
    nasalG.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11);
    src.connect(nasal).connect(nasalG);

    const vowel = ctx.createGain();
    vowel.gain.setValueAtTime(0.0001, t0);
    vowel.gain.exponentialRampToValueAtTime(0.9, t0 + 0.09);
    vowel.gain.setValueAtTime(0.9, t0 + 0.07 + dur * 0.8);
    vowel.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07 + dur + 0.08);
    const sum = ctx.createGain();
    sum.gain.value = 0.32;
    for (const [f, q, g] of [[800, 7, 1], [1200, 9, 0.55], [2600, 12, 0.22]]) {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = f;
      bp.Q.value = q;
      const bg = ctx.createGain();
      bg.gain.value = g * 3;
      src.connect(bp).connect(bg).connect(vowel);
    }
    vowel.connect(sum);
    nasalG.connect(sum);
    sum.connect(this.out);
    src.start(t0);
    src.stop(t0 + dur + 0.25);
    src.onended = () => { src.disconnect(); sum.disconnect(); };
  }

  // ── Engine ───────────────────────────────────────────────────────────────
  #ready() {
    return this.enabled && this.ctx && this.ctx.state === 'running';
  }

  #start() {
    if (!this.ctx) this.#build();
    // iOS Safari only unlocks output once a sound is started inside the gesture.
    const silent = this.ctx.createBufferSource();
    silent.buffer = this.ctx.createBuffer(1, 1, 22050);
    silent.connect(this.ctx.destination);
    silent.start();
    this.ctx.resume();
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(this.volume, t + 3.5);
    this.#scheduleTwinkle();
  }

  #build() {
    const ctx = (this.ctx = new (window.AudioContext || window.webkitAudioContext)());

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -14;
    limiter.ratio.value = 6;
    limiter.attack.value = 0.005;
    limiter.release.value = 0.3;
    limiter.connect(ctx.destination);
    this.out = limiter;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(limiter);

    // Long, dark hall reverb from a synthetic impulse response.
    const verb = ctx.createConvolver();
    verb.buffer = this.#impulse(5.5, 2.6);
    this.verbIn = ctx.createGain();
    const verbOut = ctx.createGain();
    verbOut.gain.value = 0.75;
    this.verbIn.connect(verb).connect(verbOut).connect(this.master);

    this.ambBus = ctx.createGain();
    this.ambBus.gain.value = 0.42;
    this.ambBus.connect(this.master);
    const ambSend = ctx.createGain();
    ambSend.gain.value = 0.6;
    this.ambBus.connect(ambSend).connect(this.verbIn);

    this.fxBus = ctx.createGain();
    this.fxBus.gain.value = 0.9;
    this.fxBus.connect(this.master);

    this.noise = this.#noiseBuffer(3);
    this.#buildPad();
    this.#buildWind();

    this.chordIndex = 0;
    setInterval(() => this.#nextChord(), 22000);
  }

  #impulse(seconds, decay) {
    const rate = this.ctx.sampleRate, len = Math.floor(rate * seconds);
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
    }
    return buf;
  }

  #noiseBuffer(seconds) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  #lfo(rate, depth, target) {
    const o = this.ctx.createOscillator();
    o.frequency.value = rate;
    const g = this.ctx.createGain();
    g.gain.value = depth;
    o.connect(g).connect(target);
    o.start();
  }

  #buildPad() {
    const ctx = this.ctx;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 750;
    filter.Q.value = 0.6;
    this.#lfo(0.03, 420, filter.frequency);
    filter.connect(this.ambBus);

    this.voices = CHORDS[0].map((m, i) => {
      const g = ctx.createGain();
      g.gain.value = 0;
      const pan = ctx.createStereoPanner();
      pan.pan.value = -0.6 + (i / 4) * 1.2;
      const oscs = [['sine', 0], ['triangle', 7], ['sine', -6]].map(([type, cents]) => {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = mtof(m);
        o.detune.value = cents;
        o.connect(g);
        o.start();
        return o;
      });
      this.#lfo(0.045 + i * 0.017, 0.011, g.gain); // slow breathing per voice
      g.gain.setTargetAtTime(i === 0 ? 0.05 : 0.028, ctx.currentTime, 3);
      g.connect(pan).connect(filter);
      return oscs;
    });
  }

  #nextChord() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.chordIndex = (this.chordIndex + 1) % CHORDS.length;
    const t = this.ctx.currentTime;
    CHORDS[this.chordIndex].forEach((m, i) => {
      for (const o of this.voices[i]) o.frequency.setTargetAtTime(mtof(m), t + i * 0.4, 2.5);
    });
  }

  #buildWind() {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 520;
    bp.Q.value = 0.9;
    this.#lfo(0.021, 330, bp.frequency);
    const g = ctx.createGain();
    g.gain.value = 0.05;
    this.#lfo(0.013, 0.02, g.gain);
    const pan = ctx.createStereoPanner();
    this.#lfo(0.017, 0.7, pan.pan);
    src.connect(bp).connect(g).connect(pan).connect(this.ambBus);
    src.start();
  }

  #scheduleTwinkle() {
    clearTimeout(this.twinkleTimer);
    this.twinkleTimer = setTimeout(() => {
      if (!this.enabled) return;
      if (this.ctx.state === 'running') {
        const f = mtof(penta(Math.floor(rand(10, 17)), 60));
        this.#bell(f, { gain: rand(0.025, 0.05), decay: rand(3, 5), bright: 0.3, pan: rand(-0.9, 0.9), verb: 0.95, dry: 0.4 });
      }
      this.#scheduleTwinkle();
    }, rand(2500, 8000));
  }

  // FM bell: sine carrier + decaying modulator + an inharmonic shimmer partial.
  #bell(freq, { when = 0, gain = 0.15, decay = 2.4, bright = 0.6, pan = 0, verb = 0.55, dry = 1 } = {}) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime + when;
    const car = ctx.createOscillator();
    car.frequency.value = freq;
    const mod = ctx.createOscillator();
    mod.frequency.value = freq * 3.01;
    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(freq * 1.4 * bright, t);
    modGain.gain.exponentialRampToValueAtTime(Math.max(freq * 0.02, 0.01), t + decay * 0.45);
    mod.connect(modGain).connect(car.frequency);

    const shimmer = ctx.createOscillator();
    shimmer.frequency.value = freq * 2.76;
    const shGain = ctx.createGain();
    shGain.gain.setValueAtTime(0.0001, t);
    shGain.gain.exponentialRampToValueAtTime(gain * 0.22, t + 0.004);
    shGain.gain.exponentialRampToValueAtTime(0.0001, t + decay * 0.35);

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.006);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + decay);

    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    car.connect(amp);
    shimmer.connect(shGain).connect(amp);
    amp.connect(p);
    const dryG = ctx.createGain();
    dryG.gain.value = dry;
    const send = ctx.createGain();
    send.gain.value = verb;
    p.connect(dryG).connect(this.fxBus);
    p.connect(send).connect(this.verbIn);

    const end = t + decay + 0.1;
    for (const o of [car, mod, shimmer]) { o.start(t); o.stop(end); }
    car.onended = () => { for (const n of [car, mod, shimmer, modGain, shGain, amp, p, dryG, send]) n.disconnect(); };
  }

  #blip(f1, f2, { gain = 0.06, dur = 0.15, verb = 0.4 } = {}) {
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(f2, t + dur * 0.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const send = ctx.createGain();
    send.gain.value = verb;
    o.connect(g);
    g.connect(this.fxBus);
    g.connect(send).connect(this.verbIn);
    o.start(t);
    o.stop(t + dur + 0.05);
    o.onended = () => { o.disconnect(); g.disconnect(); send.disconnect(); };
  }

  #whoosh(up, { dur = 1.4, gain = 0.06 } = {}) {
    const ctx = this.ctx, t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.6;
    const [a, b] = up ? [260, 2600] : [2400, 220];
    bp.frequency.setValueAtTime(a, t);
    bp.frequency.exponentialRampToValueAtTime(b, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.45);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = ctx.createStereoPanner();
    p.pan.setValueAtTime(up ? -0.5 : 0.5, t);
    p.pan.linearRampToValueAtTime(up ? 0.5 : -0.5, t + dur);
    const send = ctx.createGain();
    send.gain.value = 0.6;
    src.connect(bp).connect(g).connect(p);
    p.connect(this.fxBus);
    p.connect(send).connect(this.verbIn);
    src.start(t);
    src.stop(t + dur + 0.05);
    src.onended = () => { for (const n of [src, bp, g, p, send]) n.disconnect(); };
  }
}
