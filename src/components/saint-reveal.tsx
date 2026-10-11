"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { markSaintSeen } from "@/app/actions/supporter";
import type { Saint } from "@/lib/saints";

// Call after an action that may have brought a saint, so the reveal doesn't wait for the next poll.
export const pingSaints = () => setTimeout(() => window.dispatchEvent(new Event("fiat:saint")), 50);

type Meeting = { meetingId: number; saint: Saint; firstName: string };
// sealed: the card waits face down. charging: it trembles and gathers light. revealed: it turns over.
type Phase = "sealed" | "charging" | "revealed";

const CHARGE_MS = 1600;

// Watches for a newly met saint (after a check-in, a prayer, or a friend joining from your link,
// even on another phone), and plays the reveal for it.
export function SaintReveal({ enabled }: { enabled: boolean }) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const check = useCallback(async () => {
    if (!enabled || document.hidden) return;
    try {
      const res = await fetch("/api/saints/next", { cache: "no-store" });
      const next: Meeting | null = await res.json();
      if (next) setMeeting((cur) => cur ?? next);
    } catch {}
  }, [enabled]);

  useEffect(() => {
    const first = setTimeout(check, 0);
    const t = setInterval(check, 5000);
    window.addEventListener("fiat:saint", check);
    window.addEventListener("focus", check);
    return () => {
      clearTimeout(first);
      clearInterval(t);
      window.removeEventListener("fiat:saint", check);
      window.removeEventListener("focus", check);
    };
  }, [check, pathname]);

  if (!meeting) return null;
  const s = meeting.saint;
  async function close() {
    const id = meeting!.meetingId;
    setMeeting(null);
    await markSaintSeen(id);
    router.refresh();
  }
  return (
    <RevealOverlay
      key={meeting.meetingId}
      saint={s}
      sealedHeading={`${meeting.firstName}, someone is here`}
      revealedHeading={`${meeting.firstName}, you've met`}
      sealedLine="A saint who did what you did is waiting on the other side."
      why={s.why}
      onEscape={close}
      actions={(tab) => (
        <>
          <a href={`/saints/${s.id}`} tabIndex={tab} onClick={() => markSaintSeen(meeting.meetingId)} className="btn-gold w-full text-lg">Read {s.name.replace(/^St /, "")}'s story</a>
          <button tabIndex={tab} onClick={close} className="btn w-full border-2 border-white/40 text-white hover:bg-white/10">Amen</button>
        </>
      )}
    />
  );
}

// Someone opened a friend's invite link: before anything else, a saint is waiting for them too.
// Joining keeps the card; either way it plays only once.
export function WelcomeReveal({ inviterName, saint }: { inviterName: string; saint: Saint }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  if (!open) return null;
  const done = () => {
    document.cookie = "fiat_welcomed=1; path=/; max-age=2592000; samesite=lax";
  };
  // Joining from a cause goes straight back to it, ready to say yes.
  const joinHref = pathname.startsWith("/causes/") ? `/join?next=${encodeURIComponent(pathname)}` : "/join";
  return (
    <RevealOverlay
      saint={saint}
      sealedHeading={`${inviterName} has sent you something`}
      revealedHeading={`${inviterName} invited you to meet`}
      sealedLine="A saint is waiting to meet you on the other side."
      why={`Joseph's yes came without a word. ${inviterName} hopes you'll say yes too.`}
      onEscape={() => { done(); setOpen(false); }}
      actions={(tab) => (
        <>
          <a href={joinHref} tabIndex={tab} onClick={done} className="btn-gold w-full text-lg">Join Fiat to keep {saint.name}</a>
          <button tabIndex={tab} onClick={() => { done(); setOpen(false); }} className="btn w-full border-2 border-white/40 text-white hover:bg-white/10">Look around first</button>
        </>
      )}
    />
  );
}

// The holy card arrives face down; a tap gathers the light and turns it over.
function RevealOverlay({
  saint: s,
  sealedHeading,
  revealedHeading,
  sealedLine,
  why,
  actions,
  onEscape,
}: {
  saint: Saint;
  sealedHeading: string;
  revealedHeading: string;
  sealedLine: string;
  why: string;
  actions: (tabIndex: number) => React.ReactNode;
  onEscape: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("sealed");
  const [sound, setSound] = useState(() => {
    try { return typeof window !== "undefined" && localStorage.getItem("fiat_sound") === "1"; } catch { return false; }
  });
  const dialogRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const gripRef = useRef<HTMLButtonElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const hand = useRef<ReturnType<typeof holdCard> | null>(null);

  useEffect(() => {
    const held = holdCard(tiltRef.current!, gripRef.current!);
    hand.current = held;
    return () => held.release();
  }, []);
  useEffect(() => hand.current?.setActive(phase !== "charging"), [phase]);

  useEffect(() => {
    // Hold the page behind still, and focus without letting the browser scroll the card away.
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    navigator.vibrate?.(15);
    // Focus the dialog itself: keyboard users land inside it, and no ring is drawn on the card.
    const t = setTimeout(() => dialogRef.current?.focus({ preventScroll: true }), 300);
    const pending = timers.current;
    return () => {
      clearTimeout(t);
      pending.forEach(clearTimeout);
      root.style.overflow = prev;
    };
  }, []);

  function reveal() {
    if (phase !== "sealed") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const charge = reduced ? 0 : CHARGE_MS;
    setPhase("charging");
    // Taps that come closer and closer together, like a held breath.
    navigator.vibrate?.([12, 160, 12, 120, 14, 90, 16, 60, 18, 40, 20, 25, 24, 15, 30]);
    if (sound && !reduced) riser(charge / 1000);
    timers.current.push(
      setTimeout(() => {
        setPhase("revealed");
        navigator.vibrate?.([60, 50, 140]);
        if (sound) bell();
      }, charge),
    );
  }

  function toggleSound() {
    const on = !sound;
    setSound(on);
    try { localStorage.setItem("fiat_sound", on ? "1" : "0"); } catch {}
    if (on) bell();
  }

  const shown = phase === "revealed";
  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reveal-heading"
      data-phase={phase}
      className="reveal-in group/reveal fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-contain bg-[#1a0d2e]/95 outline-none backdrop-blur-sm"
      onKeyDown={(e) => e.key === "Escape" && shown && onEscape()}
    >
      <Light phase={phase} />
      {/* The moment of turning: one flash of gold-white light. */}
      {shown && <div aria-hidden className="reveal-flash pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(circle_at_50%_44%,#fff9e8,rgba(246,213,138,0.85)_30%,transparent_75%)] opacity-0" />}

      <button onClick={toggleSound} className="absolute right-4 top-4 z-20 rounded-full p-3 text-white/80 hover:bg-white/10" aria-label={sound ? "Turn sound off" : "Turn sound on"}>
        {sound ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
      </button>

      <div className="relative mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-4 py-8 text-center">
        {/* Both headings share one cell, so swapping them never moves the card. */}
        <h2 id="reveal-heading" className="grid text-balance px-10 font-serif text-xl text-gold">
          <span className={`col-start-1 row-start-1 transition-opacity duration-500 ${shown ? "opacity-0" : "rise-in"}`}>{sealedHeading}</span>
          <span className={`col-start-1 row-start-1 transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"}`} aria-hidden={!shown}>{revealedHeading}</span>
        </h2>

        <div className="relative isolate mt-4">
          <div aria-hidden className="reveal-glow absolute left-1/2 top-1/2 -z-10 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.5),transparent_62%)]" />
          <button
            ref={gripRef}
            type="button"
            onClick={() => !hand.current?.wasDragged() && reveal()}
            aria-disabled={phase !== "sealed"}
            tabIndex={phase === "sealed" ? 0 : -1}
            aria-label={shown ? s.name : "Turn the card over"}
            className={`reveal-shake block w-[clamp(8rem,calc((100dvh-27.5rem)*0.75),18rem)] touch-none select-none rounded-[1.4rem] [perspective:1100px] focus-visible:outline-offset-8 ${shown ? "cursor-grab active:cursor-grabbing" : ""}`}
          >
            {/* The hand: leans toward the cursor and spins when dragged. The flip lives inside it. */}
            <div ref={tiltRef} className="handheld [transform-style:preserve-3d]">
              <div className={`relative transition-transform duration-[1000ms] ease-[cubic-bezier(0.2,1.3,0.4,1)] [transform-style:preserve-3d] ${shown ? "[transform:rotateY(0deg)]" : "[transform:rotateY(180deg)]"}`}>
                {/* The card's gold edge: thin slices between the faces, seen only when it turns. */}
                {EDGE.map((z) => (
                  <div key={z} aria-hidden className="absolute inset-0 rounded-[1.4rem] bg-[#a87a2c]" style={{ transform: `translateZ(${z}px)` }} />
                ))}
                {/* Front: the saint. */}
                <div className="card-front foil-frame relative overflow-hidden rounded-[1.4rem] p-[5px] [backface-visibility:hidden] [transform:translateZ(2px)]">
                  <div className="overflow-hidden rounded-[1.1rem] border-2 border-gold-soft bg-paper">
                    <div className="relative aspect-[3/4] bg-purple-deep">
                      <Image src={s.image} alt="" fill priority sizes="288px" draggable={false} className="object-cover" />
                      <div aria-hidden className="card-foil pointer-events-none absolute inset-0" />
                      <div aria-hidden className="card-glare pointer-events-none absolute inset-0" />
                    </div>
                    <div className="px-3 py-3">
                      <p id="reveal-title" className="font-serif text-2xl font-bold text-purple-deep">{s.name}</p>
                      {s.feast && <p className="text-xs font-bold uppercase tracking-wider text-gold-ink">Feast · {s.feast}</p>}
                    </div>
                  </div>
                  {shown && <div aria-hidden className="card-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" />}
                </div>
                {/* Back: a sealed holy card. */}
                <div className="foil-frame absolute inset-0 overflow-hidden rounded-[1.4rem] p-[5px] [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(2px)]">
                  <CardBack />
                  <div aria-hidden className="card-glare pointer-events-none absolute inset-0" />
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Before and after share one cell too. */}
        <div className="mt-6 grid w-full">
          <div className={`col-start-1 row-start-1 flex flex-col items-center justify-start gap-4 transition-opacity duration-300 ${phase === "sealed" ? "" : "pointer-events-none opacity-0"}`} aria-hidden={phase !== "sealed"}>
            <p className="rise-in text-balance text-white/80 [animation-delay:300ms]">{sealedLine}</p>
            <button onClick={reveal} tabIndex={phase === "sealed" ? 0 : -1} className="rise-in btn-gold w-full text-lg [animation-delay:500ms]">Turn the card over</button>
          </div>
          {/* Always laid out, so the space under the card never changes size when it turns. */}
          <div className={`col-start-1 row-start-1 ${shown ? "" : "invisible"}`} aria-hidden={!shown}>
            <p className={`text-balance font-serif text-xl italic text-white ${shown ? "rise-in [animation-delay:700ms]" : ""}`}>{why}</p>
            {s.patron && <p className={`mt-2 text-white/75 ${shown ? "rise-in [animation-delay:850ms]" : ""}`}>{s.patron}</p>}
            <div className={`mt-6 flex w-full flex-col gap-3 ${shown ? "rise-in [animation-delay:1100ms]" : ""}`}>{actions(shown ? 0 : -1)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Depths of the edge slices, in px, between the two faces at ±2px.
const EDGE = [-1.5, -0.75, 0, 0.75, 1.5];

// Holding the card: it leans toward the cursor, and a drag turns it in the hand. Let go and it keeps
// spinning with the flick's momentum, then a spring settles it face forward on the nearest whole turn.
// Plain DOM on purpose: it writes CSS variables every frame, so React never re-renders mid-motion.
function holdCard(tilt: HTMLElement, grip: HTMLElement) {
  const m = { rx: 0, ry: 0, vx: 0, vy: 0, turns: 0, leanX: 0, leanY: 0 };
  let drag: { id: number; x: number; y: number; t: number } | null = null;
  let travelled = 0;
  let active = true;
  let frame = 0;

  function paint() {
    // How far the face is turned from straight on, -180..180, decides where the light falls.
    const turn = (((m.ry % 360) + 540) % 360) - 180;
    tilt.style.setProperty("--rx", `${m.rx.toFixed(2)}deg`);
    tilt.style.setProperty("--ry", `${m.ry.toFixed(2)}deg`);
    tilt.style.setProperty("--gx", `${(50 + turn * 1.6).toFixed(1)}%`);
    tilt.style.setProperty("--gy", `${(50 - m.rx * 2.4).toFixed(1)}%`);
    tilt.style.setProperty("--foil", `${(115 + turn * 1.2 + m.rx).toFixed(1)}deg`);
    tilt.style.setProperty("--glare", Math.min(1, (Math.abs(turn) + Math.abs(m.rx)) / 22).toFixed(3));
  }

  function step() {
    if (!drag) {
      // Underdamped spring: a little overshoot reads as weight.
      m.vx = (m.vx + (m.leanY - m.rx) * 0.045) * 0.86;
      m.vy = (m.vy + (m.turns + m.leanX - m.ry) * 0.045) * 0.86;
      m.rx += m.vx;
      m.ry += m.vy;
    }
    paint();
    const resting = !drag && Math.abs(m.vx) + Math.abs(m.vy) < 0.005 && Math.abs(m.leanY - m.rx) + Math.abs(m.turns + m.leanX - m.ry) < 0.02;
    if (!resting) {
      frame = requestAnimationFrame(step);
      return;
    }
    // Fold the whole turns away so the numbers stay small.
    m.ry -= m.turns;
    m.turns = 0;
    paint();
    frame = 0;
  }
  const wake = () => {
    if (!frame) frame = requestAnimationFrame(step);
  };

  function lean(e: PointerEvent) {
    if (e.pointerType !== "mouse" || !active || drag) return;
    const box = tilt.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, (e.clientX - (box.left + box.width / 2)) / (innerWidth / 2)));
    const ny = Math.max(-1, Math.min(1, (e.clientY - (box.top + box.height / 2)) / (innerHeight / 2)));
    m.leanX = nx * 18;
    m.leanY = -ny * 14;
    wake();
  }
  function rest() {
    m.leanX = m.leanY = 0;
    wake();
  }
  function down(e: PointerEvent) {
    if (!active || e.button !== 0) return;
    grip.setPointerCapture(e.pointerId);
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
    travelled = 0;
    m.vx = m.vy = 0;
    wake();
  }
  function move(e: PointerEvent) {
    if (!drag || drag.id !== e.pointerId) return;
    const now = performance.now();
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    const frames = Math.max(1, now - drag.t) / 16.7;
    m.ry += dx * 0.5;
    m.rx = Math.max(-55, Math.min(55, m.rx - dy * 0.4));
    // Smoothed per-frame velocity, so the release carries the flick and not one jittery sample.
    m.vy = m.vy * 0.5 + ((dx * 0.5) / frames) * 0.5;
    m.vx = m.vx * 0.5 + ((-dy * 0.4) / frames) * 0.5;
    drag = { id: drag.id, x: e.clientX, y: e.clientY, t: now };
    travelled += Math.abs(dx) + Math.abs(dy);
  }
  function up(e: PointerEvent) {
    if (!drag || drag.id !== e.pointerId) return;
    drag = null;
    // Aim for the whole turn the flick would coast to, and let the spring carry it there.
    m.turns = Math.round((m.ry + m.vy * 18) / 360) * 360;
    m.leanX = m.leanY = 0;
    wake();
  }

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!still) {
    addEventListener("pointermove", lean);
    document.documentElement.addEventListener("pointerleave", rest);
    grip.addEventListener("pointerdown", down);
    grip.addEventListener("pointermove", move);
    grip.addEventListener("pointerup", up);
    grip.addEventListener("pointercancel", up);
  }

  return {
    // While the card gathers light it is not ours to hold: let go and let it settle.
    setActive(on: boolean) {
      active = on;
      if (on) return;
      if (drag) up({ pointerId: drag.id } as PointerEvent);
      rest();
    },
    wasDragged: () => travelled > 8,
    release() {
      cancelAnimationFrame(frame);
      removeEventListener("pointermove", lean);
      document.documentElement.removeEventListener("pointerleave", rest);
      grip.removeEventListener("pointerdown", down);
      grip.removeEventListener("pointermove", move);
      grip.removeEventListener("pointerup", up);
      grip.removeEventListener("pointercancel", up);
    },
  };
}

// The reverse of every holy card: deep purple, a gold border, a cross inside a halo.
function CardBack() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[1.1rem] border-2 border-gold-soft bg-[radial-gradient(circle_at_50%_40%,#5a3394,#34195c_55%,#1f0f38)]">
      <div aria-hidden className="absolute inset-3 rounded-[0.8rem] border border-gold/50" />
      <div aria-hidden className="absolute inset-0 opacity-[0.12] [background-image:repeating-linear-gradient(45deg,#f6d58a_0_1px,transparent_1px_14px),repeating-linear-gradient(-45deg,#f6d58a_0_1px,transparent_1px_14px)]" />
      <svg aria-hidden viewBox="0 0 100 100" className="card-back-mark relative w-1/2 text-gold">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <path d="M50 22v56M33 40h34" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <p className="relative mt-4 font-serif text-sm font-bold uppercase tracking-[0.4em] text-gold">Fiat</p>
      <div aria-hidden className="card-back-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </div>
  );
}

// Sparks: fixed positions so the server and client agree, spread around the card.
const SPARKS = [
  [22, 3.4, 0.1], [31, 2.8, 0.5], [38, 3.8, 0.2], [45, 3.1, 1.0], [52, 2.6, 0.3], [58, 3.6, 0.8], [64, 3.0, 0.15],
  [71, 3.9, 0.65], [78, 2.9, 0.4], [27, 4.2, 1.3], [49, 4.0, 1.6], [68, 3.3, 1.2], [35, 2.7, 1.8], [61, 4.4, 2.0],
];

// The light behind the card: rays and sparks. Faint while it waits, gathering while it charges, full once it turns.
// Clipped to the screen so it never adds scrolling.
function Light({ phase }: { phase: Phase }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`reveal-rays absolute left-1/2 top-[44%] h-[150vmax] w-[150vmax] -translate-x-1/2 -translate-y-1/2 transition-[opacity,scale] duration-[1200ms] ease-out ${phase === "sealed" ? "scale-75 opacity-30" : phase === "charging" ? "scale-90 opacity-60" : "scale-100 opacity-100"}`}>
        <div className="h-full w-full rounded-full bg-[repeating-conic-gradient(from_0deg,rgba(246,213,138,0.16)_0deg_5deg,transparent_5deg_15deg)] [mask-image:radial-gradient(circle,black_8%,transparent_55%)]" />
      </div>
      {phase === "revealed" &&
        SPARKS.map(([left, d, delay], i) => (
          <span
            key={i}
            className="spark absolute top-[58%] h-1.5 w-1.5 rounded-full bg-gold-soft opacity-0 shadow-[0_0_8px_2px_rgba(246,213,138,0.7)] motion-reduce:hidden"
            style={{ left: `${left}%`, ["--d" as string]: `${d}s`, ["--delay" as string]: `${delay}s` }}
          />
        ))}
    </div>
  );
}

// A soft bell made in the browser: a few decaying partials, no audio file.
function bell() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    for (const [f, g] of [[523.25, 0.25], [1046.5, 0.12], [1568, 0.06], [2637, 0.03]]) {
      const o = ctx.createOscillator();
      const v = ctx.createGain();
      o.frequency.value = f;
      v.gain.setValueAtTime(g, now);
      v.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
      o.connect(v).connect(ctx.destination);
      o.start(now);
      o.stop(now + 3);
    }
  } catch {}
}

// A quiet rising shimmer while the card gathers light.
function riser(seconds: number) {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const v = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(220, now);
    o.frequency.exponentialRampToValueAtTime(880, now + seconds);
    v.gain.setValueAtTime(0.0001, now);
    v.gain.exponentialRampToValueAtTime(0.08, now + seconds * 0.9);
    v.gain.exponentialRampToValueAtTime(0.0001, now + seconds + 0.05);
    o.connect(v).connect(ctx.destination);
    o.start(now);
    o.stop(now + seconds + 0.1);
  } catch {}
}
