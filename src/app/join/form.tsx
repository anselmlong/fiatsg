"use client";

import { useActionState } from "react";
import { joinSupporter } from "@/app/actions/auth";
import { Submit } from "@/components/submit";
import { SkillPicker } from "@/components/ui";
import { AREAS } from "@/lib/skills";

export function JoinForm({ next }: { next: string }) {
  const [state, action] = useActionState(joinSupporter, undefined);
  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="next" value={next} />
      <fieldset className="space-y-5">
        <legend className="text-2xl font-bold text-purple-deep">1. About you</legend>
        <label className="field">
          <span className="label">Your name</span>
          <input name="name" autoComplete="name" required className="input" />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field">
            <span className="label">Email</span>
            <input name="email" type="email" autoComplete="email" required className="input" />
          </label>
          <label className="field">
            <span className="label">Phone <span className="font-normal text-muted">(optional)</span></span>
            <input name="phone" type="tel" autoComplete="tel" className="input" placeholder="9123 4567" />
            <span className="hint">So organisations can call you instead of emailing.</span>
          </label>
        </div>
        <label className="field">
          <span className="label">Choose a password</span>
          <input name="password" type="password" autoComplete="new-password" minLength={6} required className="input" />
          <span className="hint">At least 6 characters.</span>
        </label>
        <label className="field">
          <span className="label">Which part of Singapore are you near?</span>
          <select name="area" className="input" defaultValue="">
            <option value="">I can go anywhere</option>
            {AREAS.filter((a) => a !== "Online").map((a) => <option key={a}>{a}</option>)}
          </select>
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-2xl font-bold text-purple-deep">2. Your gifts</legend>
        <p className="text-muted">Tap everything you enjoy or are good at. There are no wrong answers — listening is a gift too.</p>
        <SkillPicker />
        <label className="field">
          <span className="label">Anything else? <span className="font-normal text-muted">(optional)</span></span>
          <input name="otherSkill" className="input" placeholder="e.g. sign language, gardening, accounting" />
        </label>
      </fieldset>

      {state?.error && <p className="rounded-2xl bg-bad-soft p-4 font-bold text-bad" role="alert">{state.error}</p>}
      <Submit className="btn-primary w-full text-lg" pending="Creating your account…">Join and find my causes</Submit>
    </form>
  );
}
