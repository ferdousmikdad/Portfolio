/**
 * Generates macOS-style UI sound effects as WAV files.
 * Run with: node generate.cjs
 *
 * One extra step for the chime only: it is 2.4s long, which is ~207 KB as
 * 16-bit PCM, so it ships as AAC instead (~15 KB, no audible loss):
 *
 *   node generate.cjs
 *   afconvert -f m4af -d aac -b 96000 chime.wav chime.m4a
 *   cp chime.m4a ../../../public/sounds/
 *
 * The intermediate chime.wav is not kept — it is reproducible from here.
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const NUM_CHANNELS = 1;
const BITS_PER_SAMPLE = 16;

function writeWav(filename, samples) {
  const dataLength = samples.length * 2; // 16-bit = 2 bytes per sample
  const buffer = Buffer.alloc(44 + dataLength);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);         // chunk size
  buffer.writeUInt16LE(1, 20);          // PCM format
  buffer.writeUInt16LE(NUM_CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8), 28);
  buffer.writeUInt16LE(NUM_CHANNELS * (BITS_PER_SAMPLE / 8), 32);
  buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  // Audio samples
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  fs.writeFileSync(path.join(__dirname, filename), buffer);
  console.log(`Created ${filename} (${samples.length} samples, ${(dataLength / 1024).toFixed(1)} KB)`);
}

function envelope(t, attack, decay, sustain, release, total) {
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1 - (1 - sustain) * ((t - attack) / decay);
  if (t < total - release) return sustain;
  return sustain * (1 - (t - (total - release)) / release);
}

// ── click ─────────────────────────────────────────────────────────────────────
// Short crisp tap: high-freq click + soft body
function generateClick() {
  const duration = 0.06;
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 80);
    const tone = Math.sin(2 * Math.PI * 1200 * t) * 0.5
               + Math.sin(2 * Math.PI * 2400 * t) * 0.25;
    samples[i] = tone * env * 0.6;
  }
  writeWav('click.wav', samples);
}

// ── open ──────────────────────────────────────────────────────────────────────
// Gentle rising chime: two partials sweeping up
function generateOpen() {
  const duration = 0.22;
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = envelope(t, 0.01, 0.06, 0.4, 0.12, duration);
    const f1 = 660 + 220 * (t / duration);
    const f2 = 880 + 330 * (t / duration);
    const tone = Math.sin(2 * Math.PI * f1 * t) * 0.5
               + Math.sin(2 * Math.PI * f2 * t) * 0.25;
    samples[i] = tone * env * 0.55;
  }
  writeWav('open.wav', samples);
}

// ── close ─────────────────────────────────────────────────────────────────────
// Falling, brief dismissal tone
function generateClose() {
  const duration = 0.18;
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = envelope(t, 0.005, 0.04, 0.2, 0.1, duration);
    const f1 = 800 - 300 * (t / duration);
    const f2 = 600 - 200 * (t / duration);
    const tone = Math.sin(2 * Math.PI * f1 * t) * 0.5
               + Math.sin(2 * Math.PI * f2 * t) * 0.3;
    samples[i] = tone * env * 0.5;
  }
  writeWav('close.wav', samples);
}

// ── minimize ──────────────────────────────────────────────────────────────────
// Quick descending whoosh
function generateMinimize() {
  const duration = 0.14;
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 30);
    const f = 700 * Math.pow(0.3, t / duration);
    const tone = Math.sin(2 * Math.PI * f * t) * 0.6
               + Math.sin(2 * Math.PI * f * 2 * t) * 0.2;
    samples[i] = tone * env * 0.5;
  }
  writeWav('minimize.wav', samples);
}

// ── notification ──────────────────────────────────────────────────────────────
// Two-note ding: clean bell-like chime
function generateNotification() {
  const duration = 0.45;
  const n = Math.floor(SAMPLE_RATE * duration);
  const samples = new Array(n);

  // first note at 0s, second at 0.18s
  const note1Start = 0;
  const note2Start = 0.18;

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Note 1 — 880 Hz
    if (t >= note1Start) {
      const nt = t - note1Start;
      const env = Math.exp(-nt * 14);
      s += Math.sin(2 * Math.PI * 880 * nt) * env * 0.45
         + Math.sin(2 * Math.PI * 1760 * nt) * env * 0.15;
    }

    // Note 2 — 1100 Hz
    if (t >= note2Start) {
      const nt = t - note2Start;
      const env = Math.exp(-nt * 14);
      s += Math.sin(2 * Math.PI * 1100 * nt) * env * 0.45
         + Math.sin(2 * Math.PI * 2200 * nt) * env * 0.15;
    }

    samples[i] = Math.max(-1, Math.min(1, s));
  }
  writeWav('notification.wav', samples);
}

/**
 * Power-on chime.
 *
 * Deliberately an original composition, not a copy of Apple's startup sound —
 * that chime is a registered trademark and has no business being bundled into
 * a portfolio. This is a plain G-major spread (G3 · B3 · D4 · G4) with the
 * voices struck a few milliseconds apart, a soft attack and a long decay, so
 * it reads as "machine waking up" without borrowing anything.
 */
function generateChime() {
  const duration = 2.4;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));

  // G major, low to high. The tiny stagger stops it sounding like an organ
  // stab — real struck chords never land perfectly together.
  const voices = [
    { freq: 196.00, delay: 0.000, gain: 0.30 },
    { freq: 246.94, delay: 0.012, gain: 0.26 },
    { freq: 293.66, delay: 0.024, gain: 0.24 },
    { freq: 392.00, delay: 0.036, gain: 0.20 },
  ];

  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    for (const v of voices) {
      if (t < v.delay) continue;
      const nt = t - v.delay;
      // 25ms attack, then an exponential tail. Slow enough that the onset is
      // a swell rather than a click.
      const attack = Math.min(1, nt / 0.025);
      const decay = Math.exp(-nt * 1.5);
      const env = attack * decay;
      // Second and third harmonics, each quieter — a little body without
      // turning it into a sawtooth.
      s += Math.sin(2 * Math.PI * v.freq * nt) * env * v.gain
         + Math.sin(2 * Math.PI * v.freq * 2 * nt) * env * v.gain * 0.22
         + Math.sin(2 * Math.PI * v.freq * 3 * nt) * env * v.gain * 0.08;
    }

    // Gentle fade to silence so the tail never cuts off on a non-zero sample.
    const fade = t > duration - 0.3 ? (duration - t) / 0.3 : 1;
    samples[i] = Math.max(-1, Math.min(1, s * fade));
  }
  writeWav('chime.wav', samples);
}

generateClick();
generateOpen();
generateClose();
generateMinimize();
generateNotification();
generateChime();

console.log('All sounds generated!');
