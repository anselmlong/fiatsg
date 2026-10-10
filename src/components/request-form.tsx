"use client";

import { useActionState, useState } from "react";
import type { Request } from "@/db";
import type { FormState } from "@/lib/forms";
import { AGE_GROUPS, AREAS, WEEKDAYS } from "@/lib/skills";
import { CoverPicker } from "./cover-picker";
import { DateField, Select, TimeSelect } from "./date-time";
import { MediaUploader } from "./media-uploader";
import { Submit } from "./submit";
import { SkillPicker } from "./ui";

export function RequestForm({
  action: serverAction,
  initial,
  submitLabel,
}: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  initial?: Request;
  submitLabel: string;
}) {
  const [state, action] = useActionState(serverAction, undefined);
  const [kind, setKind] = useState<"one_off" | "regular">(initial?.kind ?? "one_off");
  const [area, setArea] = useState(initial?.area ?? "Central");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");

  return (
    <form action={action} className="space-y-10">
      <fieldset className="space-y-5">
        <legend className="text-2xl font-bold text-purple-deep">1. What do you need help with?</legend>
        <label className="field">
          <span className="label">Title</span>
          <input name="title" required defaultValue={initial?.title} className="input" placeholder="e.g. Sunday afternoon companions for our seniors" />
        </label>
        <label className="field">
          <span className="label">One-line summary</span>
          <input name="summary" required defaultValue={initial?.summary} maxLength={160} className="input" placeholder="What will volunteers actually do?" />
        </label>
        <label className="field">
          <span className="label">Tell the story — why does this matter?</span>
          <textarea name="story" required rows={7} defaultValue={initial?.story} className="input" placeholder="Who will this help? What difference will a volunteer make? Real stories (with permission) move people most." />
          <span className="hint">Leave a blank line between paragraphs.</span>
        </label>
        <div className="field">
          <span className="label">Cover photo</span>
          <CoverPicker initial={initial?.coverUrl} upload />
        </div>
        <div className="field">
          <span className="label">More photos and videos <span className="font-normal text-muted">(optional)</span></span>
          <span className="hint">Show volunteers what they'll be part of. Up to 6, shown on your cause page. Videos up to 200 MB.</span>
          <MediaUploader initial={initial?.media} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-2xl font-bold text-purple-deep">2. Which gifts do you need?</legend>
        <SkillPicker selected={initial?.skills ?? []} />
        <label className="field max-w-xs">
          <span className="label">How many volunteers?</span>
          <input name="volunteersNeeded" type="number" min={1} max={500} defaultValue={initial?.volunteersNeeded ?? 5} className="input" />
        </label>
        <div className="field">
          <span className="label">Who can come?</span>
          <div className="grid gap-2 sm:grid-cols-3">
            {AGE_GROUPS.map((a) => (
              <label key={a.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-white px-4 py-3 font-semibold has-[:checked]:border-purple has-[:checked]:bg-purple-soft">
                <input type="radio" name="ageGroup" value={a.id} defaultChecked={(initial?.ageGroup ?? "all") === a.id} className="h-5 w-5 accent-[var(--purple)]" />
                {a.label}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-2xl font-bold text-purple-deep">3. When?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { id: "one_off", t: "One-off", d: "A single day or event" },
            { id: "regular", t: "Regular", d: "Every week, on the same day(s)" },
          ].map((k) => (
            <label key={k.id} className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-line bg-white p-4 has-[:checked]:border-purple has-[:checked]:bg-purple-soft">
              <input type="radio" name="kind" value={k.id} checked={kind === k.id} onChange={() => setKind(k.id as "one_off" | "regular")} className="mt-1 h-5 w-5 accent-[var(--purple)]" />
              <span><span className="block text-lg font-bold">{k.t}</span><span className="text-muted">{k.d}</span></span>
            </label>
          ))}
        </div>
        {kind === "regular" && (
          <div className="field">
            <span className="label">Which day(s) of the week?</span>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => (
                <label key={d} className="flex h-14 w-16 cursor-pointer items-center justify-center rounded-2xl border-2 border-line bg-white font-bold has-[:checked]:border-purple has-[:checked]:bg-purple has-[:checked]:text-white">
                  <input type="checkbox" name="weekdays" value={d} defaultChecked={initial?.weekdays.includes(d)} className="sr-only" />
                  {d}
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="field">
            <span className="label">{kind === "regular" ? "Starting from" : "Date"}</span>
            <DateField name="startDate" initial={initial?.startDate} required onChange={setStartDate} />
          </div>
          {kind === "regular" && (
            <div className="field">
              <span className="label">Until <span className="font-normal text-muted">(optional)</span></span>
              <DateField name="endDate" initial={initial?.endDate} min={startDate} placeholder="No end date" />
            </div>
          )}
          <label className="field">
            <span className="label">Start time</span>
            <TimeSelect name="startTime" initial={initial?.startTime ?? "10:00"} />
          </label>
          <label className="field">
            <span className="label">End time</span>
            <TimeSelect name="endTime" initial={initial?.endTime ?? "12:00"} />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-2xl font-bold text-purple-deep">4. Where?</legend>
        <label className="field">
          <span className="label">Area</span>
          <Select name="area" value={area} onChange={(e) => setArea(e.target.value)}>
            {AREAS.map((a) => <option key={a} value={a}>{a === "Online" ? "Online / from home" : a}</option>)}
          </Select>
        </label>
        {area !== "Online" && (
          <label className="field">
            <span className="label">Address</span>
            <input name="address" defaultValue={initial?.address ?? ""} className="input" placeholder="e.g. Church of St Michael, 17 St Michael's Road" />
          </label>
        )}
      </fieldset>

      {state?.error && <p className="rounded-2xl bg-bad-soft p-4 font-bold text-bad" role="alert">{state.error}</p>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Submit className="btn-primary text-lg" pending="Sending…">{submitLabel}</Submit>
        <p className="hint">The Catholic Foundation will review your request before it goes live.</p>
      </div>
    </form>
  );
}
