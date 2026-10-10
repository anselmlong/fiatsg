"use client";

import { useActionState } from "react";
import { completeRequest, postUpdate } from "@/app/actions/org";
import { Submit } from "@/components/submit";
import { COVER_LIBRARY } from "@/lib/skills";

export function UpdateForm({ requestId }: { requestId: number }) {
  const [state, action] = useActionState(postUpdate.bind(null, requestId), undefined);
  return (
    <form action={action} key={state?.ok} className="space-y-3">
      <textarea name="body" rows={4} required className="input" placeholder="e.g. Thank you to everyone who came on Sunday. The residents asked when you are coming back." />
      <label className="field">
        <span className="label">Photo (optional)</span>
        <select name="photoUrl" className="input" defaultValue="">
          <option value="">No photo</option>
          {COVER_LIBRARY.map((c) => <option key={c.url} value={c.url}>{c.label}</option>)}
        </select>
      </label>
      {state?.error && <p className="font-bold text-bad" role="alert">{state.error}</p>}
      {state?.ok && <p className="font-bold text-ok" role="status">{state.ok}</p>}
      <Submit className="btn-primary w-full" pending="Posting…">Post update</Submit>
    </form>
  );
}

export function CompleteForm({ requestId }: { requestId: number }) {
  const [state, action] = useActionState(completeRequest.bind(null, requestId), undefined);
  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="field">
          <span className="label">Hours given</span>
          <input name="outcomeHours" type="number" min={0} className="input" />
        </label>
        <label className="field">
          <span className="label">People served</span>
          <input name="outcomePeopleServed" type="number" min={0} className="input" />
        </label>
      </div>
      <label className="field">
        <span className="label">What was achieved?</span>
        <textarea name="outcomeSummary" rows={3} required className="input" />
      </label>
      {state?.error && <p className="font-bold text-bad" role="alert">{state.error}</p>}
      <Submit className="btn-gold w-full" pending="Saving…">Mark as completed</Submit>
    </form>
  );
}
