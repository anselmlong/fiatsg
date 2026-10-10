"use client";

import { useActionState } from "react";
import { updateOrgProfile } from "@/app/actions/org";
import { CoverPicker } from "@/components/cover-picker";
import { Submit } from "@/components/submit";
import type { Org } from "@/db";

export function ProfileForm({ org }: { org: Org }) {
  const [state, action] = useActionState(updateOrgProfile, undefined);
  return (
    <form action={action} className="space-y-5">
      <label className="field"><span className="label">Organisation name</span><input name="name" defaultValue={org.name} required className="input" /></label>
      <label className="field"><span className="label">One line about what you do</span><input name="tagline" defaultValue={org.tagline} className="input" /></label>
      <label className="field"><span className="label">Your story</span><textarea name="history" rows={6} defaultValue={org.history} className="input" /></label>
      <label className="field"><span className="label">Why your work matters</span><textarea name="whyItMatters" rows={3} defaultValue={org.whyItMatters} className="input" /></label>
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="field"><span className="label">Website</span><input name="website" type="url" defaultValue={org.website ?? ""} className="input" /></label>
        <label className="field"><span className="label">Phone</span><input name="contactPhone" defaultValue={org.contactPhone ?? ""} className="input" /></label>
        <label className="field"><span className="label">Year founded</span><input name="foundedYear" inputMode="numeric" defaultValue={org.foundedYear ?? ""} className="input" /></label>
      </div>
      <div className="field"><span className="label">Cover photo</span><CoverPicker initial={org.coverUrl} upload /></div>
      {state?.error && <p className="font-bold text-bad" role="alert">{state.error}</p>}
      {state?.ok && <p className="font-bold text-ok" role="status">{state.ok}</p>}
      <Submit className="btn-primary text-lg" pending="Saving…">{org.status === "approved" ? "Save" : "Save and submit for review"}</Submit>
    </form>
  );
}
