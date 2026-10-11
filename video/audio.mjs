// A simple original score, synthesised sample by sample from the beats in timeline.mjs:
// a rising shimmer into the flip, a soft bell on every reveal, a low pulse under the problem,
// and a warm pad once the candle lights. No samples, nothing copyrighted.
import { writeFileSync, mkdirSync } from "node:fs";
import { DURATION, T, landAt } from "./timeline.mjs";

const SR = 48000;
const N = Math.round(SR * DURATION);
const Lch = new Float32Array(N), Rch = new Float32Array(N);
const hz = (n) => 440 * 2 ** ((n - 69) / 12); // MIDI note to Hz
const add = (i, l, r = l) => { if (i >= 0 && i < N) { Lch[i] += l; Rch[i] += r; } };

function bell(at, note, gain = 0.25, decay = 2.6, pan = 0) {
  const f = hz(note);
  const parts = [[1, 1], [2, 0.45], [3, 0.2], [4.2, 0.1], [5.4, 0.05]];
  const s0 = Math.round(at * SR);
  for (let i = 0; i < SR * (decay + 0.5); i++) {
    const t = i / SR;
    let v = 0;
    for (const [m, g] of parts) v += g * Math.sin(2 * Math.PI * f * m * t) * Math.exp((-t * 3 * m ** 0.6) / decay);
    v *= gain * Math.min(1, t / 0.004);
    add(s0 + i, v * (1 - pan) * 0.8, v * (1 + pan) * 0.8);
  }
}
function boom(at, gain = 0.5, f0 = 90, f1 = 38, len = 1.2) {
  const s0 = Math.round(at * SR);
  let ph = 0;
  for (let i = 0; i < SR * len; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (f1 + (f0 - f1) * Math.exp(-t * 9))) / SR;
    add(s0 + i, gain * Math.sin(ph) * Math.exp(-t * (4 / len)) * Math.min(1, t / 0.003));
  }
}
function tick(at, gain = 0.08, f = 1500) {
  const s0 = Math.round(at * SR);
  for (let i = 0; i < SR * 0.06; i++) { const t = i / SR; add(s0 + i, gain * Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 70)); }
}
// Sustained chord with a slow swell, gently detuned for warmth.
function pad(from, to, notes, gain = 0.05, attack = 1.2, release = 1.2) {
  const s0 = Math.round(from * SR), s1 = Math.round((to + release) * SR);
  for (let i = s0; i < s1 && i < N; i++) {
    const t = i / SR;
    const env = Math.min(1, (t - from) / attack) * (t > to ? Math.max(0, 1 - (t - to) / release) : 1);
    let l = 0, r = 0;
    for (const n of notes) {
      const f = hz(n);
      l += Math.sin(2 * Math.PI * f * 0.998 * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t);
      r += Math.sin(2 * Math.PI * f * 1.002 * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t + 1);
    }
    const lfo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.2 * t);
    add(i, (l * gain * env * lfo) / notes.length, (r * gain * env * lfo) / notes.length);
  }
}
// The shimmer that rises into a reveal: a sweeping tone, an accelerating tremolo and airy noise.
function riser(from, to, gain = 0.12, f0 = 220, f1 = 880) {
  const s0 = Math.round(from * SR), s1 = Math.round(to * SR);
  let ph = 0, lp = 0, seed = 1;
  for (let i = s0; i < s1; i++) {
    const p = (i - s0) / (s1 - s0);
    ph += (2 * Math.PI * f0 * (f1 / f0) ** p) / SR;
    seed = (seed * 16807) % 2147483647;
    const noise = (seed / 2147483647) * 2 - 1;
    lp += 0.25 * (noise - lp);
    const trem = 0.6 + 0.4 * Math.sin(2 * Math.PI * (4 + 26 * p * p) * (i / SR));
    const env = p ** 2.2;
    add(i, gain * env * (0.7 * Math.sin(ph) * trem + 0.5 * (noise - lp)), gain * env * (0.7 * Math.sin(ph + 0.4) * trem + 0.5 * (lp - noise)));
  }
}

// 0–9 s: the cold open and the hook (C major, D-led)
pad(0, T.pullBack + 0.6, [36, 43], 0.06, 0.05, 0.5);
riser(0, T.flip, 0.16);
bell(T.flip, 72, 0.32, 3.2);
bell(T.flip + 0.01, 79, 0.12, 2.4, 0.3);
boom(T.flip, 0.45);
boom(T.slam, 0.35, 120, 50, 0.6);
const notes = [74, 76, 79, 81];
T.spins.forEach((s, i) => {
  tick(s.at, 0.07, 1300 + i * 150);
  tick(s.at + s.dur * 0.4, 0.05, 1600 + i * 150);
  bell(landAt(s), notes[i], 0.22, 2.0, i % 2 ? 0.25 : -0.25);
});
[72, 76, 79, 84, 88].forEach((n, i) => bell(T.pullBack + i * 0.06, n, 0.12, 1.8, -0.4 + i * 0.2));
boom(T.pullBack, 0.3, 70, 35, 0.8);

// 9–19 s: the problem. One low pulse, nothing else.
for (let t = T.pulse.from; t < T.pulse.to - 0.1; t += T.pulse.every) boom(t, 0.42, 62, 44, 0.7);

// 19–33 s: the candle and the warmth
bell(T.candle, 91, 0.08, 2.5);
pad(T.flood, T.faith - 0.3, [48, 55, 64, 72], 0.1, 2.0, 0.6);
pad(T.flood + 0.5, T.faith - 0.3, [36], 0.06, 2.5, 0.6);
bell(T.title, 72, 0.18, 3.0);
T.callouts.forEach((c, i) => bell(c.at, [84, 86, 88, 91, 93][i], 0.08, 1.4, i % 2 ? 0.4 : -0.4));

// 33–41 s: the lanterns (Am, F, C)
pad(T.faith, T.faithLines[2].at, [45, 52, 60, 64], 0.06, 0.6, 0.8);
pad(T.faithLines[2].at, T.quote, [41, 48, 57, 60], 0.06, 0.8, 0.8);
pad(T.quote, T.rush + 0.4, [48, 55, 64, 67], 0.06, 0.8, 0.5);
T.faithLines.forEach((l, i) => bell(l.at, [76, 79, 81][i], 0.12, 2.4));
bell(T.quote, 72, 0.14, 3.0);

// 41–45 s: into the light
riser(T.rush, T.bloom, 0.16, 330, 1320);
bell(T.bloom, 72, 0.3, 3.4);
bell(T.bloom + 0.02, 76, 0.16, 3.2, -0.3);
bell(T.bloom + 0.04, 79, 0.16, 3.2, 0.3);
boom(T.bloom, 0.45, 80, 36, 1.4);
pad(T.bloom, DURATION - 1.6, [36, 48, 55, 64, 67], 0.07, 0.3, 1.5);

// Normalise to -1 dBFS and write a 16-bit stereo WAV of exactly DURATION seconds.
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(Lch[i]), Math.abs(Rch[i]));
const k = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  // Fade the last half second to true silence.
  const fade = Math.min(1, (N - i) / (SR * 0.5));
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, Lch[i] * k * fade)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, Rch[i] * k * fade)) * 32767), 46 + i * 4);
}
mkdirSync(new URL("./out", import.meta.url), { recursive: true });
writeFileSync(new URL("./out/score.wav", import.meta.url), buf);
console.log(`score.wav: ${DURATION}s, peak normalised`);
