// The holy card's geometry and finish, copied from the app (saint-reveal.tsx, saint-card.tsx, globals.css).
// 1em = 1 app pixel at the app's 288px card width, so a card of any size keeps the app's proportions.
export const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
.serif { font-family: "Caudex", serif; }
.line { position: absolute; left: 0; right: 0; margin: 0 auto; text-align: center; text-wrap: balance; line-height: 1.08; }
.card { position: absolute; width: 288em; height: 478.3em; perspective: 1100em; }
.spin { position: absolute; inset: 0; transform-style: preserve-3d; }
.edge { position: absolute; inset: 0; border-radius: 25.2em; background: #a87a2c; }
.face { position: absolute; inset: 0; border-radius: 25.2em; padding: 5em; backface-visibility: hidden; overflow: hidden; }
.foil-frame { background: linear-gradient(var(--foil, 115deg), #a8772a 0%, #e9be62 22%, #fbe7b0 38%, #c8973e 52%, #f6d58a 68%, #a8772a 100%); }
.inner { position: absolute; inset: 5em; display: flex; flex-direction: column; overflow: hidden; border-radius: 19.8em; border: 2em solid #f6ead0; background: #fffdf9; }
.paint { position: relative; aspect-ratio: 3 / 4; background: #34195c; overflow: hidden; flex: none; }
.paint img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.card-foil { position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255,236,190,.5) 45%, rgba(255,252,240,.85) 50%, rgba(255,236,190,.5) 55%, transparent 70%);
  background-size: 300% 100%; background-position: var(--gx, 50%) 0; mix-blend-mode: soft-light; opacity: calc(var(--glare, 0) * .9); }
.card-glare { position: absolute; inset: 0;
  background: radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255,248,230,.45), rgba(255,248,230,.12) 30%, transparent 58%);
  mix-blend-mode: overlay; opacity: calc(.15 + var(--glare, 0) * .85); }
.cap { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2em; padding: 0 12em; text-align: center; }
.nm { font-family: "Caudex", serif; font-weight: 700; font-size: 27em; line-height: 1.15; color: #34195c; text-wrap: balance; }
.fe { font-family: "Nunito Sans", sans-serif; font-weight: 800; font-size: 12.2em; letter-spacing: .08em; text-transform: uppercase; color: #7d5a12; white-space: nowrap; }
.shimmer { position: absolute; top: 0; bottom: 0; left: 0; width: 33%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent); }
.back-in { position: absolute; inset: 5em; overflow: hidden; border-radius: 19.8em; border: 2em solid #f6ead0;
  background: radial-gradient(circle at 50% 40%, #5a3394, #34195c 55%, #1f0f38);
  display: flex; flex-direction: column; align-items: center; justify-content: center; }
.back-ring { position: absolute; inset: 13.5em; border-radius: 14.4em; border: 1em solid rgba(214,164,58,.5); }
.back-hatch { position: absolute; inset: 0; opacity: .12;
  background-image: repeating-linear-gradient(45deg, #f6d58a 0 1em, transparent 1em 14em), repeating-linear-gradient(-45deg, #f6d58a 0 1em, transparent 1em 14em); }
.back-mark { position: relative; width: 50%; height: auto; aspect-ratio: 1; flex: none; color: #f6d58a; }
.back-word { position: relative; margin-top: 1.06em; font-family: "Caudex", serif; font-weight: 700; font-size: 17em; letter-spacing: .4em; padding-left: .4em; color: #f6d58a; }
.back-sheen { position: absolute; top: 0; bottom: 0; left: 0; width: 33%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent); }
.scrap { position: absolute; background: #3a3542; color: #c9c3d0; border-radius: 22px; padding: 22px 28px; font-weight: 700;
  box-shadow: 0 20px 40px -18px rgba(0,0,0,.7); border: 1px solid rgba(255,255,255,.08); line-height: 1.2; }
.scrap small { display: block; font-size: .6em; opacity: .65; margin-bottom: 6px; letter-spacing: .02em; }
.browser { position: absolute; border-radius: 22px; overflow: hidden; background: #fff;
  box-shadow: 0 50px 90px -30px rgba(52,25,92,.55), 0 0 0 2px rgba(200,151,62,.45); }
.browser .bar { height: 44px; background: #f3ece2; display: flex; align-items: center; gap: 10px; padding: 0 18px; }
.browser .bar i { width: 13px; height: 13px; border-radius: 50%; background: #d9cdbd; }
.browser .bar b { margin-left: 18px; flex: 1; height: 24px; border-radius: 12px; background: #fffdf9; font: 700 14px/24px "Nunito Sans"; color: #7a6a5a; padding-left: 14px; }
.phone { position: absolute; border-radius: 64px; background: #1c1424; padding: 16px;
  box-shadow: 0 60px 100px -30px rgba(52,25,92,.6), 0 0 0 3px rgba(200,151,62,.55); }
.phone .screen { position: relative; overflow: hidden; border-radius: 48px; background: #fffdf9; }
.pill { position: absolute; background: #fbf6ef; border: 3px solid #c8973e; border-radius: 28px; padding: 16px 26px;
  font-family: "Nunito Sans", "Noto Sans SC", sans-serif; font-weight: 800; color: #2b1a3f; line-height: 1.15; text-align: center;
  box-shadow: 0 18px 40px -16px rgba(52,25,92,.45); text-wrap: balance; }
`;
