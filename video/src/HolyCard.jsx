import { Img, staticFile } from "remotion";
import SAINTS from "./saints.json";
import { lerp } from "./lib.js";

export const byId = Object.fromEntries(SAINTS.map((s) => [s.id, s]));
export const CARD_H = 478.3 / 288;
const EDGE = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

// The reverse of every holy card: deep purple, a gold border, a cross inside a halo, "FIAT".
function Back({ sheen, glow }) {
  return (
    <div className="face foil-frame" style={{ transform: "rotateY(180deg) translateZ(4.5em)" }}>
      <div className="back-in">
        <div className="back-ring" />
        <div className="back-hatch" />
        <svg viewBox="0 0 100 100" className="back-mark" style={{ filter: `drop-shadow(0 0 ${glow}em rgba(246,213,138,0.8))` }}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
          <path d="M50 22v56M33 40h34" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <p className="back-word">FIAT</p>
        <div className="back-sheen" style={{ transform: `translateX(${sheen}%) skewX(-18deg)` }} />
        <div className="card-glare" />
      </div>
    </div>
  );
}

// A holy card at centre (x, y), w px wide, turned by ry/rx degrees. `ids` lists every saint the card
// may show (all stay mounted, so a face swap never waits on an image); `face` picks the one shown.
export function HolyCard({ ids, face = ids[0], x, y, w, ry = 0, rx = 0, rz = 0, s = 1, o = 1, z, edges = true, back = true, sweep = -1, sheen = -120, glow = 4, shadow }) {
  // The light falls where the face is turned, exactly as the app's holdCard paint() does it.
  const turn = (((ry % 360) + 540) % 360) - 180;
  const vars = {
    "--gx": `${(50 + turn * 1.6).toFixed(1)}%`,
    "--gy": `${(50 - rx * 2.4).toFixed(1)}%`,
    "--foil": `${(115 + turn * 1.2 + rx).toFixed(1)}deg`,
    "--glare": Math.min(1, (Math.abs(turn) + Math.abs(rx)) / 22).toFixed(3),
  };
  const visible = o > 0.001 && s > 0.001;
  return (
    <div
      className="card"
      style={{
        fontSize: `${w / 288}px`, left: x - w / 2, top: y - (w * CARD_H) / 2, zIndex: z,
        transform: `rotateZ(${rz}deg) scale(${s})`, opacity: o, visibility: visible ? "visible" : "hidden",
        borderRadius: shadow ? "25.2em" : undefined, boxShadow: shadow,
      }}
    >
      <div className="spin" style={{ transform: `rotateX(${rx}deg) rotateY(${ry}deg)`, ...vars }}>
        {edges && EDGE.map((e) => <div key={e} className="edge" style={{ transform: `translateZ(${e}em)` }} />)}
        <div className="face foil-frame" style={{ transform: "translateZ(4.5em)" }}>
          {ids.map((id) => {
            const st = byId[id];
            return (
              <div key={id} className="inner" style={{ display: id === face ? "flex" : "none" }}>
                <div className="paint">
                  <Img src={staticFile(st.image)} />
                  <div className="card-foil" />
                  <div className="card-glare" />
                </div>
                <div className="cap">
                  <p className="nm">{st.name}</p>
                  <p className="fe">Feast · {st.feast}</p>
                </div>
              </div>
            );
          })}
          <div className="shimmer" style={{ transform: `translateX(${lerp(-120, 340, Math.max(0, sweep))}%) skewX(-18deg)`, opacity: sweep > 0 && sweep < 1 ? 1 : 0 }} />
        </div>
        {back && <Back sheen={sheen} glow={glow} />}
      </div>
    </div>
  );
}

// A soft spark of gold light.
export function Dot({ x, y, r, a }) {
  if (a <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute", left: x - r * 4, top: y - r * 4, width: r * 8, height: r * 8, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,246,214,${a}) 0%, rgba(246,213,138,${a * 0.75}) 25%, rgba(246,213,138,0) 70%)`,
      }}
    />
  );
}
