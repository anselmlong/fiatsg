"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { joinSupporter } from "@/app/actions/auth";
import { Submit } from "@/components/submit";
import { SkillPicker } from "@/components/ui";
import { AREAS } from "@/lib/skills";

// Two short steps: the account, then gifts. Someone arriving from a cause skips
// the gifts step so they can offer help straight away; they can add gifts later.
export function JoinForm({ next }: { next: string }) {
  const [state, action] = useActionState(joinSupporter, undefined);
  const quick = next.startsWith("/causes/");
  const [step, setStep] = useState(0);
  const first = useRef<HTMLFieldSetElement>(null);
  // Every error the server can return is about the account fields, so show those again.
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state?.error) setStep(0);
  }

  function toGifts() {
    const bad = [...first.current!.querySelectorAll("input")].find((f) => !f.checkValidity());
    if (bad) return bad.reportValidity();
    setStep(1);
  }

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="next" value={next} />
      {!quick && <p className="text-sm font-bold text-muted">Step {step + 1} of 2</p>}

      <fieldset ref={first} hidden={step !== 0} className="space-y-5">
        <legend className="text-2xl font-bold text-purple-deep">About you</legend>
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
      </fieldset>

      {!quick && (
        <fieldset hidden={step !== 1} className="space-y-5">
          <legend className="text-2xl font-bold text-purple-deep">Your gifts</legend>
          <p className="text-muted">Tap everything you enjoy or are good at. There are no wrong answers — listening is a gift too.</p>
          <SkillPicker />
          <label className="field">
            <span className="label">Anything else? <span className="font-normal text-muted">(optional)</span></span>
            <input name="otherSkill" className="input" placeholder="e.g. sign language, gardening, accounting" />
          </label>
          <label className="field">
            <span className="label">Which part of Singapore are you near?</span>
            <select name="area" className="input" defaultValue="">
              <option value="">I can go anywhere</option>
              {AREAS.filter((a) => a !== "Online").map((a) => <option key={a}>{a}</option>)}
            </select>
          </label>
        </fieldset>
      )}

      {state?.error && <p className="rounded-2xl bg-bad-soft p-4 font-bold text-bad" role="alert">{state.error}</p>}

      {quick ? (
        <>
          <Submit className="btn-primary w-full text-lg" pending="Creating your account…">Join and offer my help</Submit>
          <p className="hint text-center">You can add your gifts later, so we can suggest more causes for you.</p>
        </>
      ) : step === 0 ? (
        <button type="button" onClick={toGifts} className="btn-primary w-full text-lg">
          Next: your gifts <ChevronRight aria-hidden className="h-5 w-5" />
        </button>
      ) : (
        <div className="space-y-3">
          <Submit className="btn-primary w-full text-lg" pending="Creating your account…">Join and find my causes</Submit>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => setStep(0)} className="btn-ghost">
              <ChevronLeft aria-hidden className="h-5 w-5" /> Back
            </button>
            <p className="hint">Not sure yet? Just join — you can choose gifts later.</p>
          </div>
        </div>
      )}
    </form>
  );
}
