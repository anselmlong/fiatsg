"use client";

import { Check, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { startTransition, useActionState, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { Request } from "@/db";
import { fmtSchedule } from "@/lib/format";
import type { FormState } from "@/lib/forms";
import { AGE_GROUPS, AREAS, WEEKDAYS, ageLabel, skillLabel } from "@/lib/skills";
import { CATEGORIES, categoryLabel } from "@/lib/saints";
import { CoverPicker } from "./cover-picker";
import { DateField, Select, TimeSelect, timeLabel } from "./date-time";
import { MediaUploader } from "./media-uploader";
import { Submit } from "./submit";
import { SkillPicker } from "./ui";

const STEPS = ["What", "Gifts", "When", "Where", "Check"] as const;
const REVIEW = STEPS.length - 1;

const TIME_PRESETS = [
  { label: "Morning", start: "09:00", end: "12:00" },
  { label: "Afternoon", start: "14:00", end: "17:00" },
  { label: "Evening", start: "19:00", end: "21:00" },
];

// One form split into steps. Every step stays in the DOM (just hidden), so
// the final submit sends all fields together and nothing is lost going back.
// It submits from onSubmit rather than `action`: React resets a form after its
// action returns, which would silently empty the hidden steps on a server error.
export function RequestForm({
  action: serverAction,
  initial,
  submitLabel,
}: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  initial?: Request;
  submitLabel: string;
}) {
  const [state, action, pending] = useActionState(serverAction, undefined);
  const form = useRef<HTMLFormElement>(null);
  // Editing starts on the summary, so people jump straight to what they want to change.
  const [step, setStep] = useState(initial ? REVIEW : 0);
  const [reached, setReached] = useState(initial ? REVIEW : 0);
  const [snapshot, setSnapshot] = useState(() => (initial ? fromRequest(initial) : null));
  const [stepError, setStepError] = useState("");
  const [kind, setKind] = useState<"one_off" | "regular">(initial?.kind ?? "one_off");
  const [area, setArea] = useState(initial?.area ?? "Central");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [startTime, setStartTime] = useState(initial?.startTime ?? "10:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "12:00");

  // Native validation for one step, plus the checks the browser can't do.
  // On a problem it shows that step, so the message sits next to the field.
  function stepIsValid(i: number) {
    const fieldset = form.current?.querySelector<HTMLFieldSetElement>(`[data-step="${i}"]`);
    if (!fieldset) return true;
    const fields = [...fieldset.querySelectorAll<HTMLInputElement>("input, select, textarea")];
    const bad = fields.find((f) => !f.checkValidity());
    const fd = new FormData(form.current!);
    const endDate = String(fd.get("endDate") ?? "");
    const problem = bad
      ? ""
      : i === 0 && String(fd.get("story") ?? "").trim().length < 30
        ? "Please tell volunteers a little more about why this matters (a few sentences)."
        : i === 1 && !fd.getAll("skills").length
          ? "Please choose at least one gift you need."
          : i === 2 && kind === "regular" && !fd.getAll("weekdays").length
            ? "Please choose which day(s) of the week."
            : i === 2 && kind === "regular" && endDate && endDate < String(fd.get("startDate") ?? "")
              ? "The end date can't be before the start date."
              : i === 2 && endTime <= startTime
                ? "The end time needs to be after the start time."
                : "";
    if (!bad && !problem) return true;
    if (i !== step) flushSync(() => setStep(i));
    if (bad) {
      // The date field's real input is hidden; point at its calendar button instead.
      if (bad.classList.contains("sr-only")) {
        setStepError("Please choose a date.");
        (bad.nextElementSibling as HTMLElement | null)?.focus();
      } else {
        setStepError("");
        bad.reportValidity();
      }
    } else setStepError(problem);
    return false;
  }

  function go(to: number) {
    if (to > step) {
      for (let i = step; i < to; i++) if (!stepIsValid(i)) return;
    } else setStepError("");
    if (to === REVIEW) setSnapshot(new FormData(form.current!));
    setStep(to);
    setReached((r) => Math.max(r, to));
    form.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <form
      ref={form}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        // Re-check every step: an edit opens on Check without visiting the others.
        for (let i = 0; i < REVIEW; i++) if (!stepIsValid(i)) return;
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      onChange={() => setStepError("")}
      className="scroll-mt-28 space-y-8"
    >
      <ol aria-label="Steps" className="flex gap-1.5 sm:gap-2">
        {STEPS.map((label, i) => {
          const done = i < step;
          return (
            <li key={label} className="min-w-0 flex-1">
              <button
                type="button"
                disabled={i === step || i > reached}
                onClick={() => go(i)}
                aria-current={i === step ? "step" : undefined}
                className="flex w-full flex-col items-center gap-1.5 disabled:cursor-default"
              >
                <span className={`h-1.5 w-full rounded-full ${i <= step ? "bg-purple" : "bg-line"}`} />
                <span className={`flex items-center gap-1 truncate text-sm font-bold ${i === step ? "text-purple-deep" : done ? "text-purple" : "text-muted"}`}>
                  {done && <Check aria-hidden className="hidden h-3.5 w-3.5 shrink-0 sm:block" />}
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <fieldset data-step={0} hidden={step !== 0} className="space-y-5">
        <legend className="text-2xl font-bold text-purple-deep">What do you need help with?</legend>
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
          <span className="hint">A few sentences is enough. Leave a blank line between paragraphs.</span>
        </label>
        <div className="field">
          <span className="label">Cover photo</span>
          <span className="hint">We've picked one for you. Tap another or upload your own.</span>
          <CoverPicker initial={initial?.coverUrl} upload />
        </div>
        <details className="group" open={!!initial?.media.length}>
          <summary className="cursor-pointer list-none font-bold text-purple">
            <span className="group-open:hidden">+ Add more photos or videos (optional)</span>
            <span className="hidden group-open:inline">More photos and videos (optional)</span>
          </summary>
          <div className="field mt-3">
            <span className="hint">Show volunteers what they'll be part of. Up to 6, shown on your cause page. Videos up to 200 MB.</span>
            <MediaUploader initial={initial?.media} />
          </div>
        </details>
      </fieldset>

      <fieldset data-step={1} hidden={step !== 1} className="space-y-5">
        <legend className="text-2xl font-bold text-purple-deep">Which gifts do you need?</legend>
        <p className="text-muted">Tap all that apply. Volunteers with these gifts will see your cause first.</p>
        <SkillPicker selected={initial?.skills ?? []} />
        <label className="field">
          <span className="label">Who does this cause serve?</span>
          <Select name="category" defaultValue={initial?.category ?? ""}>
            <option value="" disabled>Choose one</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        </label>
        <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
          <label className="field">
            <span className="label">How many volunteers?</span>
            <input name="volunteersNeeded" type="number" min={1} max={500} required defaultValue={initial?.volunteersNeeded ?? 5} className="input" />
          </label>
          <label className="field">
            <span className="label">Who can come?</span>
            <Select name="ageGroup" defaultValue={initial?.ageGroup ?? "all"}>
              {AGE_GROUPS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </Select>
          </label>
        </div>
      </fieldset>

      <fieldset data-step={2} hidden={step !== 2} className="space-y-5">
        <legend className="text-2xl font-bold text-purple-deep">When?</legend>
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
                <label key={d} className="flex h-14 w-16 cursor-pointer items-center justify-center rounded-2xl border-2 border-line bg-white font-bold has-[:checked]:border-purple has-[:checked]:bg-purple has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold">
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
            <DateField
              name="startDate"
              initial={initial?.startDate}
              required
              onChange={(d) => {
                setStartDate(d);
                setStepError("");
              }}
            />
          </div>
          {kind === "regular" && (
            <div className="field">
              <span className="label">Until <span className="font-normal text-muted">(optional)</span></span>
              <DateField name="endDate" initial={initial?.endDate} min={startDate} placeholder="No end date" />
            </div>
          )}
        </div>
        <div className="field">
          <span className="label">Time</span>
          <div className="flex flex-wrap gap-2">
            {TIME_PRESETS.map((p) => {
              const on = startTime === p.start && endTime === p.end;
              return (
                <button
                  key={p.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setStartTime(p.start);
                    setEndTime(p.end);
                    setStepError("");
                  }}
                  className={`min-h-12 rounded-2xl border-2 px-4 font-bold ${on ? "border-purple bg-purple-soft text-purple-deep" : "border-line bg-white"}`}
                >
                  {p.label} <span className="font-normal text-muted">{timeLabel(p.start)}–{timeLabel(p.end)}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 grid gap-5 sm:grid-cols-2">
            <label className="field">
              <span className="hint">From</span>
              <TimeSelect name="startTime" value={startTime} onChange={setStartTime} />
            </label>
            <label className="field">
              <span className="hint">To</span>
              <TimeSelect name="endTime" value={endTime} onChange={setEndTime} />
            </label>
          </div>
        </div>
      </fieldset>

      <fieldset data-step={3} hidden={step !== 3} className="space-y-5">
        <legend className="text-2xl font-bold text-purple-deep">Where?</legend>
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
        <label className="field">
          <span className="label">Details for confirmed volunteers <span className="font-normal text-muted">(optional)</span></span>
          <textarea name="volunteerNotes" rows={3} defaultValue={initial?.volunteerNotes ?? ""} className="input" placeholder="e.g. Meet at the lobby counter and ask for Mary. Wear covered shoes; we'll provide lunch." />
          <span className="hint">Only volunteers you accept will see this, with your contact details and a calendar invite.</span>
        </label>
      </fieldset>

      {step === REVIEW && snapshot && <Review fd={snapshot} onEdit={go} />}

      {(stepError || state?.error) && (
        <p className="rounded-2xl bg-bad-soft p-4 font-bold text-bad" role="alert">{stepError || state?.error}</p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        {step > 0 ? (
          <button type="button" onClick={() => go(step - 1)} className="btn-ghost">
            <ChevronLeft aria-hidden className="h-5 w-5" /> Back
          </button>
        ) : <span />}
        {step < REVIEW ? (
          <button type="button" onClick={() => go(step + 1)} className="btn-primary text-lg">
            {step === REVIEW - 1 ? "Check and send" : "Next"} <ChevronRight aria-hidden className="h-5 w-5" />
          </button>
        ) : (
          <Submit className="btn-primary text-lg" pending="Sending…" busy={pending}>{submitLabel}</Submit>
        )}
      </div>
      {step === REVIEW && <p className="hint sm:text-right">The Catholic Foundation will review your request before it goes live.</p>}
    </form>
  );
}

// The saved request in the same shape the form submits, for the summary before anything is touched.
function fromRequest(r: Request) {
  const fd = new FormData();
  const fields: [string, string | number | null][] = [
    ["title", r.title], ["summary", r.summary], ["story", r.story], ["volunteersNeeded", r.volunteersNeeded],
    ["ageGroup", r.ageGroup], ["category", r.category], ["kind", r.kind], ["startDate", r.startDate], ["endDate", r.endDate],
    ["startTime", r.startTime], ["endTime", r.endTime], ["area", r.area], ["address", r.address], ["volunteerNotes", r.volunteerNotes],
  ];
  for (const [k, val] of fields) if (val != null) fd.set(k, String(val));
  r.skills.forEach((x) => fd.append("skills", x));
  r.weekdays.forEach((x) => fd.append("weekdays", x));
  return fd;
}

function Review({ fd, onEdit }: { fd: FormData; onEdit: (step: number) => void }) {
  const v = (k: string) => String(fd.get(k) ?? "").trim();
  // Same wording volunteers will see on the cause page.
  const { when, time } = fmtSchedule({
    kind: v("kind") === "regular" ? "regular" : "one_off",
    startDate: v("startDate"),
    endDate: v("endDate") || null,
    weekdays: fd.getAll("weekdays").map(String),
    startTime: v("startTime"),
    endTime: v("endTime"),
  });
  const sections = [
    { step: 0, title: "What", rows: [["Title", v("title")], ["Summary", v("summary")], ["Story", v("story")]] },
    {
      step: 1,
      title: "Gifts",
      rows: [
        ["Gifts needed", fd.getAll("skills").map(String).map(skillLabel).join(", ")],
        ["Volunteers", v("volunteersNeeded")],
        ["Who can come", ageLabel(v("ageGroup"))],
        ["Serves", v("category") ? categoryLabel(v("category")) : ""],
      ],
    },
    { step: 2, title: "When", rows: [["Date", when], ["Time", time]] },
    {
      step: 3,
      title: "Where",
      rows: [
        ["Place", v("area") === "Online" ? "Online / from home" : [v("address"), v("area")].filter(Boolean).join(", ")],
        ["For confirmed volunteers", v("volunteerNotes")],
      ],
    },
  ];

  return (
    <section aria-labelledby="review" className="space-y-4">
      <h2 id="review" className="text-2xl font-bold text-purple-deep">Does this look right?</h2>
      {sections.map((s) => (
        <div key={s.title} className="rounded-2xl border-2 border-line bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold">{s.title}</h3>
            <button type="button" onClick={() => onEdit(s.step)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-bold text-purple hover:bg-purple-soft">
              <Pencil aria-hidden className="h-4 w-4" /> Edit
            </button>
          </div>
          <dl className="mt-2 space-y-2">
            {s.rows.filter(([, val]) => val).map(([label, val]) => (
              <div key={label}>
                <dt className="text-sm text-muted">{label}</dt>
                <dd className={label === "Story" ? "line-clamp-3 whitespace-pre-line" : ""}>{val}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </section>
  );
}
