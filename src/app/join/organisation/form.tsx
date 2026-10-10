"use client";

import { useActionState } from "react";
import { joinOrg } from "@/app/actions/auth";
import { CoverPicker } from "@/components/cover-picker";
import { Submit } from "@/components/submit";

export function OrgJoinForm() {
  const [state, action] = useActionState(joinOrg, undefined);
  return (
    <form action={action} className="space-y-8">
      <fieldset className="space-y-5">
        <legend className="text-2xl font-bold text-purple-deep">1. Your organisation</legend>
        <label className="field">
          <span className="label">Organisation name</span>
          <input name="orgName" required className="input" />
        </label>
        <label className="field">
          <span className="label">One line about what you do</span>
          <input name="tagline" className="input" placeholder="e.g. Befriending seniors living alone in Toa Payoh" />
        </label>
        <label className="field">
          <span className="label">Your story</span>
          <textarea name="history" rows={5} required className="input" placeholder="How did you begin? Who do you serve? What have you done so far?" />
        </label>
        <label className="field">
          <span className="label">Why does your work matter?</span>
          <textarea name="whyItMatters" rows={3} className="input" placeholder="Help a volunteer understand what's at stake for the people you serve." />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field">
            <span className="label">Website <span className="font-normal text-muted">(optional)</span></span>
            <input name="website" type="url" className="input" placeholder="https://" />
          </label>
          <label className="field">
            <span className="label">Year founded <span className="font-normal text-muted">(optional)</span></span>
            <input name="foundedYear" inputMode="numeric" className="input" />
          </label>
        </div>
        <div className="field">
          <span className="label">Cover photo</span>
          <CoverPicker />
        </div>
      </fieldset>
      <fieldset className="space-y-5">
        <legend className="text-2xl font-bold text-purple-deep">2. Contact person</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field">
            <span className="label">Your name</span>
            <input name="name" required className="input" />
          </label>
          <label className="field">
            <span className="label">Phone</span>
            <input name="phone" type="tel" className="input" />
          </label>
        </div>
        <label className="field">
          <span className="label">Email</span>
          <input name="email" type="email" required className="input" />
        </label>
        <label className="field">
          <span className="label">Choose a password</span>
          <input name="password" type="password" minLength={6} required className="input" />
        </label>
      </fieldset>
      {state?.error && <p className="rounded-2xl bg-bad-soft p-4 font-bold text-bad" role="alert">{state.error}</p>}
      <Submit className="btn-primary w-full text-lg" pending="Submitting…">Submit for review</Submit>
    </form>
  );
}
