"use client";

import { useActionState } from "react";
import { joinOrg } from "@/app/actions/auth";
import { Submit } from "@/components/submit";

// Only what the Catholic Foundation needs to review. Website, year founded,
// cover photo and "why it matters" can be added on the profile page later.
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
          <textarea name="history" rows={5} required minLength={20} className="input" placeholder="How did you begin? Who do you serve? What have you done so far?" />
          <span className="hint">A few sentences is enough. You can add photos, a website and more once you're in.</span>
        </label>
      </fieldset>
      <fieldset className="space-y-5">
        <legend className="text-2xl font-bold text-purple-deep">2. Contact person</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field">
            <span className="label">Your name</span>
            <input name="name" autoComplete="name" required className="input" />
          </label>
          <label className="field">
            <span className="label">Phone</span>
            <input name="phone" type="tel" autoComplete="tel" className="input" />
          </label>
        </div>
        <label className="field">
          <span className="label">Email</span>
          <input name="email" type="email" autoComplete="email" required className="input" />
        </label>
        <label className="field">
          <span className="label">Choose a password</span>
          <input name="password" type="password" autoComplete="new-password" minLength={6} required className="input" />
          <span className="hint">At least 6 characters.</span>
        </label>
      </fieldset>
      {state?.error && <p className="rounded-2xl bg-bad-soft p-4 font-bold text-bad" role="alert">{state.error}</p>}
      <Submit className="btn-primary w-full text-lg" pending="Submitting…">Submit for review</Submit>
    </form>
  );
}
