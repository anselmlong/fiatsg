// Pure maths shared by every scene. Everything is a function of time, so any frame renders alone.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const expOut = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : (1 - 2 ** (-10 * x)) / (1 - 2 ** -10));
export const cubicIn = (x) => x * x * x;
export const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

// A damped spring released at t=0, closed form so it needs no state between frames.
export function spring(t, freq, damp) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * freq;
  const wd = w * Math.sqrt(1 - damp * damp);
  return 1 - Math.exp(-damp * w * t) * (Math.cos(wd * t) + ((damp * w) / wd) * Math.sin(wd * t));
}

export function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Text in: rises and settles on an exponential ease-out. Out: a quick lift and fade.
export function textIn(t, at, out, { dur = 0.45, rise = 48, outDur = 0.2, lift = 26 } = {}) {
  const a = expOut(prog(t, at, at + dur));
  const b = out == null ? 0 : expOut(prog(t, out, out + outDur));
  return { o: clamp(prog(t, at, at + dur * 0.45)) * (1 - b), y: rise * (1 - a) - lift * b, a };
}
