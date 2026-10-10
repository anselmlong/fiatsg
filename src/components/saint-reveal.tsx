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

// Watches for a newly met saint (after a check-in, a prayer, or a friend joining from your link,
// even on another phone) and turns their holy card over out of the dark.
export function SaintReveal({ enabled }: { enabled: boolean }) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [sound, setSound] = useState(() => {
    try { return typeof window !== "undefined" && localStorage.getItem("fiat_sound") === "1"; } catch { return false; }
  });
  const pathname = usePathname();
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!meeting) return;
    navigator.vibrate?.([30, 80, 30, 80, 120]);
    if (sound) bell();
    // Hold the page behind still, and focus without letting the browser scroll the card away.
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const t = setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 400);
    return () => {
      clearTimeout(t);
      root.style.overflow = prev;
    };
    // Play once per saint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting?.meetingId]);

  async function close() {
    if (!meeting) return;
    const id = meeting.meetingId;
    setMeeting(null);
    await markSaintSeen(id);
    router.refresh();
  }

  function toggleSound() {
    const on = !sound;
    setSound(on);
    try { localStorage.setItem("fiat_sound", on ? "1" : "0"); } catch {}
    if (on) bell();
  }

  if (!meeting) return null;
  const s = meeting.saint;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="reveal-title" className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-contain bg-[#1a0d2e]/95 backdrop-blur-sm" onKeyDown={(e) => e.key === "Escape" && close()}>
      <button onClick={toggleSound} className="absolute right-4 top-4 rounded-full p-3 text-white/80 hover:bg-white/10" aria-label={sound ? "Turn sound off" : "Turn sound on"}>
        {sound ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
      </button>
      <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-4 py-8 text-center">
        <p className="rise-in font-serif text-xl text-gold">{meeting.firstName}, you've met</p>
        <div className="relative isolate mt-4">
          <div aria-hidden className="halo-breathe absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.55),transparent_68%)]" />
          <div className="card-turn relative w-[clamp(8rem,calc((100dvh-27.5rem)*0.75),18rem)] overflow-hidden rounded-[1.4rem] bg-gold p-[5px] shadow-2xl">
            <div className="overflow-hidden rounded-[1.1rem] border-2 border-gold-soft bg-paper">
              <div className="relative aspect-[3/4] bg-purple-deep">
                <Image src={s.image} alt={s.name} fill priority sizes="288px" className="object-cover" />
              </div>
              <div className="px-3 py-3">
                <h2 id="reveal-title" className="font-serif text-2xl font-bold">{s.name}</h2>
                {s.feast && <p className="text-xs font-bold uppercase tracking-wider text-gold-ink">Feast · {s.feast}</p>}
              </div>
            </div>
            <div aria-hidden className="card-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>
        <p className="rise-in mt-6 text-balance font-serif text-xl italic text-white [animation-delay:1200ms]">{s.why}</p>
        {s.patron && <p className="rise-in mt-2 text-white/75 [animation-delay:1300ms]">{s.patron}</p>}
        <div className="rise-in mt-6 flex w-full flex-col gap-3 [animation-delay:1500ms]">
          <a href={`/saints/${s.id}`} onClick={() => markSaintSeen(meeting.meetingId)} className="btn-gold w-full text-lg">Read {s.name.replace(/^St /, "")}'s story</a>
          <button ref={closeRef} onClick={close} className="btn w-full border-2 border-white/40 text-white hover:bg-white/10">Amen</button>
        </div>
      </div>
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
