// The whole film. Every value is a function of the current frame, so Remotion can render any frame alone.
import { AbsoluteFill, Html5Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { T, landAt } from "../timeline.mjs";
import SAINTS from "./saints.json";
import TARGETS from "../public/screens/targets.json";
import { CSS } from "./styles.js";
import { HolyCard, Dot, CARD_H } from "./HolyCard.jsx";
import { clamp, lerp, prog, expOut, cubicIn, inOut, spring, rng, textIn } from "./lib.js";

const CREAM_BG = "radial-gradient(circle at 50% 35%, #fff3d6 0%, #fbf6ef 55%, #f3e6cf 100%)";
const NIGHT_BG = "radial-gradient(circle at 50% 44%, #3a1f63 0%, #1a0d2e 62%, #0f071c 100%)";
const GREY_BG = "radial-gradient(circle at 50% 50%, #47414f 0%, #2d2935 60%, #1d1a23 100%)";

const layout = (V) =>
  V
    ? {
        W: 1080, H: 1920,
        hero: { cx: 540, cy: 800, w: 600 }, capY: 1470, capSize: 96,
        grid: { cols: 4, w: 150, gap: 14, x0: 219, y0: 46, anselm: 5 },
        probSize: 100,
        candle: { x: 540, y0: 820, y1: 420 }, titleY: 720, titleSize: 132, subY: [1010, 1100], subSize: 68,
        label: { y: 240, size: 84 }, device: { x: 540, y: 1175, w: 620 }, flowCard: { x: 540, y: 1080, w: 560 },
        faithSize: 104, faithY: 900,
        quoteCard: { x: 540, y: 700, w: 500 }, quoteY: 1255, sourceY: 1440, quoteSize: 80,
        point: { x: 540, y: 640 },
        end: { mark: 300, markY: 640, qY: 960, qSize: 100, urlY: 1200, urlSize: 62, smallY: 1280, smallSize: 34 },
      }
    : {
        W: 1920, H: 1080,
        hero: { cx: 960, cy: 470, w: 390 }, capY: 935, capSize: 100,
        grid: { cols: 7, w: 136, gap: 14, x0: 830, y0: 67, anselm: 10 },
        probSize: 104,
        candle: { x: 960, y0: 480, y1: 240 }, titleY: 480, titleSize: 128, subY: [640, 728], subSize: 66,
        label: { x: 110, w: 640, y: 540, size: 80 }, device: { x: 1300, y: 545, w: 1220 }, flowCard: { x: 1280, y: 520, w: 380 },
        faithSize: 110, faithY: 540,
        quoteCard: { x: 960, y: 395, w: 300 }, quoteY: 745, sourceY: 850, quoteSize: 76,
        point: { x: 960, y: 340 },
        end: { mark: 240, markY: 340, qY: 610, qSize: 92, urlY: 760, urlSize: 56, smallY: 835, smallSize: 32 },
      };

// A line of text centred on y (the box straddles y), with an optional rise and scale.
function Line({ y, o = 1, dy = 0, s = 1, size, color, weight = 700, serif = true, maxW, italic, style, children }) {
  return (
    <div
      className={"line" + (serif ? " serif" : "")}
      style={{
        top: y, fontSize: size, color, fontWeight: weight, maxWidth: maxW, fontStyle: italic ? "italic" : "normal",
        fontFamily: serif ? undefined : '"Nunito Sans", sans-serif',
        opacity: o, visibility: o > 0.001 ? "visible" : "hidden", transform: `translateY(calc(-50% + ${dy}px)) scale(${s})`, ...style,
      }}
    >
      {children}
    </div>
  );
}

const Layer = ({ style, children }) => <AbsoluteFill style={style}>{children}</AbsoluteFill>;

// Fixed seeds, so every frame agrees on where every spark is.
const r1 = rng(7);
const EMBERS = Array.from({ length: 60 }, () => ({ x: r1(), y: r1(), v: 0.03 + r1() * 0.07, s: 1.2 + r1() * 2.6, ph: r1() * 6.28 }));
const GATHER = Array.from({ length: 80 }, () => ({ a: r1() * 6.28, r: 0.55 + r1() * 0.9, s: 1.5 + r1() * 3, ph: r1() * 6.28 }));
const BURST = Array.from({ length: 100 }, () => ({ a: r1() * 6.28, v: 0.25 + r1() * 0.85, s: 1.5 + r1() * 3.5, rise: 60 + r1() * 200, life: 1.0 + r1() * 1.4 }));

function Embers({ t, W, H, alpha }) {
  return EMBERS.map((e, i) => {
    const y = ((((e.y - e.v * t) * H) % (H + 60)) + H + 60) % (H + 60) - 30;
    return <Dot key={i} x={e.x * W + Math.sin(t * 0.7 + e.ph) * 24} y={y} r={e.s} a={alpha * (0.35 + 0.35 * Math.sin(t * 1.3 + e.ph) ** 2)} />;
  });
}

// The reveal light around a card: rays, gathering sparks, the burst as it turns. `at` is the flip time.
function RevealLight({ t, x, y, w, at, W, H, k, onCream }) {
  const after = prog(t, at, at + 0.3);
  const R = Math.max(W, H) * 1.6;
  const rayO = (onCream ? 0.55 : 1) * lerp(lerp(0.4, 0.9, k), lerp(1, 0.62, prog(t, at + 0.6, at + 2.6)), after);
  const rayS = lerp(0.8, 1, k) + 0.12 * expOut(after) * (1 - prog(t, at + 0.6, at + 2.6));
  const gather = prog(t, at - 1.1, at);
  const breathe = 0.5 + 0.5 * Math.sin(t * 2.4);
  return (
    <>
      <div style={{ position: "absolute", width: R, height: R, left: x - R / 2, top: y - R / 2, borderRadius: "50%", opacity: rayO,
        transform: `rotate(${t * 9 + 40 * inOut(prog(t, at - 0.8, at + 0.6))}deg) scale(${rayS})`,
        background: `repeating-conic-gradient(from 0deg, rgba(${onCream ? "200,151,62,0.22" : "246,213,138,0.2"}) 0deg 5deg, transparent 5deg 15deg)`,
        maskImage: "radial-gradient(circle, black 6%, transparent 52%)", WebkitMaskImage: "radial-gradient(circle, black 6%, transparent 52%)" }} />
      <div style={{ position: "absolute", width: w * 2.2, height: w * 2.2, left: x - w * 1.1, top: y - w * 1.1, borderRadius: "50%",
        opacity: lerp(0.45 + 0.15 * breathe, 1, k) * (1 - after * 0.25), transform: `scale(${(1 + 0.35 * k) * (1 + 0.1 * expOut(after))})`,
        background: "radial-gradient(circle, rgba(246,213,138,0.55), rgba(246,213,138,0.12) 40%, transparent 66%)" }} />
      {t < at + 0.05 && GATHER.map((g, i) => {
        const r = w * g.r * lerp(1.4, 0.62, inOut(gather));
        const a = g.a + t * (0.4 + 2.2 * gather);
        return <Dot key={i} x={x + Math.cos(a) * r} y={y + Math.sin(a) * r * 1.2} r={g.s} a={(0.15 + 0.85 * gather) * (0.6 + 0.4 * Math.sin(t * 20 + g.ph))} />;
      })}
      {t >= at && BURST.map((b, i) => {
        const dt = t - at;
        if (dt > b.life) return null;
        const d = w * 0.6 + b.v * Math.max(W, H) * 0.55 * (1 - Math.exp(-dt * 3.2));
        return <Dot key={i} x={x + Math.cos(b.a) * d} y={y + Math.sin(b.a) * d - b.rise * dt} r={b.s} a={1 - dt / b.life} />;
      })}
    </>
  );
}

// A card that falls in face down, charges, flashes and turns over at `flip`. Returns its pose.
function revealPose(t, { cx, cy, w }, start, flip) {
  const lt = t - start;
  const f = spring(lt + 0.12, 1.25, 0.62);
  let s = lerp(0.26, 1, f), x = cx, y = cy + lerp(-w * 0.35, 0, f) + Math.sin(lt * 2.1) * 6 * f;
  let rz = lerp(-14, 0, f), rx = lerp(28, 0, f), ry = 180;
  const k = prog(t, flip - 0.8, flip) ** 2;
  if (t < flip + 0.05) {
    x += k * 16 * Math.sin(t * 97);
    y += k * 11 * Math.sin(t * 79 + 1);
    rz += k * 4 * Math.sin(t * 88 + 2);
    s *= 1 + 0.05 * k;
  }
  if (t >= flip) {
    const p = spring(t - flip, 1.5, 0.6);
    ry = 180 * (1 - p);
    rx += 8 * Math.sin(Math.PI * clamp((t - flip) / 0.55));
    s *= 1 + 0.08 * Math.sin(Math.PI * clamp((t - flip) / 0.7));
  }
  return { x, y, w, s, rz, rx, ry, k };
}

const flashOpacity = (t, at) => (t < at ? 0 : t < at + 0.07 ? prog(t, at, at + 0.07) * 0.82 : 0.82 * Math.exp(-(t - at - 0.07) * 5.5));
const backSheen = (t) => lerp(-120, 320, inOut(clamp(((t % 1.7) / 1.7 - 0.3) / 0.7)));

// =================================================================================================
// A. Cold open, the hook and the pull-back
// =================================================================================================
const captions = [{ at: T.slam, text: "You prayed. So did she.", slam: true }, ...T.spins.map((s) => ({ at: s.at, text: s.line }))].map((c, i, all) => ({ ...c, out: i + 1 < all.length ? all[i + 1].at : T.pullBack }));

function heroState(t, L) {
  const p = revealPose(t, L.hero, 0, T.flip);
  let face = "monica";
  for (const sp of T.spins) {
    if (t < sp.at) continue;
    const q = spring(t - sp.at, 0.654 / sp.dur, 0.7);
    p.ry -= 360 * q;
    if (q >= 0.5) face = sp.id;
    const bump = Math.sin(Math.PI * clamp(q));
    p.rx += 10 * bump;
    p.s *= 1 + 0.06 * bump;
  }
  return { ...p, face };
}

function ColdOpen({ t, L, V }) {
  const { W, H } = L;
  const pb = t >= T.pullBack;
  const h = heroState(t, L);
  let sweep = inOut(prog(t, T.flip + 0.27, T.flip + 1.1));
  for (const sp of T.spins) if (t >= landAt(sp) - 0.1 && t < landAt(sp) + 0.6) sweep = inOut(prog(t, landAt(sp) - 0.1, landAt(sp) + 0.5));
  const pulse = 0.5 + 0.5 * Math.sin(t * lerp(3, 40, h.k));

  // The pull-back: a camera move from the hero card out to the whole collection.
  const G = L.grid;
  const gh = G.w * CARD_H;
  const order = SAINTS.filter((s) => s.id !== "anselm").map((s) => s.id);
  order.splice(G.anselm, 0, "anselm");
  const cells = order.map((id, i) => ({ id, col: i % G.cols, row: Math.floor(i / G.cols), x: G.x0 + (i % G.cols) * (G.w + G.gap) + G.w / 2, y: G.y0 + Math.floor(i / G.cols) * (gh + G.gap) + gh / 2 }));
  const aCell = cells[G.anselm];
  const dt = t - T.pullBack;
  const hs = heroState(T.pullBack - 1 / 60, L);
  const c = spring(dt, 1.6, 0.75);
  const S = lerp((hs.w * hs.s) / G.w, 1, c);
  const t1 = textIn(t, T.pullBack + 0.1, null, { dur: 0.45, rise: 40 });

  return (
    <Layer>
      <Layer style={{ background: NIGHT_BG }} />
      {!pb && (
        <>
          <RevealLight t={t} x={L.hero.cx} y={L.hero.cy} w={L.hero.w} at={T.flip} W={W} H={H} k={h.k} />
          <Embers t={t} W={W} H={H} alpha={0.9} />
          <HolyCard ids={["monica", ...T.spins.map((s) => s.id)]} face={h.face} x={h.x} y={h.y} w={h.w} s={h.s} rz={h.rz} rx={h.rx} ry={h.ry} sweep={sweep} sheen={backSheen(t)} glow={4 + 14 * pulse * (0.4 + h.k)} />
          <Layer style={{ background: `radial-gradient(circle at ${L.hero.cx}px ${L.hero.cy}px, #fff9e8, rgba(246,213,138,0.85) ${V ? 26 : 30}%, transparent 75%)`, opacity: flashOpacity(t, T.flip) }} />
          {captions.map((cap, i) => {
            if (t < cap.at - 0.01 || t > cap.out + 0.3) return null;
            let st;
            if (cap.slam) {
              const a = expOut(prog(t, cap.at, cap.at + 0.3));
              const b = expOut(prog(t, cap.out - 0.05, cap.out + 0.1));
              st = { o: clamp(prog(t, cap.at, cap.at + 0.07)) * (1 - b), dy: -20 * b, s: lerp(1.4, 1, a) };
            } else {
              const q = textIn(t, cap.at, cap.out - 0.04, { dur: 0.32, rise: 40, outDur: 0.12, lift: 24 });
              st = { o: q.o, dy: q.y, s: 1 };
            }
            return (
              <Line key={i} y={L.capY} o={st.o} dy={st.dy} s={st.s} size={L.capSize} color="#fbf6ef" maxW={V ? 860 : 1500} style={{ textShadow: "0 0 40px rgba(246,213,138,0.55), 0 4px 18px rgba(0,0,0,0.5)" }}>
                {cap.text}
              </Line>
            );
          })}
        </>
      )}
      {pb && (
        <>
          <Layer style={{ background: CREAM_BG, opacity: expOut(prog(t, T.pullBack, T.pullBack + 0.3)) }} />
          <Layer style={{ transformOrigin: `${aCell.x}px ${aCell.y}px`, transform: `translate(${(hs.x - aCell.x) * (1 - c)}px, ${(hs.y - aCell.y) * (1 - c)}px) scale(${S})` }}>
            {cells.map((cell) => {
              const isA = cell === aCell;
              const delay = 0.05 + Math.hypot(cell.col - aCell.col, cell.row - aCell.row) * 0.03;
              const a = isA ? 1 : spring(dt - delay, 2.2, 0.55);
              const o = isA ? 1 : expOut(prog(dt, delay, delay + 0.14));
              return <HolyCard key={cell.id} ids={[cell.id]} x={cell.x} y={cell.y} w={G.w} s={lerp(0.55, 1, a)} o={o} edges={false} back={false} shadow="0 0 26em rgba(246,213,138,0.95), 0 8em 22em -8em rgba(52,25,92,0.5)" />;
            })}
          </Layer>
          {V ? (
            <>
              <div style={{ position: "absolute", left: 0, right: 0, top: 790, height: 340, opacity: t1.o, background: "linear-gradient(180deg, rgba(251,246,239,0) 0%, rgba(251,246,239,0.95) 25%, rgba(251,246,239,0.95) 75%, rgba(251,246,239,0) 100%)" }} />
              <Line y={960} o={t1.o} dy={t1.y} size={130} color="#34195c" maxW={900}>28 saints to meet.</Line>
            </>
          ) : (
            <div className="serif" style={{ position: "absolute", left: 96, width: 680, top: 540, fontSize: 150, fontWeight: 700, color: "#34195c", lineHeight: 1, opacity: t1.o, transform: `translateY(calc(-50% + ${t1.y}px))` }}>
              28 saints to meet.
            </div>
          )}
        </>
      )}
    </Layer>
  );
}

// =================================================================================================
// B. The problem
// =================================================================================================
const SCRAPS = [
  { small: "Parish group · 9:41 pm", text: "URGENT: volunteers Sunday!!", p: [0.06, 0.13], v: [0.06, 0.12], r: -4 },
  { small: "Fwd: Fwd: Fwd:", text: "pls fwd", p: [0.68, 0.1], v: [0.6, 0.22], r: 5 },
  { small: "Parish bulletin · Week 41", text: "Ushers and readers needed. See notice board.", p: [0.58, 0.62], v: [0.08, 0.63], r: -3 },
  { small: "Ministry chat · 47 unread", text: "Anyone free Sat 9am?", p: [0.08, 0.68], v: [0.4, 0.31], r: 3 },
  { small: "Reminder", text: "Sign-up sheet at the back!!", p: [0.3, 0.8], v: [0.12, 0.79], r: -2 },
  { small: "Announcements", text: "Volunteers urgently needed!!!", p: [0.03, 0.4], v: [0.02, 0.37], r: -6 },
];

function Problem({ t, L, V }) {
  const { W, H } = L;
  const ph = (t - T.pulse.from) % T.pulse.every;
  const out = prog(t, T.scrapsOut, T.scrapsOut + 0.45);
  return (
    <Layer style={{ background: GREY_BG }}>
      <Layer style={{ background: "radial-gradient(circle at 50% 50%, rgba(160,150,180,0.22), transparent 60%)", opacity: t < T.pulse.to ? 0.35 + 0.65 * Math.exp(-ph * 7) : 0 }} />
      <Layer style={{ filter: out > 0 ? `blur(${18 * cubicIn(out)}px)` : "none", visibility: t > T.scrapsIn - 0.01 && t < T.scrapsOut + 0.6 ? "visible" : "hidden" }}>
        {SCRAPS.map((s, i) => {
          const at = T.scrapsIn + i * 0.16;
          const a = spring(t - at, 2.6, 0.6);
          const [px, py] = V ? s.v : s.p;
          const go = cubicIn(prog(t, T.scrapsOut + i * 0.025, T.scrapsOut + 0.4 + i * 0.025));
          return (
            <div key={i} className="scrap" style={{ left: px * W, top: py * H, fontSize: V ? 44 : 40, maxWidth: V ? 760 : 620, fontFamily: '"Nunito Sans", sans-serif',
              opacity: clamp(prog(t, at, at + 0.06)), transform: `translateX(${(px < 0.4 ? -1 : 1) * go * W * 0.9}px) rotate(${s.r}deg) scale(${lerp(1.2, 1, a)})` }}>
              <small>{s.small}</small>{s.text}
            </div>
          );
        })}
      </Layer>
      {T.problemLines.map((l, i) => {
        const s = textIn(t, l.at, l.out, { dur: 0.45, rise: 56, outDur: 0.2, lift: 30 });
        return <Line key={i} y={H / 2} o={s.o} dy={s.y} size={L.probSize} color="#e6e1ea" maxW={V ? 860 : 1600} style={{ textShadow: "0 6px 30px rgba(0,0,0,0.6)", zIndex: 2 }}>{l.text}</Line>;
      })}
    </Layer>
  );
}

// =================================================================================================
// C. The answer: one candle, and the name
// =================================================================================================
function Answer({ t, L, V }) {
  const { W, H } = L;
  const cd = L.candle;
  const ign = spring(t - T.candle, 2.2, 0.5);
  const flick = 1 + 0.06 * Math.sin(t * 23) + 0.04 * Math.sin(t * 37 + 1);
  const rise = expOut(prog(t, T.candle + 0.3, T.candle + 1.1));
  const leave = prog(t, T.flow - 0.35, T.flow);
  const cy = lerp(cd.y0, cd.y1, rise) - 90 * cubicIn(leave);
  const fr = expOut(prog(t, T.flood, T.flood + 1.0)) * Math.hypot(W, H);
  const g = expOut(prog(t, T.title, T.title + 0.9));
  const p = expOut(prog(t, T.title + 0.2, T.title + 1.2));
  const title = V ? <>Fiat — let<br />it be done.</> : "Fiat — let it be done.";
  const subs = ["An hour, a skill,", "a prayer or an invite."];
  return (
    <Layer style={{ background: GREY_BG }}>
      <Layer style={{ background: "radial-gradient(circle at 50% 30%, #fff1d2 0%, #fbf6ef 50%, #f4e8d4 100%)", clipPath: `circle(${fr}px at ${cd.x}px ${cd.y0}px)` }} />
      <div style={{ position: "absolute", left: cd.x, top: cy, transform: `scale(${lerp(1, 0.72, rise)})`, opacity: 1 - leave }}>
        <div style={{ position: "absolute", width: 900, height: 900, left: -450, top: -450, borderRadius: "50%", opacity: clamp(ign) * (0.85 + 0.15 * Math.sin(t * 17)), transform: `scale(${0.6 + 0.4 * clamp(ign)})`,
          background: "radial-gradient(circle, rgba(255,214,140,0.65), rgba(246,190,100,0.18) 35%, transparent 65%)" }} />
        <div style={{ position: "absolute", width: 56, height: 230, left: -28, top: 38, borderRadius: "10px 10px 6px 6px", boxShadow: "inset 0 10px 14px -8px rgba(255,200,120,0.8)",
          background: fr > 50 ? "linear-gradient(90deg, #eadbc2, #fffdf6 45%, #e2cfae)" : "linear-gradient(90deg, #8f8579, #b9ad9c 45%, #827768)" }} />
        <div style={{ position: "absolute", width: 4, height: 20, left: -2, top: 22, background: "#3a2a1a", borderRadius: 2 }} />
        <div style={{ position: "absolute", width: 34, height: 64, left: -17, top: -34, borderRadius: "50% 50% 50% 50% / 62% 62% 38% 38%", transformOrigin: "50% 90%",
          transform: `scale(${ign * flick}, ${ign * (2 - flick)}) rotate(${2 * Math.sin(t * 11)}deg)`, opacity: clamp(ign),
          background: "radial-gradient(ellipse at 50% 70%, #ffffff 0%, #fff4c8 25%, #ffc760 55%, rgba(255,140,40,0.0) 80%)", boxShadow: "0 0 40px 12px rgba(255,190,90,0.55)" }} />
      </div>
      <div className="serif" style={{ position: "absolute", left: "50%", top: L.titleY, fontSize: L.titleSize, fontWeight: 700, lineHeight: 1.05, textAlign: "center", whiteSpace: "nowrap",
        opacity: 1 - leave, transform: `translate(-50%, calc(-50% + ${-120 * cubicIn(leave)}px))`, visibility: t > T.title ? "visible" : "hidden" }}>
        <div style={{ color: "#c8973e", textShadow: "0 0 24px rgba(246,213,138,0.8)", clipPath: `inset(-20% ${100 - g * 100}% -20% -2%)` }}>{title}</div>
        <div style={{ position: "absolute", inset: 0, color: "#34195c", clipPath: `inset(-20% ${100 - p * 100}% -20% -2%)` }}>{title}</div>
      </div>
      {subs.map((s, i) => {
        const st = textIn(t, T.sub + i * 0.25, T.flow - 0.35 + i * 0.04, { dur: 0.5, rise: 36, outDur: 0.3, lift: 80 });
        return <Line key={i} y={L.subY[i]} o={st.o} dy={st.y} size={L.subSize} color="#2b1a3f" weight={400} maxW={V ? 1000 : 1600}>{s}</Line>;
      })}
    </Layer>
  );
}

// =================================================================================================
// F. The flow, on real screens: an organisation asks, a volunteer says yes, checks in, meets a saint
// =================================================================================================
const screenSize = (V, w) => (V ? { sw: w, sh: (w * 2532) / 1170 } : { sw: w, sh: (w * 1350) / 2160 });
const target = (shot, key) => {
  const r = TARGETS[shot]?.[key];
  return r && r.y > 0 && r.y < 100 ? r : null;
};

// A gold ring drawn around something on the screen.
function Ring({ t, at, r, sw, sh }) {
  if (!r || t < at) return null;
  const a = expOut(prog(t, at, at + 0.35));
  const pad = 14;
  const w = (r.w / 100) * sw + pad * 2, h = (r.h / 100) * sh + pad * 2;
  const glow = 0.5 + 0.5 * Math.sin((t - at) * 5);
  return (
    <div style={{ position: "absolute", left: (r.x / 100) * sw - w / 2, top: (r.y / 100) * sh - h / 2, width: w, height: h, borderRadius: 18,
      border: "5px solid #c8973e", opacity: a, transform: `scale(${lerp(1.25, 1, a)})`, boxShadow: `0 0 ${18 + 16 * glow}px rgba(246,213,138,0.9)` }} />
  );
}

// A finger tap: a press dot and a ripple, then the ring stays on what was tapped.
function Tap({ t, at, r, sw, sh }) {
  if (!r || t < at - 0.25) return null;
  const x = (r.x / 100) * sw, y = (r.y / 100) * sh;
  const press = expOut(prog(t, at - 0.25, at)) * (1 - expOut(prog(t, at + 0.1, at + 0.4)));
  const rip = prog(t, at, at + 0.6);
  return (
    <>
      <div style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: "50%", background: "rgba(52,25,92,0.28)", border: "3px solid rgba(255,255,255,0.9)", opacity: press, transform: `scale(${lerp(1.3, 0.85, press)})` }} />
      {rip > 0 && rip < 1 && <div style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: "50%", border: "4px solid #c8973e", opacity: 1 - rip, transform: `scale(${1 + 2.4 * expOut(rip)})` }} />}
      <Ring t={t} at={at + 0.2} r={r} sw={sw} sh={sh} />
    </>
  );
}

function Screen({ V, shot, o = 1, dy = 0 }) {
  return <Img src={staticFile(`screens/${shot}-${V ? "mobile" : "desktop"}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: o, transform: `translateY(${dy}%)` }} />;
}

function Device({ V, x, y, w, ry, rx, rz, o, children }) {
  const { sw, sh } = screenSize(V, w);
  const frame = V
    ? { className: "phone", w: sw + 32, h: sh + 32 }
    : { className: "browser", w: sw, h: sh + 44 };
  return (
    <AbsoluteFill style={{ perspective: 2400, perspectiveOrigin: `${x}px ${y}px`, opacity: o, visibility: o > 0.001 ? "visible" : "hidden" }}>
      <div className={frame.className} style={{ width: frame.w, left: x - frame.w / 2, top: y - frame.h / 2, transform: `rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg)` }}>
        {!V && <div className="bar"><i /><i /><i /><b>fiat.anselmlong.com</b></div>}
        <div className={V ? "screen" : ""} style={{ position: "relative", width: sw, height: sh, overflow: "hidden" }}>{children(sw, sh)}</div>
      </div>
    </AbsoluteFill>
  );
}

function StepLabel({ t, L, V, step, out }) {
  const s = textIn(t, step.at + 0.08, out - 0.15, { dur: 0.4, rise: 40, outDur: 0.18, lift: 24 });
  const badge = (
    <div style={{ width: V ? 84 : 92, height: V ? 84 : 92, borderRadius: "50%", background: "linear-gradient(135deg, #f6d58a, #c8973e)", color: "#34195c",
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Caudex", fontWeight: 700, fontSize: V ? 52 : 56, boxShadow: "0 10px 24px -10px rgba(168,119,42,0.8)" }}>
      {step.n}
    </div>
  );
  const box = { opacity: s.o, visibility: s.o > 0.001 ? "visible" : "hidden" };
  return V ? (
    <div style={{ position: "absolute", left: 90, right: 90, top: L.label.y, transform: `translateY(calc(-50% + ${s.y}px))`, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, ...box }}>
      {badge}
      <div className="serif" style={{ fontSize: L.label.size, fontWeight: 700, color: "#34195c", lineHeight: 1.05, textAlign: "center", textWrap: "balance" }}>{step.text}</div>
    </div>
  ) : (
    <div style={{ position: "absolute", left: L.label.x, width: L.label.w, top: L.label.y, transform: `translateY(calc(-50% + ${s.y}px))`, display: "flex", flexDirection: "column", gap: 28, ...box }}>
      {badge}
      <div className="serif" style={{ fontSize: L.label.size, fontWeight: 700, color: "#34195c", lineHeight: 1.05, textWrap: "balance" }}>{step.text}</div>
    </div>
  );
}

function LangPill({ t, at, r, sw, sh, V, text }) {
  if (!r || t < at) return null;
  const a = expOut(prog(t, at, at + 0.4));
  const pw = V ? 480 : 520;
  const cx = clamp((r.x / 100) * sw, pw / 2 + 20, sw - pw / 2 - 20);
  const ty = ((r.y + r.h / 2) / 100) * sh;
  const top = ty + (V ? 120 : 90);
  return (
    <>
      <svg style={{ position: "absolute", left: 0, top: 0, width: sw, height: sh, overflow: "visible", opacity: a }}>
        <line x1={(r.x / 100) * sw} y1={ty + 14} x2={(r.x / 100) * sw} y2={lerp(ty + 14, top, a)} stroke="#c8973e" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <div className="pill" style={{ left: cx - pw / 2, width: pw, top, fontSize: V ? 40 : 40, opacity: a, transform: `translateY(${16 * (1 - a)}px)` }}>
        {text.split(" · ").map((x, i) => <span key={i}>{i > 0 && " · "}<span style={{ whiteSpace: "nowrap" }}>{x}</span></span>)}
      </div>
    </>
  );
}

function Flow({ t, L, V }) {
  const { W, H } = L;
  const steps = T.steps;
  const D = L.device;
  return (
    <Layer style={{ background: CREAM_BG }}>
      {steps.map((step, i) => {
        const out = i + 1 < steps.length ? steps[i + 1].at : T.faith;
        if (t < step.at - 0.01 || t > out + 0.45) return null;
        if (step.saint) {
          const C = L.flowCard;
          const pose = revealPose(t, { cx: C.x, cy: C.y, w: C.w }, step.at, T.saintFlip);
          return (
            <Layer key={i}>
              <RevealLight t={t} x={C.x} y={C.y} w={C.w} at={T.saintFlip} W={W} H={H} k={pose.k} onCream />
              <HolyCard ids={[step.saint]} x={pose.x} y={pose.y} w={C.w} s={pose.s} rz={pose.rz} rx={pose.rx} ry={pose.ry} sweep={inOut(prog(t, T.saintFlip + 0.27, T.saintFlip + 1.1))} sheen={backSheen(t)} glow={4 + 10 * pose.k} />
              <Layer style={{ background: `radial-gradient(circle at ${C.x}px ${C.y}px, #ffffff, rgba(246,213,138,0.85) 28%, transparent 72%)`, opacity: flashOpacity(t, T.saintFlip) }} />
              <StepLabel t={t} L={L} V={V} step={step} out={out} />
            </Layer>
          );
        }
        const inP = spring(t - step.at, 1.1, 0.78);
        const outP = cubicIn(prog(t, out - 0.05, out + 0.35));
        const lt = t - step.at;
        const shot = (s) => `${s}-${V ? "mobile" : "desktop"}`;
        const then = step.then && t >= step.then.at ? expOut(prog(t, step.then.at, step.then.at + 0.45)) : 0;
        return (
          <Layer key={i}>
            <Device V={V} x={lerp(D.x + W * 0.55, D.x, inP) - outP * W * 0.7 - 6 * lt} y={D.y} w={D.w}
              ry={lerp(V ? -30 : -40, V ? -4 : -9, inP) + 0.6 * lt} rx={V ? 3 : 4} rz={lerp(3, 0, inP)} o={clamp(prog(t, step.at, step.at + 0.12)) * (1 - outP)}>
              {(sw, sh) => {
                // Push in on what matters, so the real UI is readable on a phone.
                const focus = (step.then && t >= step.then.at ? target(shot(step.then.screen), step.then.mark) : null)
                  ?? target(shot(step.screen), step.tap ?? step.mark ?? step.pill?.mark) ?? target(shot(step.screen), "qr") ?? { x: 50, y: 40 };
                // Ease back out when the language pill appears, so it has room on screen.
                const back = step.pill ? expOut(prog(t, step.pill.at - 0.3, step.pill.at + 0.4)) : 0;
                const zoom = lerp(1, V ? 1.18 : 1.55, expOut(prog(t, step.at + 0.35, step.at + 1.6)) * (1 - back));
                return (
                <div style={{ position: "absolute", inset: 0, transformOrigin: `${focus.x}% ${focus.y}%`, transform: `scale(${zoom})` }}>
                  <Screen V={V} shot={step.screen} o={1 - then} dy={-8 * then} />
                  {step.then && then > 0 && <Screen V={V} shot={step.then.screen} o={then} dy={8 * (1 - then)} />}
                  {step.then && <Ring t={t} at={step.then.at + 0.45} r={target(shot(step.then.screen), step.then.mark)} sw={sw} sh={sh} />}
                  {step.mark && <Ring t={t} at={step.at + 0.6} r={target(shot(step.screen), step.mark) ?? target(shot(step.screen), "qr")} sw={sw} sh={sh} />}
                  {step.tap && <Tap t={t} at={step.at + 0.95} r={target(shot(step.screen), step.tap)} sw={sw} sh={sh} />}
                  {step.pill && <><Ring t={t} at={step.pill.at} r={target(shot(step.screen), step.pill.mark)} sw={sw} sh={sh} /><LangPill t={t} at={step.pill.at + 0.15} r={target(shot(step.screen), step.pill.mark)} sw={sw} sh={sh} V={V} text={step.pill.text} /></>}
                </div>
                );
              }}
            </Device>
            <StepLabel t={t} L={L} V={V} step={step} out={out} />
          </Layer>
        );
      })}
    </Layer>
  );
}

// =================================================================================================
// D. The faith along the way, and E. the call to action
// =================================================================================================
const QUOTE_SAINT = "frassati";
const LANTERN_IDS = ["joseph", "bakhita", "john-bosco", "teresa-of-calcutta", "martin-de-porres", "camillus-de-lellis", "cabrini", "vincent-de-paul", "peter-claver", "elizabeth-of-hungary", "nicholas", "frassati", "john-vianney", "jeanne-jugan"];
const SPOTS = {
  V: [[0.15, 0.12], [0.52, 0.06], [0.86, 0.15], [0.1, 0.35], [0.9, 0.38], [0.24, 0.62], [0.78, 0.66], [0.12, 0.86], [0.5, 0.9], [0.88, 0.88], [0.36, 0.22], [0.66, 0.26], [0.36, 0.76], [0.64, 0.78]],
  H: [[0.08, 0.2], [0.25, 0.1], [0.5, 0.08], [0.76, 0.12], [0.93, 0.25], [0.06, 0.62], [0.2, 0.85], [0.42, 0.9], [0.64, 0.88], [0.86, 0.8], [0.95, 0.58], [0.36, 0.2], [0.64, 0.8], [0.03, 0.42]],
};
const r2 = rng(21);
const LANTERNS = LANTERN_IDS.map((id, i) => ({ id, i, z: id === QUOTE_SAINT ? 0.55 : r2(), ph: r2() * 6.28, ph2: r2() * 6.28 }));

function Faith({ t, L, V }) {
  const { W, H } = L;
  const fwd = spring(t - T.saintForward, 0.9, 0.8);
  const dim = expOut(prog(t, T.saintForward, T.saintForward + 0.7));
  const fade = 1 - expOut(prog(t, T.rush, T.rush + 0.3));
  const fl = textIn(t, T.faithLine.at, T.faithLine.out, { dur: 0.5, rise: 36, outDur: 0.3, lift: 20 });
  const q = textIn(t, T.quote, null, { dur: 0.6, rise: 30 });
  const sq = textIn(t, T.quote + 0.35, null, { dur: 0.6, rise: 20 });
  const pt = prog(t, T.rush, T.bloom);
  return (
    <Layer style={{ background: "radial-gradient(circle at 50% 45%, #2e1852 0%, #1a0d2e 60%, #0d0618 100%)" }}>
      <Embers t={t} W={W} H={H} alpha={0.7 * fade} />
      {LANTERNS.map((l) => {
        const [sx, sy] = SPOTS[V ? "V" : "H"][l.i];
        const dt = t - T.faith;
        let s = {
          x: sx * W + Math.sin(t * 0.21 + l.ph) * 40, y: sy * H + Math.cos(t * 0.3 + l.ph) * 24 - dt * lerp(6, 14, l.z),
          w: V ? lerp(150, 330, l.z) : lerp(130, 290, l.z), ry: 42 * Math.sin(t * 0.45 + l.ph) + 10, rx: 12 * Math.sin(t * 0.37 + l.ph2),
          o: lerp(0.4, 1, l.z) * expOut(prog(dt, 0.04 * l.z * 6, 0.4 + 0.04 * l.z * 6)), s: 1,
        };
        let z = Math.round(l.z * 100);
        if (l.id === QUOTE_SAINT && t >= T.saintForward) {
          const Q = L.quoteCard;
          const turns = Math.round(s.ry / 360) * 360;
          s = { ...s, x: lerp(s.x, Q.x, fwd), y: lerp(s.y, Q.y, fwd), w: lerp(s.w, Q.w, fwd), ry: lerp(s.ry, turns, fwd), rx: lerp(s.rx, 0, fwd), o: lerp(s.o, 1, fwd) };
          z = 250;
        } else if (l.id !== QUOTE_SAINT) {
          s.o *= lerp(1, 0.32, dim);
        }
        const rr = cubicIn(prog(t, T.rush + l.i * 0.012, T.rush + 0.7 + l.i * 0.012));
        if (rr > 0) s = { ...s, x: lerp(s.x, L.point.x, rr), y: lerp(s.y, L.point.y, rr), ry: s.ry + 300 * rr, o: Math.max(s.o, rr), s: 1 - rr };
        return <HolyCard key={l.id} ids={[l.id]} {...s} z={z} />;
      })}
      <Layer style={{ zIndex: 150, opacity: 1 - dim, background: `radial-gradient(ellipse ${V ? "80% 20%" : "56% 30%"} at 50% ${(L.faithY / H) * 100}%, rgba(13,6,24,0.94), rgba(13,6,24,0.75) 55%, transparent 100%)` }} />
      <Line y={L.faithY} o={fl.o} dy={fl.y} size={L.faithSize} color="#fbf6ef" maxW={V ? 860 : 1700} style={{ zIndex: 200, textShadow: "0 4px 24px rgba(0,0,0,0.6)" }}>
        Not points. <span style={{ color: "#f6d58a", textShadow: "0 0 40px rgba(246,213,138,0.6)" }}>Companions.</span>
      </Line>
      <Line y={L.quoteY} o={q.o * fade} dy={q.y} size={L.quoteSize} color="#fbf6ef" weight={400} italic maxW={V ? 1000 : 1700} style={{ zIndex: 200 }}>
        {V ? <>“Verso l'alto —<br />to the heights!”</> : "“Verso l'alto — to the heights!”"}
      </Line>
      <Line y={L.sourceY} o={sq.o * fade} dy={sq.y} size={V ? 36 : 32} color="#f6d58a" weight={800} serif={false} style={{ zIndex: 200, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        St Pier Giorgio Frassati · June 1925
      </Line>
      <div style={{ position: "absolute", zIndex: 300, width: 600, height: 600, left: L.point.x - 300, top: L.point.y - 300, borderRadius: "50%",
        opacity: cubicIn(pt) * (1 - prog(t, T.bloom + 0.1, T.bloom + 0.45)), transform: `scale(${0.15 + 1.6 * cubicIn(pt)})`, visibility: pt > 0 ? "visible" : "hidden",
        background: "radial-gradient(circle, #ffffff 0%, #fff6dc 8%, rgba(246,213,138,0.7) 20%, rgba(246,213,138,0.15) 45%, transparent 70%)" }} />
    </Layer>
  );
}

function End({ t, L, V }) {
  const { W, H } = L;
  const E = L.end;
  const r = expOut(prog(t, T.bloom, T.bloom + 0.45)) * Math.hypot(W, H);
  const m = expOut(prog(t, T.bloom + 0.05, T.bloom + 0.8));
  const qq = textIn(t, T.question, null, { dur: 0.6, rise: 40 });
  const u = textIn(t, T.url, null, { dur: 0.5, rise: 24 });
  const sm = textIn(t, T.url + 0.1, null, { dur: 0.5, rise: 20 });
  return (
    <Layer style={{ background: CREAM_BG, clipPath: r < Math.hypot(W, H) - 1 ? `circle(${r}px at ${L.point.x}px ${L.point.y}px)` : "none" }}>
      <div style={{ position: "absolute", width: 1000, height: 1000, left: L.point.x - 500, top: E.markY - 500, borderRadius: "50%", opacity: 0.6 + 0.4 * m, transform: `scale(${lerp(0.6, 1, m)})`,
        background: "radial-gradient(circle, rgba(246,213,138,0.5), rgba(246,213,138,0.12) 40%, transparent 68%)" }} />
      <Line y={E.markY} o={clamp(prog(t, T.bloom + 0.05, T.bloom + 0.35))} s={lerp(0.9, 1, m)} size={E.mark} color="#34195c" style={{ letterSpacing: `${lerp(0.14, 0.01, m)}em` }}>Fiat</Line>
      <Line y={E.qY} o={qq.o} dy={qq.y} size={E.qSize} color="#2b1a3f" maxW={V ? 960 : 1700}>What will your yes be?</Line>
      <Line y={E.urlY} o={u.o} dy={u.y} size={E.urlSize} color="#a8772a" weight={800} serif={false}>fiat.anselmlong.com</Line>
      <Line y={E.smallY} o={sm.o} dy={sm.y} size={E.smallSize} color="#6b5a7a" weight={700} serif={false} maxW={V ? 960 : 1700}>Built for the FIAT Catholic Hackathon 2026</Line>
    </Layer>
  );
}

export function Film({ vertical }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = !!vertical;
  const L = layout(V);
  const p = { t, L, V };
  return (
    <AbsoluteFill style={{ background: "#1a0d2e", fontFamily: '"Nunito Sans", "Noto Sans SC", sans-serif', overflow: "hidden" }}>
      <style>{CSS}</style>
      {t < T.problem && <ColdOpen {...p} />}
      {t >= T.problem && t < T.candle && <Problem {...p} />}
      {t >= T.candle && t < T.flow && <Answer {...p} />}
      {t >= T.flow && t < T.faith && <Flow {...p} />}
      {t >= T.faith && t < T.bloom + 0.5 && <Faith {...p} />}
      {t >= T.bloom && <End {...p} />}
      <Html5Audio src={staticFile("score.wav")} />
    </AbsoluteFill>
  );
}
