"use client";

import { useActionState } from "react";
import { updateMySkills } from "@/app/actions/supporter";
import { Submit } from "@/components/submit";
import { SKILLS, AREAS } from "@/lib/skills";
import { SkillIcon } from "@/components/icons";

export function SkillsForm({ skills, otherSkill, area, phone }: { skills: string[]; otherSkill: string | null; area: string | null; phone: string | null }) {
  const [state, action] = useActionState(updateMySkills, undefined);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-2">
        {SKILLS.map((s) => (
          <label key={s.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-white px-3 py-2 font-semibold has-[:checked]:border-purple has-[:checked]:bg-purple-soft">
            <input type="checkbox" name="skills" value={s.id} defaultChecked={skills.includes(s.id)} className="h-5 w-5 accent-[var(--purple)]" />
            <SkillIcon id={s.id} className="h-5 w-5 text-purple" /> {s.label}
          </label>
        ))}
      </div>
      <label className="field">
        <span className="label">Anything else?</span>
        <input name="otherSkill" defaultValue={otherSkill ?? ""} className="input" />
      </label>
      <label className="field">
        <span className="label">Near</span>
        <select name="area" defaultValue={area ?? ""} className="input">
          <option value="">Anywhere</option>
          {AREAS.filter((a) => a !== "Online").map((a) => <option key={a}>{a}</option>)}
        </select>
      </label>
      <label className="field">
        <span className="label">Phone</span>
        <input name="phone" defaultValue={phone ?? ""} className="input" />
      </label>
      {state?.ok && <p className="font-bold text-ok" role="status">{state.ok}</p>}
      <Submit className="btn-primary w-full" pending="Saving…">Save</Submit>
    </form>
  );
}
