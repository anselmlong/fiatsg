"use client";

import Link from "next/link";
import { useActionState } from "react";
import { offerHelp, pray } from "@/app/actions/supporter";
import { Submit } from "@/components/submit";
import { PrayIcon } from "@/components/icons";

export function OfferForm({ requestId, orgName, firstName }: { requestId: number; orgName: string; firstName: string }) {
  const [state, action] = useActionState(offerHelp.bind(null, requestId), undefined);
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
      <p className="hint">Your name, email, phone and skills will be shared with {orgName} so they can follow up with you.</p>
    </form>
  );
}

export function PrayForm({ requestId, count, alreadyPrayed, needsName }: { requestId: number; count: number; alreadyPrayed: boolean; needsName: boolean }) {
  const [state, action] = useActionState(pray.bind(null, requestId), undefined);
  const done = alreadyPrayed || !!state?.ok;
  if (done) {
    return (
      <div className="rounded-2xl bg-purple-soft p-5 text-center" role="status">
        <PrayIcon aria-hidden className="mx-auto h-10 w-10 text-purple" strokeWidth={1.5} />
        <p className="mt-2 text-lg font-bold text-purple-deep">You're praying for this cause</p>
        <p className="text-muted">along with {state?.ok === "prayed" ? count + 1 : count} others. Thank you.</p>
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
      <Submit className="btn-gold w-full text-lg" pending="Praying…"><PrayIcon aria-hidden className="h-5 w-5" /> I'll pray for this</Submit>
      <p className="hint text-center">{count === 0 ? "Be the first to pray" : `${count} people are praying`}</p>
    </form>
  );
}
