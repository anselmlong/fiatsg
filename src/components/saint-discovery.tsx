"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Bird, BookOpen, KeyRound } from "lucide-react";
import { claimDiscovery } from "@/app/actions/discoveries";
import type { Discovery } from "@/lib/bonus-saints";
import type { SaintSource } from "@/lib/saint-sources";
import { pingSaints } from "./saint-reveal";

function useDiscovery(discovery: Discovery) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [signIn, setSignIn] = useState(false);
  const [found, setFound] = useState(false);
  const inFlight = useRef(false);
  const pathname = usePathname();
  function claim() {
    if (inFlight.current || found) return;
    inFlight.current = true;
    startTransition(async () => {
      try {
        const result = await claimDiscovery(discovery);
        setSignIn(result.status === "sign-in");
        if (result.status === "found" || result.status === "already") {
          setFound(true);
          setMessage(result.status === "found" ? `You found ${result.name}'s bonus card!` : `${result.name}'s bonus card is already in your collection.`);
          pingSaints();
        } else if (result.status === "sign-in") {
          setMessage("A bonus card is waiting. Log in as a supporter, then try this discovery again to keep it.");
        } else if (result.status === "supporter-only") {
          setMessage("Bonus cards are collected with a supporter account.");
        } else {
          setMessage("This discovery isn't available.");
        }
      } catch {
        setMessage("Couldn't save your discovery. Please try again.");
      } finally {
        inFlight.current = false;
      }
    });
  }
  const feedback = (
    <div className="max-w-sm text-sm text-muted" role="status" aria-live="polite">
      {message && <p>{message}</p>}
      {signIn && <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="mt-2 inline-block font-bold">Log in to collect</Link>}
      {found && <Link href="/faith#bonus-cards" className="mt-2 inline-block font-bold">Your bonus cards →</Link>}
    </div>
  );
  return { claim, pending, found, feedback };
}

export function SaintDiscovery({ discovery }: { discovery: "lost-key" | "bird" }) {
  const { claim, pending, found, feedback } = useDiscovery(discovery);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const button = ref.current;
    if (discovery !== "bird" || !button || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        button.dataset.landed = "true";
        observer.disconnect();
      }
    });
    observer.observe(button);
    return () => observer.disconnect();
  }, [discovery]);
  const Icon = discovery === "bird" ? Bird : KeyRound;
  return (
    <div className="w-fit">
      <button ref={ref} type="button" onClick={claim} disabled={pending || found}
        aria-label={discovery === "bird" ? "Say hello to the little bird" : "Pick up the lost key"}
        className={`${discovery === "bird" ? "discovery-bird" : ""} inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-gold-ink transition-colors hover:bg-gold-soft focus-visible:bg-gold-soft disabled:opacity-60`}>
        <Icon aria-hidden className={discovery === "bird" ? "h-7 w-7" : "h-5 w-5 -rotate-12"} strokeWidth={1.5} />
      </button>
      {feedback}
    </div>
  );
}

export function SaintSources({ sources }: { sources: SaintSource[] }) {
  const { claim, pending, found, feedback } = useDiscovery("sources");
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-10 border-t border-line pt-5" aria-label="Story sources">
      <button type="button" aria-expanded={open} aria-controls={id} className="inline-flex min-h-11 items-center gap-2 font-bold text-purple"
        onClick={() => { setOpen(!open); if (!open) claim(); }}>
        <BookOpen aria-hidden className="h-4 w-4" /> {open ? "Close the sources" : "Read the sources"}
      </button>
      <div id={id} hidden={!open} className="mt-3 space-y-4">
        <p className="text-sm text-muted">The reading behind this saint's story and quotation.</p>
        <ul className="space-y-2">
          {sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm underline">{source.label}<span className="sr-only"> (opens in a new tab)</span></a></li>)}
        </ul>
        {feedback}
        {!found && <button type="button" onClick={claim} disabled={pending} className="text-sm font-bold text-purple disabled:opacity-60">{pending ? "Checking your discovery…" : "Keep this discovery"}</button>}
      </div>
    </section>
  );
}
