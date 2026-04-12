/**
 * Generates click.mp3 using lamejs (pure-JS MP3 encoder).
 * Run with: node generate-click-mp3.cjs
 */

const fs   = require('fs');
const path = require('path');
const lamejs = require('lamejs');

const SAMPLE_RATE = 44100;
const DURATION    = 0.06; // seconds
const NUM_SAMPLES = Math.floor(SAMPLE_RATE * DURATION);

// Generate PCM samples (click: high-freq tap with exponential decay)
const pcm = new Int16Array(NUM_SAMPLES);
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t   = i / SAMPLE_RATE;
  const env = Math.exp(-t * 80);
  const tone = Math.sin(2 * Math.PI * 1200 * t) * 0.5
             + Math.sin(2 * Math.PI * 2400 * t) * 0.25;
  const sample = tone * env * 0.6;
  pcm[i] = Math.round(Math.max(-1, Math.min(1, sample)) * 32767);
}

// Encode to MP3 (mono, 128 kbps)
const encoder    = new lamejs.Mp3Encoder(1, SAMPLE_RATE, 128);
const chunkSize  = 1152; // lamejs requires multiples of 1152
const mp3Chunks  = [];

for (let offset = 0; offset < NUM_SAMPLES; offset += chunkSize) {
  const chunk    = pcm.subarray(offset, offset + chunkSize);
  const mp3Buf   = encoder.encodeBuffer(chunk);
  if (mp3Buf.length > 0) mp3Chunks.push(Buffer.from(mp3Buf));
}

const flush = encoder.flush();
if (flush.length > 0) mp3Chunks.push(Buffer.from(flush));

const outPath = path.join(__dirname, 'click.mp3');
fs.writeFileSync(outPath, Buffer.concat(mp3Chunks));

const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`Created click.mp3 (${kb} KB)`);
