import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { fmtSchedule } from "@/lib/format";
import type { CauseRow } from "@/lib/queries";
import { SKILLS, skillIcon, skillLabel } from "@/lib/skills";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 ${className}`}>{children}</div>;
}

export function SkillChip({ id, highlight = false }: { id: string; highlight?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
        highlight ? "bg-gold-soft text-purple-deep ring-2 ring-gold" : "bg-purple-soft text-purple-deep"
      }`}
    >
      <span aria-hidden>{skillIcon(id)}</span>
      {skillLabel(id)}
    </span>
  );
}

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Waiting for review", cls: "bg-warn-soft text-warn" },
  pending_review: { label: "Waiting for CF review", cls: "bg-warn-soft text-warn" },
  changes_requested: { label: "Changes requested", cls: "bg-warn-soft text-warn" },
  approved: { label: "Live", cls: "bg-ok-soft text-ok" },
  rejected: { label: "Not approved", cls: "bg-bad-soft text-bad" },
  completed: { label: "Completed", cls: "bg-purple-soft text-purple-deep" },
  offered: { label: "Offered to help", cls: "bg-warn-soft text-warn" },
  accepted: { label: "Accepted", cls: "bg-ok-soft text-ok" },
  declined: { label: "Not this time", cls: "bg-bad-soft text-bad" },
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const s = STATUS[status] ?? { label: status, cls: "bg-purple-soft text-purple-deep" };
  return <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${s.cls}`}>{label ?? s.label}</span>;
}

export function DemoTag() {
  return (
    <span title="Sample content for the hackathon demo" className="rounded-full border border-line bg-white/90 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-muted">
      Demo data
    </span>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "ok" | "warn" | "bad"; children: ReactNode }) {
  const cls = {
    info: "border-purple/30 bg-purple-soft text-purple-deep",
    ok: "border-ok/30 bg-ok-soft text-ok",
    warn: "border-warn/30 bg-warn-soft text-warn",
    bad: "border-bad/30 bg-bad-soft text-bad",
  }[tone];
  return <div role="status" className={`rounded-2xl border-2 px-5 py-4 text-base ${cls}`}>{children}</div>;
}

export function CauseCard({ cause, mySkills = [] }: { cause: CauseRow; mySkills?: string[] }) {
  const r = cause.request;
  const matched = r.skills.filter((s) => mySkills.includes(s));
  const { when, time } = fmtSchedule(r);
  const spotsLeft = Math.max(0, r.volunteersNeeded - cause.acceptedCount);
  return (
    <Link
      href={`/causes/${r.id}`}
      className="card group flex flex-col overflow-hidden no-underline transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] bg-purple-soft">
        {r.coverUrl && (
          <Image src={r.coverUrl} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-purple-deep">
            {r.kind === "regular" ? "Regular" : "One-off"}
          </span>
          {r.area === "Online" && <span className="rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-purple-deep">From home</span>}
        </div>
        {r.isDemo && (
          <div className="absolute right-3 top-3">
            <DemoTag />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-sm font-bold text-muted">{cause.org.name.split(" — ")[0]}</p>
        <h3 className="text-2xl text-purple-deep group-hover:underline">{r.title}</h3>
        <p className="text-ink/85">{r.summary}</p>
        {matched.length > 0 && (
          <p className="rounded-2xl bg-gold-soft px-4 py-2 text-sm font-bold text-purple-deep">
            ✨ Needs your skills: {matched.map(skillLabel).join(", ")}
          </p>
        )}
        <div className="mt-auto space-y-1 pt-2 text-sm text-muted">
          <p>
            📅 {when} · {time}
          </p>
          <p>📍 {r.area === "Online" ? "Online / from home" : r.area}</p>
          <p>
            🙏 {cause.prayerCount} praying · {r.status === "completed" ? "Completed" : `${spotsLeft} of ${r.volunteersNeeded} places open`}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function SkillPicker({ name = "skills", selected = [] }: { name?: string; selected?: string[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {SKILLS.map((s) => (
        <label
          key={s.id}
          className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-white px-4 py-3 font-semibold transition has-[:checked]:border-purple has-[:checked]:bg-purple-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold"
        >
          <input type="checkbox" name={name} value={s.id} defaultChecked={selected.includes(s.id)} className="h-6 w-6 accent-[var(--purple)]" />
          <span aria-hidden className="text-2xl">{s.icon}</span>
          <span>{s.label}</span>
        </label>
      ))}
    </div>
  );
}
