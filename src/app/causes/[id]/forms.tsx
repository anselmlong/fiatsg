"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { offerHelp, pray } from "@/app/actions/supporter";
import { Submit } from "@/components/submit";
import { Candle } from "@/components/candle";
import { pingSaints } from "@/components/saint-reveal";
import { PrayIcon } from "@/components/icons";

export function OfferForm({ requestId, orgName, firstName }: { requestId: number; orgName: string; firstName: string }) {
  const [state, action] = useActionState(offerHelp.bind(null, requestId), undefined);
  useEffect(() => {
    if (state?.ok) pingSaints();
  }, [state]);
  if (state?.ok) {
    return (
      <div className="rounded-2xl bg-ok-soft p-5 text-ok" role="status">
        <p className="text-xl font-bold">Thank you, {firstName}.</p>
        <p className="mt-2 text-ink">
          We've sent your details to <strong>{orgName}</strong>. They'll contact you by phone or email to arrange the next
          steps.
        </p>
        <Link href="/me" className="btn-primary mt-4 w-full">See my causes</Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <label className="field">
        <span className="label">A note to the organisation (optional)</span>
        <textarea name="note" rows={3} className="input" placeholder="e.g. I speak Hokkien and can come most Sundays." />
      </label>
      {state?.error && <p className="font-bold text-bad" role="alert">{state.error}</p>}
      <Submit className="btn-primary w-full text-lg" pending="Sending…">I'd like to help</Submit>
      <p className="hint">Your name, email, phone and gifts will be shared with {orgName} so they can follow up with you.</p>
    </form>
  );
}

export function PrayForm({ requestId, count, alreadyPrayed, needsName }: { requestId: number; count: number; alreadyPrayed: boolean; needsName: boolean }) {
  const [state, action] = useActionState(pray.bind(null, requestId), undefined);
  useEffect(() => {
    // Let the candle light first.
    if (state?.ok === "prayed") setTimeout(pingSaints, 1800);
  }, [state]);
  const done = alreadyPrayed || !!state?.ok;
  if (done) {
    // The server re-renders with the new prayer already counted.
    const others = Math.max(0, count - 1);
    return (
      <div className="flex items-center gap-5 rounded-2xl bg-purple-deep p-5 text-white" role="status">
        <Candle lit ignite={state?.ok === "prayed"} className="h-20 w-12 shrink-0" />
        <div>
          <p className="font-serif text-xl font-bold !text-white">Your candle is lit.</p>
          <p className="text-white/85">
            {others === 0 ? "You are the first to pray for this cause." : `You and ${others} ${others === 1 ? "other" : "others"} are praying for this cause.`}
          </p>
        </div>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-3">
      <label className="field">
        <span className="label">Add a prayer (optional)</span>
        <textarea name="message" rows={2} maxLength={200} className="input" placeholder="Lord, be with…" />
      </label>
      {needsName && (
        <label className="field">
          <span className="label">Your first name (optional)</span>
          <input name="name" className="input" maxLength={40} />
        </label>
      )}
      <Submit className="btn-gold w-full text-lg" pending="Lighting your candle…"><PrayIcon aria-hidden className="h-5 w-5" /> I'll pray for this</Submit>
      <p className="hint text-center">{count === 0 ? "Be the first to pray" : `${count} people are praying`}</p>
    </form>
  );
}
