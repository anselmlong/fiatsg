import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { fmtScheduleShort } from "@/lib/format";
import type { CauseRow } from "@/lib/queries";
import { SKILLS, skillLabel } from "@/lib/skills";
import { CalendarDays, Clock, MapPin, Sparkles } from "lucide-react";
import { SkillIcon } from "./icons";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  // A page's own max-w-* replaces the default; with both, CSS order decides and 6xl can win.
  const width = /(^|\s)max-w-/.test(className) ? "" : "max-w-6xl";
  return <div className={`mx-auto w-full px-4 ${width} ${className}`}>{children}</div>;
}

// A pulsing placeholder block for loading screens.
export function Skeleton({ className = "" }: { className?: string }) {
  // Defaults step aside when overridden, so CSS order can't pick the wrong one.
  const bg = /(^|\s)bg-/.test(className) ? "" : "bg-purple-soft";
  const radius = /(^|\s)rounded-/.test(className) ? "" : "rounded-2xl";
  return <div aria-hidden className={`animate-pulse motion-reduce:animate-none ${bg} ${radius} ${className}`} />;
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card overflow-hidden">
          <Skeleton className="aspect-[16/9] rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-7 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Loading screen for the narrow single-form pages, so they don't flash a wide layout first.
export function FormPageSkeleton({ width = "max-w-2xl" }: { width?: string }) {
  return (
    <Container className={`${width} py-10`}>
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="mt-3 h-5 w-full" />
      <div className="card mt-8 space-y-6 p-6 sm:p-8">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
        <Skeleton className="h-12 w-40 rounded-full" />
      </div>
      <p className="sr-only" role="status">Loading…</p>
    </Container>
  );
}

export function SkillChip({ id, highlight = false }: { id: string; highlight?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
        highlight ? "bg-gold-soft text-purple-deep ring-2 ring-gold" : "bg-purple-soft text-purple-deep"
      }`}
    >
      <SkillIcon id={id} className="h-4 w-4" />
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
  const { day, time } = fmtScheduleShort(r);
  return (
    <Link
      href={`/causes/${r.id}`}
      className="card group flex h-full flex-col overflow-hidden no-underline transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] bg-purple-soft">
        {r.coverUrl && (
          <Image src={r.coverUrl} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-bold text-purple">{cause.org.name.split(" — ")[0]}</p>
        <h3 className="mt-1 text-2xl sm:line-clamp-2 sm:min-h-[2lh] text-purple-deep group-hover:underline">{r.title}</h3>
        <p className="mt-2 text-base text-ink sm:line-clamp-2 sm:min-h-[2lh]">{r.summary}</p>
        {matched.length > 0 && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-gold-soft px-3 py-2 text-sm font-bold text-purple-deep">
            <Sparkles aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold-ink" />
            <span>Needs your gifts: {matched.map(skillLabel).join(", ")}</span>
          </p>
        )}
        <div className="mt-auto pt-4" />
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 border-t border-line pt-4 text-base text-ink">
          <dt><CalendarDays aria-label="When" className="h-5 w-5 text-purple" /></dt>
          <dd>{day}</dd>
          <dt><Clock aria-label="Time" className="h-5 w-5 text-purple" /></dt>
          <dd className="tabular-nums">{time}</dd>
          <dt><MapPin aria-label="Where" className="h-5 w-5 text-purple" /></dt>
          <dd>{r.area === "Online" ? "Online, from home" : r.area}</dd>
        </dl>
      </div>
    </Link>
  );
}

export function SkillPicker({ name = "skills", selected = [] }: { name?: string; selected?: string[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {SKILLS.map((s) => (
        <label
          key={s.id}
          className="gift-option flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-white px-4 py-3 font-semibold transition has-[:checked]:border-purple has-[:checked]:bg-purple-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold"
        >
          <input type="checkbox" name={name} value={s.id} defaultChecked={selected.includes(s.id)} className="h-6 w-6 accent-[var(--purple)]" />
          <SkillIcon id={s.id} className="gift-icon h-6 w-6 shrink-0 text-purple" />
          <span>{s.label}</span>
        </label>
      ))}
    </div>
  );
}
