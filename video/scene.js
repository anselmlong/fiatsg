// The whole film as a pure function of the frame number: seek(f) paints frame f and nothing else
// depends on time, so any page can render any frame in any order and get identical pixels.
import { FPS, T, landAt } from "./timeline.mjs";

const params = new URLSearchParams(location.search);
const V = params.get("format") === "9x16";
const W = V ? 1080 : 1920;
const H = V ? 1920 : 1080;

// ---------- maths ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const expOut = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : (1 - 2 ** (-10 * x)) / (1 - 2 ** -10));
const cubicIn = (x) => x * x * x;
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
// A damped spring released at t=0, closed form so it needs no state between frames.
function spring(t, freq, damp) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * freq;
  const wd = w * Math.sqrt(1 - damp * damp);
  return 1 - Math.exp(-damp * w * t) * (Math.cos(wd * t) + ((damp * w) / wd) * Math.sin(wd * t));
}
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
// Text in: rises and settles on an exponential ease-out. Out: a quick lift and fade.
function inOutText(t, at, out, { dur = 0.55, rise = 56, outDur = 0.25, lift = 30 } = {}) {
  const a = expOut(prog(t, at, at + dur));
  const b = out == null ? 0 : expOut(prog(t, out, out + outDur));
  return { o: clamp(prog(t, at, at + dur * 0.5)) * (1 - b), y: rise * (1 - a) - lift * b, a };
}

// ---------- DOM helpers ----------
const stage = document.getElementById("stage");
stage.style.width = W + "px";
stage.style.height = H + "px";
function el(tag, cls, parent, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  (parent || stage).appendChild(e);
  return e;
}
const css = (e, o) => Object.assign(e.style, o);
const show = (e, on) => (e.style.display = on ? "" : "none");
function textLine(parent, html, { size, top, color, weight = 700, serif = true, maxW = V ? 960 : 1500, italic = false, extra = {} }) {
  const e = el("div", "line" + (serif ? " serif" : ""), parent, html);
  css(e, { fontSize: size + "px", top: top + "px", color, fontWeight: weight, maxWidth: maxW + "px", margin: "0 auto", fontStyle: italic ? "italic" : "normal", ...extra });
  return e;
}
// Centres a line block vertically on y (its top is set so the box straddles y).
function place(e, y, o, dy = 0, s = 1) {
  css(e, { opacity: o, transform: `translateY(${-e.offsetHeight / 2 + dy}px) scale(${s})`, top: y + "px", visibility: o > 0.001 ? "visible" : "hidden" });
}

const SAINTS = await (await fetch("assets/saints.json")).json();
const byId = Object.fromEntries(SAINTS.map((s) => [s.id, s]));
const QR = await (await fetch("assets/qr.svg")).text();

// ---------- the holy card ----------
const CARD_H = 478.3 / 288;
const EDGE = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
const BACK_MARK = `<svg viewBox="0 0 100 100" class="back-mark"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.6"/><path d="M50 22v56M33 40h34" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>`;

function makeCard(parent, ids, { edges = true, back = true } = {}) {
  const root = el("div", "card", parent);
  const spin = el("div", "spin", root);
  if (edges) for (const z of EDGE) css(el("div", "edge", spin), { transform: `translateZ(${z}em)` });
  const front = el("div", "face foil-frame", spin);
  front.style.transform = "translateZ(4.5em)";
  const inners = {};
  for (const id of ids) {
    const s = byId[id];
    const inner = el("div", "inner", front,
      `<div class="paint"><img src="${s.image}" alt=""><div class="card-foil"></div><div class="card-glare"></div></div>` +
      `<div class="cap"><p class="nm">${s.name}</p><p class="fe">Feast · ${s.feast}</p></div>`);
    inners[id] = inner;
  }
  const shimmer = el("div", "shimmer", front);
  let sheen = null, mark = null;
  if (back) {
    const b = el("div", "face foil-frame", spin);
    b.style.transform = "rotateY(180deg) translateZ(4.5em)";
    const bi = el("div", "back-in", b, `<div class="back-ring"></div><div class="back-hatch"></div>${BACK_MARK}<p class="back-word">FIAT</p><div class="back-sheen"></div><div class="card-glare"></div>`);
    sheen = bi.querySelector(".back-sheen");
    mark = bi.querySelector(".back-mark");
  }
  let shown = null;
  return {
    root, spin, shimmer, sheen, mark,
    face(id) {
      if (id === shown) return;
      for (const [k, v] of Object.entries(inners)) show(v, k === id);
      shown = id;
    },
    // x, y: centre in px. w: width in px. Angles in degrees.
    set({ x, y, w, ry = 0, rx = 0, rz = 0, s = 1, o = 1 }) {
      const u = w / 288;
      css(root, {
        fontSize: u + "px", left: x - w / 2 + "px", top: y - (w * CARD_H) / 2 + "px",
        transform: `rotateZ(${rz}deg) scale(${s})`, opacity: o, visibility: o > 0.001 && s > 0.001 ? "visible" : "hidden",
      });
      spin.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      // The light falls where the face is turned, exactly as the app's holdCard paint() does it.
      const turn = (((ry % 360) + 540) % 360) - 180;
      spin.style.setProperty("--gx", `${(50 + turn * 1.6).toFixed(1)}%`);
      spin.style.setProperty("--gy", `${(50 - rx * 2.4).toFixed(1)}%`);
      spin.style.setProperty("--foil", `${(115 + turn * 1.2 + rx).toFixed(1)}deg`);
      spin.style.setProperty("--glare", Math.min(1, (Math.abs(turn) + Math.abs(rx)) / 22).toFixed(3));
    },
    sweep(p) {
      // A band of foil light crossing the painting, p 0..1.
      css(shimmer, { transform: `translateX(${lerp(-120, 340, p)}%) skewX(-18deg)`, opacity: p > 0 && p < 1 ? 1 : 0 });
    },
  };
}

// ---------- layout ----------
const L = V
  ? {
      hero: { cx: 540, cy: 800, w: 600 }, capY: 1470, capSize: 96,
      grid: { cols: 4, w: 150, gap: 14, x0: 219, y0: 46, anselm: 5 },
      probSize: 100,
      candle: { x: 540, y0: 820, y1: 360 }, titleY: 640, titleSize: 132, subY: [1010, 1105, 1185], subSize: 66,
      cover: { w: 1010, x: 540, y: 860, ry: -14, rx: 8, backX: 600, backY: 600 },
      cause: { w: 1010, x: 540, y: 1040, ry: 10, rx: 6 },
      ticket: { x: 640, y: 220 },
      pills: [{ x: 80, y: 190, w: 920 }, { x: 80, y: 1450, w: 920 }, { x: 80, y: 1450, w: 920 }, { x: 60, y: 300, w: 540 }, { x: 80, y: 190, w: 920 }],
      pillSize: 54,
      faithSize: 100, faithY: 900,
      quoteCard: { x: 540, y: 700, w: 500 }, quoteY: 1255, sourceY: 1440, quoteSize: 80,
      point: { x: 540, y: 520 },
      end: { mark: 300, markY: 520, logoW: 560, logoY: 700, qY: 1050, qSize: 100, urlY: 1290, urlSize: 62, smallY: 1370, smallSize: 34 },
    }
  : {
      hero: { cx: 960, cy: 470, w: 390 }, capY: 935, capSize: 100,
      grid: { cols: 7, w: 136, gap: 14, x0: 830, y0: 67, anselm: 10 },
      probSize: 104,
      candle: { x: 960, y0: 480, y1: 205 }, titleY: 400, titleSize: 128, subY: [615, 705, 782], subSize: 64,
      cover: { w: 1180, x: 1130, y: 560, ry: -18, rx: 6, backX: 1290, backY: 420 },
      cause: { w: 1120, x: 790, y: 590, ry: 14, rx: 4 },
      ticket: { x: 1470, y: 380 },
      pills: [{ x: 60, y: 150, w: 440 }, { x: 1430, y: 560, w: 440 }, { x: 1430, y: 700, w: 440 }, { x: 1430, y: 170, w: 440 }, { x: 1430, y: 270, w: 440 }],
      pillSize: 46,
      faithSize: 104, faithY: 540,
      quoteCard: { x: 960, y: 395, w: 300 }, quoteY: 745, sourceY: 850, quoteSize: 76,
      point: { x: 960, y: 300 },
      end: { mark: 230, markY: 300, logoW: 380, logoY: 455, qY: 680, qSize: 92, urlY: 820, urlSize: 56, smallY: 895, smallSize: 32 },
    };

// =================================================================================================
// A. Cold open, the hook and the pull-back (0–9 s)
// =================================================================================================
const A = el("div", "layer");
const aNight = el("div", "layer", A);
css(aNight, { background: "radial-gradient(circle at 50% 44%, #3a1f63 0%, #1a0d2e 62%, #0f071c 100%)" });
const rays = el("div", "abs", A);
const R = Math.max(W, H) * 1.6;
css(rays, { width: R + "px", height: R + "px", left: L.hero.cx - R / 2 + "px", top: L.hero.cy - R / 2 + "px", borderRadius: "50%",
  background: "repeating-conic-gradient(from 0deg, rgba(246,213,138,0.2) 0deg 5deg, transparent 5deg 15deg)",
  maskImage: "radial-gradient(circle, black 6%, transparent 52%)", WebkitMaskImage: "radial-gradient(circle, black 6%, transparent 52%)" });
const halo = el("div", "abs", A);
css(halo, { width: L.hero.w * 2.2 + "px", height: L.hero.w * 2.2 + "px", left: L.hero.cx - L.hero.w * 1.1 + "px", top: L.hero.cy - L.hero.w * 1.1 + "px",
  borderRadius: "50%", background: "radial-gradient(circle, rgba(246,213,138,0.55), rgba(246,213,138,0.12) 40%, transparent 66%)" });
const sparkCanvas = el("canvas", "layer", A);
sparkCanvas.width = W; sparkCanvas.height = H;
const sctx = sparkCanvas.getContext("2d");
const hero = makeCard(A, ["monica", ...T.spins.map((s) => s.id)]);
hero.face("monica");
const flash = el("div", "layer", A);
css(flash, { background: `radial-gradient(circle at ${L.hero.cx}px ${L.hero.cy}px, #fff9e8, rgba(246,213,138,0.85) ${V ? 26 : 30}%, transparent 75%)` });

const captions = [{ at: T.slam, text: "You prayed. So did she.", slam: true }, ...T.spins.map((s) => ({ at: s.at, text: s.line }))];
captions.forEach((c, i) => {
  c.out = i + 1 < captions.length ? captions[i + 1].at : T.pullBack;
  c.el = textLine(A, c.text, { size: L.capSize, top: L.capY, color: "#fbf6ef", extra: { textShadow: "0 0 40px rgba(246,213,138,0.55), 0 4px 18px rgba(0,0,0,0.5)" } });
});

// The grid of all 28, on cream.
const gridBg = el("div", "layer", A);
css(gridBg, { background: "radial-gradient(circle at 70% 50%, #fff3d6 0%, #fbf6ef 55%, #f3e6cf 100%)" });
if (V) gridBg.style.background = "radial-gradient(circle at 50% 50%, #fff3d6 0%, #fbf6ef 55%, #f3e6cf 100%)";
const grid = el("div", "layer", A);
const G = L.grid;
const gh = G.w * CARD_H;
const order = SAINTS.filter((s) => s.id !== "anselm").map((s) => s.id);
order.splice(G.anselm, 0, "anselm");
const cells = order.map((id, i) => {
  const c = makeCard(grid, [id], { edges: false, back: false });
  c.face(id);
  const col = i % G.cols, row = Math.floor(i / G.cols);
  c.root.style.borderRadius = "25.2em";
  c.root.style.boxShadow = "0 0 26em rgba(246,213,138,0.95), 0 8em 22em -8em rgba(52,25,92,0.5)";
  return { c, col, row, x: G.x0 + col * (G.w + G.gap) + G.w / 2, y: G.y0 + row * (gh + G.gap) + gh / 2 };
});
const aCell = cells[G.anselm];
const gridText = el("div", "layer", A);
let gTitle, gSub, band;
if (V) {
  band = el("div", "abs", gridText);
  css(band, { left: 0, right: 0, top: "700px", height: "520px", background: "linear-gradient(180deg, rgba(251,246,239,0) 0%, rgba(251,246,239,0.94) 22%, rgba(251,246,239,0.94) 78%, rgba(251,246,239,0) 100%)" });
  gTitle = textLine(gridText, "28 saints.", { size: 150, top: 860, color: "#34195c" });
  gSub = textLine(gridText, "Each one met by doing what they did.", { size: 74, top: 1035, color: "#2b1a3f", maxW: 900 });
} else {
  gTitle = el("div", "abs serif", gridText, "28 saints.");
  css(gTitle, { left: "96px", width: "700px", fontSize: "156px", fontWeight: 700, color: "#34195c", lineHeight: 1 });
  gSub = el("div", "abs serif", gridText, "Each one met by doing what they did.");
  css(gSub, { left: "100px", width: "680px", fontSize: "74px", fontWeight: 700, color: "#2b1a3f", lineHeight: 1.12, textWrap: "balance" });
}

// Sparks and embers, all from fixed seeds.
const r1 = rng(7);
const EMBERS = Array.from({ length: 70 }, () => ({ x: r1() * W, y: r1() * H, v: 0.03 + r1() * 0.07, s: 1.2 + r1() * 2.6, ph: r1() * 6.28 }));
const GATHER = Array.from({ length: 90 }, () => ({ a: r1() * 6.28, r: 0.55 + r1() * 0.9, s: 1.5 + r1() * 3, ph: r1() * 6.28 }));
const BURST = Array.from({ length: 110 }, () => ({ a: r1() * 6.28, v: 0.25 + r1() * 0.85, s: 1.5 + r1() * 3.5, rise: 60 + r1() * 200, life: 1.0 + r1() * 1.4 }));
function dot(ctx, x, y, r, a) {
  if (a <= 0.01) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
  g.addColorStop(0, `rgba(255,246,214,${a})`);
  g.addColorStop(0.25, `rgba(246,213,138,${a * 0.75})`);
  g.addColorStop(1, "rgba(246,213,138,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
}
function embers(ctx, t, alpha, cx = W / 2) {
  for (const e of EMBERS) {
    const y = (((e.y - e.v * H * t) % (H + 60)) + H + 60) % (H + 60) - 30;
    const x = e.x + Math.sin(t * 0.7 + e.ph) * 24 + (cx - W / 2) * 0;
    dot(ctx, x, y, e.s, alpha * (0.35 + 0.35 * Math.sin(t * 1.3 + e.ph) ** 2));
  }
}

function heroState(t) {
  const { cx, cy, w } = L.hero;
  const f = spring(t + 0.12, 1.25, 0.62);
  let s = lerp(0.26, 1, f), x = cx, y = cy + lerp(-w * 0.35, 0, f) + Math.sin(t * 2.1) * 6 * f;
  let rz = lerp(-14, 0, f), rx = lerp(28, 0, f), ry = 180;
  const k = prog(t, T.charge, T.flip) ** 2;
  if (t < T.flip + 0.05) {
    x += k * 16 * Math.sin(t * 97);
    y += k * 11 * Math.sin(t * 79 + 1);
    rz += k * 4 * Math.sin(t * 88 + 2);
    s *= 1 + 0.05 * k;
  }
  let face = "monica";
  if (t >= T.flip) {
    const p = spring(t - T.flip, 1.5, 0.6);
    ry = 180 * (1 - p);
    rx += 8 * Math.sin(Math.PI * clamp((t - T.flip) / 0.55));
    s *= 1 + 0.08 * Math.sin(Math.PI * clamp((t - T.flip) / 0.7));
  }
  for (const sp of T.spins) {
    if (t < sp.at) continue;
    const p = spring(t - sp.at, 0.654 / sp.dur, 0.7);
    ry -= 360 * p;
    if (p >= 0.5) face = sp.id;
    const bump = Math.sin(Math.PI * clamp(p));
    rx += 10 * bump;
    s *= 1 + 0.06 * bump;
  }
  return { x, y, w, s, rz, rx, ry, face, k };
}

function renderA(t) {
  const on = t < T.problem;
  show(A, on);
  if (!on) return;
  const pb = t >= T.pullBack;
  const h = heroState(t);
  // Rays: already turning on frame 1, flaring as the card charges, full once it turns.
  const k = h.k;
  const after = prog(t, T.flip, T.flip + 0.3);
  const rayO = lerp(lerp(0.4, 0.9, k), lerp(1, 0.62, prog(t, 2.0, 4.0)), after) * (1 - prog(t, T.pullBack, T.pullBack + 0.15));
  const rayS = lerp(0.8, 1, k) + 0.12 * expOut(after) * (1 - prog(t, 2, 4));
  css(rays, { opacity: rayO, transform: `rotate(${t * 9 + 40 * inOut(prog(t, T.charge, T.flip + 0.6))}deg) scale(${rayS})` });
  const breathe = 0.5 + 0.5 * Math.sin(t * 2.4);
  css(halo, { opacity: (lerp(0.45 + 0.15 * breathe, 1, k) * (1 - after * 0.25)) * (pb ? 0 : 1), transform: `scale(${(1 + 0.35 * k) * (1 + 0.1 * expOut(after))})` });

  // Card
  show(hero.root, !pb);
  if (!pb) {
    hero.face(h.face);
    hero.set({ x: h.x, y: h.y, w: h.w, s: h.s, rz: h.rz, rx: h.rx, ry: h.ry });
    hero.sweep(inOut(prog(t, T.flip + 0.27, T.flip + 1.1)));
    for (const sp of T.spins) if (t >= landAt(sp) - 0.1 && t < landAt(sp) + 0.7) hero.sweep(inOut(prog(t, landAt(sp) - 0.1, landAt(sp) + 0.6)));
    css(hero.sheen, { transform: `translateX(${lerp(-120, 320, inOut(clamp(((t % 1.7) / 1.7 - 0.3) / 0.7)))}%) skewX(-18deg)` });
    const pulse = k > 0 ? 0.5 + 0.5 * Math.sin(t * lerp(3, 40, k)) : 0.5 + 0.5 * Math.sin(t * 3);
    hero.mark.style.filter = `drop-shadow(0 0 ${4 + 14 * pulse * (0.4 + k)}em rgba(246,213,138,${0.5 + 0.5 * k}))`;
  }
  // Flash: peaks just under full so the card's silhouette survives it.
  const fl = t < T.flip ? 0 : t < T.flip + 0.07 ? prog(t, T.flip, T.flip + 0.07) * 0.82 : 0.82 * Math.exp(-(t - T.flip - 0.07) * 5.5);
  css(flash, { opacity: fl });

  // Sparks
  sctx.clearRect(0, 0, W, H);
  if (!pb) {
    embers(sctx, t, 0.9);
    const gather = prog(t, T.charge - 0.3, T.flip);
    if (t < T.flip + 0.05) {
      for (const g of GATHER) {
        const r = h.w * g.r * lerp(1.4, 0.62, inOut(gather));
        const a = g.a + t * (0.4 + 2.2 * gather);
        dot(sctx, h.x + Math.cos(a) * r, h.y + Math.sin(a) * r * 1.2, g.s, (0.15 + 0.85 * gather) * (0.6 + 0.4 * Math.sin(t * 20 + g.ph)));
      }
    }
    if (t >= T.flip) {
      const dt = t - T.flip;
      for (const b of BURST) {
        if (dt > b.life) continue;
        const d = h.w * 0.6 + b.v * Math.max(W, H) * 0.55 * (1 - Math.exp(-dt * 3.2));
        dot(sctx, h.x + Math.cos(b.a) * d, h.y + Math.sin(b.a) * d - b.rise * dt, b.s, 1 - dt / b.life);
      }
    }
  }

  // Captions
  for (const c of captions) {
    if (t < c.at - 0.01 || t > c.out + 0.3) { c.el.style.visibility = "hidden"; continue; }
    if (c.slam) {
      const a = expOut(prog(t, c.at, c.at + 0.32));
      const b = expOut(prog(t, c.out - 0.05, c.out + 0.12));
      place(c.el, L.capY, clamp(prog(t, c.at, c.at + 0.07)) * (1 - b), -20 * b, lerp(1.4, 1, a));
    } else {
      const s = inOutText(t, c.at, c.out - 0.04, { dur: 0.4, rise: 44, outDur: 0.14, lift: 26 });
      place(c.el, L.capY, s.o, s.y);
    }
  }

  // The pull-back
  show(grid, pb); show(gridBg, pb); show(gridText, pb);
  if (pb) {
    const dt = t - T.pullBack;
    css(gridBg, { opacity: expOut(prog(t, T.pullBack, T.pullBack + 0.3)) });
    const hs = heroState(T.pullBack - 1 / FPS);
    const c = spring(dt, 1.6, 0.75);
    const S = lerp((hs.w * hs.s) / G.w, 1, c);
    css(grid, { transformOrigin: `${aCell.x}px ${aCell.y}px`, transform: `translate(${(hs.x - aCell.x) * (1 - c)}px, ${(hs.y - aCell.y) * (1 - c)}px) scale(${S})` });
    for (const cell of cells) {
      const dist = Math.hypot(cell.col - aCell.col, cell.row - aCell.row);
      const delay = cell === aCell ? -1 : 0.06 + dist * 0.035;
      const a = cell === aCell ? 1 : spring(dt - delay, 2.2, 0.55);
      const o = cell === aCell ? 1 : expOut(prog(dt, delay, delay + 0.16));
      cell.c.set({ x: cell.x, y: cell.y, w: G.w, s: lerp(0.55, 1, a), o });
    }
    const t1 = inOutText(t, T.pullBack + 0.05, null, { dur: 0.5, rise: 40 });
    const t2 = inOutText(t, T.pullBack + 0.2, null, { dur: 0.5, rise: 40 });
    if (V) {
      css(band, { opacity: expOut(prog(t, T.pullBack + 0.05, T.pullBack + 0.35)) });
      place(gTitle, 900, t1.o, t1.y);
      place(gSub, 1065, t2.o, t2.y);
    } else {
      css(gTitle, { top: 330 + t1.y + "px", opacity: t1.o });
      css(gSub, { top: 510 + t2.y + "px", opacity: t2.o });
    }
  }
}

// =================================================================================================
// B. The problem (9–19 s)
// =================================================================================================
const B = el("div", "layer");
const bBg = el("div", "layer", B);
css(bBg, { background: "radial-gradient(circle at 50% 50%, #47414f 0%, #2d2935 60%, #1d1a23 100%)" });
const bPulse = el("div", "layer", B);
css(bPulse, { background: "radial-gradient(circle at 50% 50%, rgba(160,150,180,0.22), transparent 60%)" });
const scrapLayer = el("div", "layer", B);
const SCRAPS = [
  { small: "Parish group · 9:41 pm", text: "URGENT: volunteers Sunday!!", p: [0.06, 0.13], v: [0.06, 0.1], r: -4 },
  { small: "Fwd: Fwd: Fwd:", text: "pls fwd", p: [0.66, 0.1], v: [0.6, 0.2], r: 5 },
  { small: "Parish bulletin · Week 41", text: "Ushers, readers and flower arrangers needed. See notice board.", p: [0.56, 0.6], v: [0.08, 0.62], r: -3, w: 0.34 },
  { small: "Ministry chat · 47 unread", text: "Anyone free Sat 9am?", p: [0.08, 0.68], v: [0.4, 0.3], r: 3 },
  { small: "Reminder", text: "Sign-up sheet at the back of church!!", p: [0.28, 0.8], v: [0.1, 0.78], r: -2 },
  { small: "Fwd:", text: "Help needed for the fun fair… see poster", p: [0.62, 0.33], v: [0.36, 0.69], r: 4 },
  { small: "Announcements", text: "Volunteers urgently needed!!! pls reply", p: [0.03, 0.4], v: [0.02, 0.36], r: -6 },
].map((s) => {
  const e = el("div", "scrap", scrapLayer, `<small>${s.small}</small>${s.text}`);
  const [px, py] = V ? s.v : s.p;
  css(e, { left: px * W + "px", top: py * H + "px", fontSize: (V ? 44 : 40) + "px", maxWidth: (s.w ? s.w * W : V ? 700 : 620) * (V ? 1.9 : 1) + "px" });
  if (V) e.style.maxWidth = (s.w ? 860 : 700) + "px";
  return { ...s, e };
});
const probLines = T.problemLines.map((l) => ({ ...l, e: textLine(B, l.text, { size: L.probSize, top: H / 2, color: "#e6e1ea", maxW: V ? 940 : 1600, extra: { textShadow: "0 6px 30px rgba(0,0,0,0.6)" } }) }));
probLines[2].e.style.zIndex = 2;

function renderB(t) {
  const on = t >= T.problem && t < T.candle + 0.6;
  show(B, on);
  if (!on) return;
  const ph = (t - T.pulse.from) % T.pulse.every;
  css(bPulse, { opacity: t < T.pulse.to ? 0.35 + 0.65 * Math.exp(-ph * 6) : 0 });
  for (const l of probLines) {
    const s = inOutText(t, l.at, l.out, { dur: 0.6, rise: 64, outDur: 0.28, lift: 36 });
    place(l.e, H / 2, s.o, s.y);
  }
  scrapLayer.style.visibility = t > T.scrapsIn - 0.01 && t < T.scrapsOut + 0.8 ? "visible" : "hidden";
  const out = prog(t, T.scrapsOut, T.scrapsOut + 0.6);
  css(scrapLayer, { filter: out > 0 ? `blur(${18 * cubicIn(out)}px)` : "none" });
  SCRAPS.forEach((s, i) => {
    const at = T.scrapsIn + i * 0.24;
    const a = spring(t - at, 2.4, 0.6);
    const o = clamp(prog(t, at, at + 0.08));
    const dir = (V ? s.v[0] : s.p[0]) < 0.4 ? -1 : 1;
    const go = cubicIn(prog(t, T.scrapsOut + i * 0.03, T.scrapsOut + 0.5 + i * 0.03));
    css(s.e, { opacity: o * (1 - go * 0.3), transform: `translateX(${dir * go * W * 0.9}px) rotate(${s.r}deg) scale(${lerp(1.2, 1, a)})` });
  });
}

// =================================================================================================
// C. The solution (19–33 s)
// =================================================================================================
const C = el("div", "layer");
const cGrey = el("div", "layer", C);
css(cGrey, { background: "radial-gradient(circle at 50% 50%, #47414f 0%, #2d2935 60%, #1d1a23 100%)" });
const cWarm = el("div", "layer", C);
css(cWarm, { background: "radial-gradient(circle at 50% 30%, #fff1d2 0%, #fbf6ef 50%, #f4e8d4 100%)" });
const candle = el("div", "abs", C);
const glow = el("div", "abs", candle);
css(glow, { width: "900px", height: "900px", left: "-450px", top: "-450px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,140,0.65), rgba(246,190,100,0.18) 35%, transparent 65%)" });
const body = el("div", "abs", candle);
css(body, { width: "56px", height: "230px", left: "-28px", top: "38px", borderRadius: "10px 10px 6px 6px", background: "linear-gradient(90deg, #e9dcc6, #fffaf0 45%, #e2d2b6)", boxShadow: "inset 0 10px 14px -8px rgba(255,200,120,0.8)" });
const wick = el("div", "abs", candle);
css(wick, { width: "4px", height: "20px", left: "-2px", top: "22px", background: "#3a2a1a", borderRadius: "2px" });
const flame = el("div", "abs", candle);
css(flame, { width: "34px", height: "64px", left: "-17px", top: "-34px", borderRadius: "50% 50% 50% 50% / 62% 62% 38% 38%", transformOrigin: "50% 90%",
  background: "radial-gradient(ellipse at 50% 70%, #ffffff 0%, #fff4c8 25%, #ffc760 55%, rgba(255,140,40,0.0) 80%)", boxShadow: "0 0 40px 12px rgba(255,190,90,0.55)" });

const titleWrap = el("div", "abs serif", C);
const titleHtml = V ? "Fiat — let<br>it be done." : "Fiat — let it be done.";
css(titleWrap, { left: "50%", top: L.titleY + "px", fontSize: L.titleSize + "px", fontWeight: 700, lineHeight: 1.05, textAlign: "center", whiteSpace: "nowrap" });
const titleGold = el("div", "", titleWrap, titleHtml);
const titlePurple = el("div", "", titleWrap, titleHtml);
css(titleGold, { color: "#c8973e", textShadow: "0 0 24px rgba(246,213,138,0.8)" });
css(titlePurple, { position: "absolute", inset: 0, color: "#34195c" });
const subs = ["Mary's yes changed everything.", "Yours can be an hour, a skill,", "a prayer or an invite."].map((s, i) =>
  textLine(C, s, { size: L.subSize, top: L.subY[i], color: "#2b1a3f", weight: i === 0 ? 700 : 400, maxW: V ? 1000 : 1600 }));

function makeDevice(src, label) {
  const wrap = el("div", "layer", C);
  wrap.style.perspective = "2400px";
  const d = el("div", "device", wrap, `<div class="bar"><i></i><i></i><i></i><b>${label}</b></div>`);
  const shot = el("div", "", d);
  css(shot, { position: "relative" });
  const img = el("img", "", shot);
  img.src = src;
  css(img, { width: "100%" });
  const anchor = (x, y) => { const a = el("div", "anchor", shot); css(a, { left: x + "%", top: y + "%" }); return a; };
  return { wrap, d, anchor };
}
const cover = makeDevice("/docs/screenshots/cover.jpg", "fiat.anselmlong.com");
const cause = makeDevice("/docs/screenshots/cause.jpg", "fiat.anselmlong.com/causes");
const ticket = el("div", "abs", C);
css(ticket, { width: "380px", padding: "30px 30px 26px", borderRadius: "28px", background: "#fffdf9", border: "3px solid #c8973e", textAlign: "center", boxShadow: "0 40px 70px -24px rgba(52,25,92,0.55)" });
ticket.innerHTML = `<div class="serif" style="font-size:44px;font-weight:700;color:#34195c">Check in</div>
  <div style="margin:18px auto;width:250px;height:250px;padding:14px;border-radius:16px;background:#fbf6ef">${QR.replace("<svg", '<svg width="222" height="222"')}</div>
  <div style="font-size:24px;font-weight:800;color:#7d5a12;letter-spacing:.06em;text-transform:uppercase">Computer literacy · ACMI</div>`;
const ticketAnchor = el("div", "anchor", ticket);
css(ticketAnchor, V ? { left: "0%", top: "40%" } : { left: "50%", top: "0%" });

const anchors = [cover.anchor(16.6, 4.2), cause.anchor(73, 70.5), cause.anchor(80, 82.7), ticketAnchor, cause.anchor(74, 4.2)];
const svgNS = "http://www.w3.org/2000/svg";
const lines = document.createElementNS(svgNS, "svg");
css(lines, { position: "absolute", inset: 0, width: W + "px", height: H + "px", overflow: "visible" });
C.appendChild(lines);
const callouts = T.callouts.map((c, i) => {
  const p = L.pills[i];
  const pill = el("div", "pill", C, c.text);
  css(pill, { left: p.x + "px", top: p.y + "px", maxWidth: p.w + "px", fontSize: L.pillSize + "px" });
  const ln = document.createElementNS(svgNS, "line");
  ln.setAttribute("stroke", "#c8973e"); ln.setAttribute("stroke-width", "3.5"); ln.setAttribute("stroke-linecap", "round");
  const dotO = document.createElementNS(svgNS, "circle");
  dotO.setAttribute("r", "9"); dotO.setAttribute("fill", "#c8973e");
  const ring = document.createElementNS(svgNS, "circle");
  ring.setAttribute("fill", "none"); ring.setAttribute("stroke", "#c8973e"); ring.setAttribute("stroke-width", "3");
  lines.append(ln, dotO, ring);
  const out = i + 1 < T.callouts.length ? T.callouts[i + 1].at + 0.15 : T.faith;
  return { ...c, out, pill, ln, dotO, ring, anchor: anchors[i] };
});

function deviceT(dev, cfg, { x, y, z = 0, ry, rx, rz = 0, o = 1 }) {
  const h = 44 + cfg.w * 0.625;
  css(dev.d, { width: cfg.w + "px", left: x - cfg.w / 2 + "px", top: y - h / 2 + "px", transform: `translateZ(${z}px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg)` });
  css(dev.wrap, { opacity: o, perspectiveOrigin: `${x}px ${y}px`, visibility: o > 0.001 ? "visible" : "hidden" });
}

function renderC(t) {
  const on = t >= T.candle && t < T.faith;
  show(C, on);
  if (!on) return;
  const cd = L.candle;
  // One candle lights, then the warmth floods out from it.
  const ign = spring(t - T.candle, 2.2, 0.5);
  const flick = 1 + 0.06 * Math.sin(t * 23) + 0.04 * Math.sin(t * 37 + 1);
  const rise = expOut(prog(t, 19.9, 20.8));
  const leave = prog(t, 23.9, 24.4);
  const cy = lerp(cd.y0, cd.y1, rise) - 90 * cubicIn(leave);
  css(candle, { left: cd.x + "px", top: cy + "px", transform: `scale(${lerp(1, 0.72, rise)})`, opacity: 1 - leave });
  css(flame, { transform: `scale(${ign * flick}, ${ign * (2 - flick)}) rotate(${2 * Math.sin(t * 11)}deg)`, opacity: clamp(ign) });
  css(glow, { opacity: clamp(ign) * (0.85 + 0.15 * Math.sin(t * 17)), transform: `scale(${0.6 + 0.4 * clamp(ign)})` });
  const fr = expOut(prog(t, T.flood, T.flood + 1.2)) * Math.hypot(W, H);
  css(cWarm, { clipPath: `circle(${fr}px at ${cd.x}px ${cd.y0}px)` });
  css(body, { background: fr > 50 ? "linear-gradient(90deg, #eadbc2, #fffdf6 45%, #e2cfae)" : "linear-gradient(90deg, #8f8579, #b9ad9c 45%, #827768)" });

  // Title in gold ink, which dries to purple.
  const g = expOut(prog(t, T.title, T.title + 1.1));
  const p = expOut(prog(t, T.title + 0.25, T.title + 1.5));
  css(titleWrap, { opacity: 1 - leave, transform: `translate(-50%, ${-120 * cubicIn(leave)}px)`, visibility: t > T.title ? "visible" : "hidden" });
  css(titleGold, { clipPath: `inset(-20% ${100 - g * 100}% -20% -2%)` });
  css(titlePurple, { clipPath: `inset(-20% ${100 - p * 100}% -20% -2%)` });
  subs.forEach((s, i) => {
    const st = inOutText(t, T.sub + (i ? 0.4 + i * 0.2 : 0), 23.85 + i * 0.05, { dur: 0.6, rise: 40, outDur: 0.35, lift: 80 });
    place(s, L.subY[i], st.o, st.y);
  });

  // The product
  const dIn = spring(t - T.devices, 1.0, 0.72);
  const cIn = spring(t - T.causeIn, 1.0, 0.75);
  const dt = t - T.devices;
  const cv = L.cover;
  deviceT(cover, cv, {
    x: lerp(cv.x + W * 0.6, cv.x, dIn) + lerp(0, cv.backX - cv.x, cIn) - 12 * dt,
    y: lerp(cv.y + 80, cv.y, dIn) + lerp(0, cv.backY - cv.y, cIn),
    z: lerp(0, -650, cIn), ry: lerp(cv.ry - 30, cv.ry, dIn) + 0.5 * dt - 8 * cIn, rx: cv.rx, rz: lerp(4, -1, dIn),
    o: clamp(prog(t, T.devices, T.devices + 0.2)) * lerp(1, 0.5, cIn),
  });
  const ca = L.cause;
  const ct = t - T.causeIn;
  deviceT(cause, ca, { x: lerp(ca.x - W * 0.7, ca.x, cIn) + 10 * ct, y: lerp(ca.y + 60, ca.y, cIn), ry: lerp(ca.ry + 30, ca.ry, cIn) - 0.4 * ct, rx: ca.rx, rz: lerp(-4, 0, cIn), o: clamp(prog(t, T.causeIn, T.causeIn + 0.2)) });
  // The check-in ticket
  const tk = T.callouts[3];
  const tIn = spring(t - (tk.at - 0.2), 1.6, 0.6);
  const tOut = cubicIn(prog(t, T.callouts[4].at - 0.1, T.callouts[4].at + 0.35));
  css(ticket, { left: L.ticket.x + "px", top: L.ticket.y + "px", opacity: clamp(prog(t, tk.at - 0.2, tk.at)) * (1 - tOut),
    transform: `perspective(1400px) translateY(${lerp(140, 0, tIn) - 200 * tOut}px) rotateY(${lerp(-50, -8, tIn)}deg) rotateZ(${lerp(8, 3, tIn)}deg)`, visibility: t > tk.at - 0.2 && tOut < 1 ? "visible" : "hidden" });

  // Callouts, each pinned to the UI by a thin gold line.
  for (const c of callouts) {
    const a = expOut(prog(t, c.at, c.at + 0.45));
    const b = expOut(prog(t, c.out, c.out + 0.3));
    const o = clamp(prog(t, c.at, c.at + 0.2)) * (1 - b);
    const vis = o > 0.001;
    css(c.pill, { opacity: o, transform: `translateY(${24 * (1 - a)}px)`, visibility: vis ? "visible" : "hidden" });
    for (const n of [c.ln, c.dotO, c.ring]) n.style.visibility = vis ? "visible" : "hidden";
    if (!vis) continue;
    const ar = c.anchor.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const ax = ar.left + ar.width / 2 - sr.left, ay = ar.top + ar.height / 2 - sr.top;
    const px = c.pill.offsetLeft, py = c.pill.offsetTop + 24 * (1 - a), pw = c.pill.offsetWidth, phh = c.pill.offsetHeight;
    let sx, sy;
    if (ax < px) [sx, sy] = [px, py + phh / 2];
    else if (ax > px + pw) [sx, sy] = [px + pw, py + phh / 2];
    else [sx, sy] = [clamp(ax, px + 30, px + pw - 30), ay < py ? py : py + phh];
    const d = expOut(prog(t, c.at + 0.12, c.at + 0.6));
    c.ln.setAttribute("x1", sx); c.ln.setAttribute("y1", sy);
    c.ln.setAttribute("x2", lerp(sx, ax, d)); c.ln.setAttribute("y2", lerp(sy, ay, d));
    c.ln.style.opacity = o;
    c.dotO.setAttribute("cx", ax); c.dotO.setAttribute("cy", ay);
    c.dotO.style.opacity = o * clamp(prog(t, c.at + 0.45, c.at + 0.6));
    const rp = ((t - c.at - 0.5) % 1.2) / 1.2;
    c.ring.setAttribute("cx", ax); c.ring.setAttribute("cy", ay);
    c.ring.setAttribute("r", 9 + 22 * expOut(clamp(rp)));
    c.ring.style.opacity = t > c.at + 0.5 ? o * (1 - rp) : 0;
  }
}

// =================================================================================================
// D. The faith along the way (33–41 s), and E. the call to action (41–45 s)
// =================================================================================================
const D = el("div", "layer");
const dBg = el("div", "layer", D);
css(dBg, { background: "radial-gradient(circle at 50% 45%, #2e1852 0%, #1a0d2e 60%, #0d0618 100%)" });
const dCanvas = el("canvas", "layer", D);
dCanvas.width = W; dCanvas.height = H;
const dctx = dCanvas.getContext("2d");
const lanternLayer = el("div", "layer", D);
const r2 = rng(21);
const LANTERN_IDS = ["joseph", "bakhita", "john-bosco", "teresa-of-calcutta", "martin-de-porres", "frassati", "cabrini", "vincent-de-paul", "peter-claver", "elizabeth-of-hungary", "nicholas", "anselm", "john-vianney", "jeanne-jugan"];
const SPOTS = V
  ? [[0.15, 0.12], [0.52, 0.06], [0.86, 0.15], [0.1, 0.35], [0.9, 0.38], [0.24, 0.62], [0.78, 0.66], [0.12, 0.86], [0.5, 0.9], [0.88, 0.88], [0.36, 0.22], [0.66, 0.26], [0.36, 0.76], [0.64, 0.78]]
  : [[0.08, 0.2], [0.25, 0.1], [0.5, 0.08], [0.76, 0.12], [0.93, 0.25], [0.06, 0.62], [0.2, 0.85], [0.42, 0.9], [0.64, 0.88], [0.86, 0.8], [0.95, 0.58], [0.36, 0.2], [0.64, 0.8], [0.03, 0.42]];
const lanterns = LANTERN_IDS.map((id, i) => {
  const c = makeCard(lanternLayer, [id], { edges: true, back: true });
  c.face(id);
  const z = id === "anselm" ? 0.55 : r2();
  c.root.style.zIndex = Math.round(z * 100);
  return { id, c, x: SPOTS[i][0] * W, y: SPOTS[i][1] * H, z, ph: r2() * 6.28, ph2: r2() * 6.28 };
});
const aLantern = lanterns.find((l) => l.id === "anselm");
const dShade = el("div", "layer", D);
css(dShade, { background: `radial-gradient(ellipse ${V ? "80% 20%" : "56% 30%"} at 50% ${(L.faithY / H) * 100}%, rgba(13,6,24,0.94), rgba(13,6,24,0.75) 55%, transparent 100%)`, zIndex: 150 });
const faithLines = T.faithLines.map((l, i) => {
  const html = i === 2 ? "Discover the faith through the saints<br>who said yes before you." : l.text;
  const e = textLine(D, html, { size: i === 1 ? L.faithSize * 1.45 : L.faithSize * (i === 2 ? 0.8 : 1), top: L.faithY, color: i === 1 ? "#f6d58a" : "#fbf6ef", maxW: V ? 980 : 1700,
    extra: { zIndex: 200, textShadow: i === 1 ? "0 0 40px rgba(246,213,138,0.6)" : "0 4px 24px rgba(0,0,0,0.6)" } });
  return { ...l, e };
});
const quote = textLine(D, "“…I believe in order<br>that I may understand.”", { size: L.quoteSize, top: L.quoteY, color: "#fbf6ef", weight: 400, italic: true, maxW: V ? 1000 : 1700, extra: { zIndex: 200 } });
if (!V) quote.innerHTML = "“…I believe in order that I may understand.”";
const source = textLine(D, "St Anselm · Proslogion, chapter 1", { size: V ? 36 : 32, top: L.sourceY, color: "#f6d58a", weight: 800, serif: false, extra: { zIndex: 200, letterSpacing: "0.14em", textTransform: "uppercase" } });
const point = el("div", "abs", D);
css(point, { width: "600px", height: "600px", left: L.point.x - 300 + "px", top: L.point.y - 300 + "px", borderRadius: "50%", zIndex: 300,
  background: "radial-gradient(circle, #ffffff 0%, #fff6dc 8%, rgba(246,213,138,0.7) 20%, rgba(246,213,138,0.15) 45%, transparent 70%)" });

const E = el("div", "layer");
const eBg = el("div", "layer", E);
css(eBg, { background: "radial-gradient(circle at 50% 30%, #fff3d6 0%, #fbf6ef 55%, #f3e6cf 100%)" });
const eHalo = el("div", "abs", E);
css(eHalo, { width: "1000px", height: "1000px", left: L.point.x - 500 + "px", top: L.end.markY - 500 + "px", borderRadius: "50%", background: "radial-gradient(circle, rgba(246,213,138,0.5), rgba(246,213,138,0.12) 40%, transparent 68%)" });
const mark = textLine(E, "Fiat", { size: L.end.mark, top: L.end.markY, color: "#34195c" });
const logo = el("img", "abs", E);
logo.src = "/public/images/cf-logo.png";
css(logo, { width: L.end.logoW + "px", left: (W - L.end.logoW) / 2 + "px" });
const question = textLine(E, "What will your yes be?", { size: L.end.qSize, top: L.end.qY, color: "#2b1a3f", maxW: V ? 960 : 1700 });
const url = textLine(E, "fiat.anselmlong.com", { size: L.end.urlSize, top: L.end.urlY, color: "#a8772a", weight: 800, serif: false, extra: { letterSpacing: "0.01em" } });
const small = textLine(E, "Built for the FIAT Catholic Hackathon 2026", { size: L.end.smallSize, top: L.end.smallY, color: "#6b5a7a", weight: 700, serif: false, maxW: V ? 960 : 1700 });

function lanternState(l, t) {
  const dt = t - T.faith;
  const w = (V ? lerp(150, 330, l.z) : lerp(130, 290, l.z));
  return {
    x: l.x + Math.sin(t * 0.21 + l.ph) * 40,
    y: l.y + Math.cos(t * 0.3 + l.ph) * 24 - dt * lerp(6, 14, l.z),
    w, ry: 42 * Math.sin(t * 0.45 + l.ph) + 10, rx: 12 * Math.sin(t * 0.37 + l.ph2),
    o: lerp(0.4, 1, l.z) * expOut(prog(dt, 0.05 * (l.z * 6), 0.5 + 0.05 * (l.z * 6))),
  };
}

function renderD(t) {
  const on = t >= T.faith && t < T.bloom + 0.5;
  show(D, on);
  if (!on) return;
  dctx.clearRect(0, 0, W, H);
  embers(dctx, t, 0.7 * (1 - prog(t, T.rush, T.rush + 0.5)));
  const fwd = spring(t - T.anselmForward, 0.9, 0.8);
  const dim = expOut(prog(t, T.anselmForward, T.anselmForward + 0.8));
  lanterns.forEach((l, i) => {
    let s = lanternState(l, t);
    if (l === aLantern && t >= T.anselmForward) {
      const q = L.quoteCard;
      const turns = Math.round(s.ry / 360) * 360;
      s = { x: lerp(s.x, q.x, fwd), y: lerp(s.y, q.y, fwd), w: lerp(s.w, q.w, fwd), ry: lerp(s.ry, turns, fwd), rx: lerp(s.rx, 0, fwd), o: lerp(s.o, 1, fwd) };
      l.c.root.style.zIndex = 250;
    } else if (l !== aLantern) {
      s.o *= lerp(1, 0.32, dim);
    }
    // The rush: everything falls into one point of light.
    const rr = cubicIn(prog(t, T.rush + i * 0.012, T.rush + 0.7 + i * 0.012));
    if (rr > 0) {
      s = { ...s, x: lerp(s.x, L.point.x, rr), y: lerp(s.y, L.point.y, rr), ry: s.ry + 300 * rr, o: Math.max(s.o, rr) };
      s.s = 1 - rr;
    }
    l.c.set(s);
  });
  for (const l of faithLines) {
    const st = inOutText(t, l.at, l.out, { dur: 0.7, rise: 40, outDur: 0.35, lift: 24 });
    place(l.e, L.faithY, st.o, st.y);
  }
  css(dShade, { opacity: 1 - dim });
  const fade = 1 - expOut(prog(t, T.rush, T.rush + 0.3));
  const q = inOutText(t, T.quote, null, { dur: 0.8, rise: 30 });
  place(quote, L.quoteY, q.o * fade, q.y);
  const sq = inOutText(t, T.quote + 0.45, null, { dur: 0.8, rise: 20 });
  place(source, L.sourceY, sq.o * fade, sq.y);
  const pt = prog(t, T.rush, T.bloom);
  css(point, { opacity: cubicIn(pt) * (1 - prog(t, T.bloom + 0.1, T.bloom + 0.45)), transform: `scale(${0.15 + 1.6 * cubicIn(pt)})`, visibility: pt > 0 ? "visible" : "hidden" });
}

function renderE(t) {
  const on = t >= T.bloom;
  show(E, on);
  if (!on) return;
  const r = expOut(prog(t, T.bloom, T.bloom + 0.45)) * Math.hypot(W, H);
  css(E, { clipPath: r < Math.hypot(W, H) - 1 ? `circle(${r}px at ${L.point.x}px ${L.point.y}px)` : "none" });
  const m = expOut(prog(t, T.bloom + 0.05, T.bloom + 0.8));
  css(mark, { letterSpacing: lerp(0.14, 0.01, m) + "em" });
  place(mark, L.end.markY, clamp(prog(t, T.bloom + 0.05, T.bloom + 0.35)), 0, lerp(0.9, 1, m));
  const lg = inOutText(t, T.bloom + 0.2, null, { dur: 0.7, rise: 24 });
  css(logo, { top: L.end.logoY + lg.y + "px", opacity: lg.o });
  css(eHalo, { opacity: 0.6 + 0.4 * m, transform: `scale(${lerp(0.6, 1, m)})` });
  const qq = inOutText(t, T.question, null, { dur: 0.7, rise: 40 });
  place(question, L.end.qY, qq.o, qq.y);
  const u = inOutText(t, T.url, null, { dur: 0.6, rise: 24 });
  place(url, L.end.urlY, u.o, u.y);
  const sm = inOutText(t, T.url + 0.1, null, { dur: 0.6, rise: 20 });
  place(small, L.end.smallY, sm.o, sm.y);
}

// ---------- boot ----------
window.seek = (f) => {
  const t = f / FPS;
  renderA(t); renderB(t); renderC(t); renderD(t); renderE(t);
};
await Promise.all([
  document.fonts.load("700 72px Caudex"), document.fonts.load("400 72px Caudex"), document.fonts.load("italic 400 72px Caudex"),
  document.fonts.load("400 32px 'Nunito Sans'"), document.fonts.load("700 32px 'Nunito Sans'"), document.fonts.load("800 32px 'Nunito Sans'"),
]);
await document.fonts.ready;
for (const f of ["700 72px Caudex", "400 72px Caudex", "italic 400 72px Caudex", "800 32px 'Nunito Sans'"]) {
  if (!document.fonts.check(f)) throw new Error("Font failed to load: " + f);
}
// check() also passes when no face matches at all, so insist the Google faces really loaded.
for (const fam of ["Caudex", "Nunito Sans"]) {
  if (![...document.fonts].some((f) => f.family.replace(/["']/g, "") === fam && f.status === "loaded")) throw new Error("Font missing: " + fam);
}
await Promise.all([...document.images].map((i) => i.decode()));
window.seek(0);
window.ready = true;
