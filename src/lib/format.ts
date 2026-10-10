import type { Request } from "@/db";

const DATE = new Intl.DateTimeFormat("en-SG", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const SHORT = new Intl.DateTimeFormat("en-SG", { day: "numeric", month: "short" });

export const fmtDate = (d: string | Date) => DATE.format(new Date(d));
export const fmtShort = (d: string | Date) => SHORT.format(new Date(d));

export function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m ? `${hour}.${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
}

const DAY_NAMES: Record<string, string> = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
};

const WEEKDAY_SET = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const isWeekdays = (d: string[]) => d.length === 5 && WEEKDAY_SET.every((x) => d.includes(x));

export function fmtSchedule(r: Pick<Request, "kind" | "startDate" | "endDate" | "weekdays" | "startTime" | "endTime">) {
  const time = `${fmtTime(r.startTime)} – ${fmtTime(r.endTime)}`;
  if (r.kind === "one_off") return { when: fmtDate(r.startDate), time };
  const days = r.weekdays.map((d) => DAY_NAMES[d] ?? d);
  const every = isWeekdays(r.weekdays) ? "Weekdays" : days.length === 1 ? `Every ${days[0]}` : `Every ${days.slice(0, -1).join(", ")} & ${days.at(-1)}`;
  const range = r.endDate ? `${fmtShort(r.startDate)} – ${fmtShort(r.endDate)}` : `from ${fmtShort(r.startDate)}`;
  return { when: `${every}, ${range}`, time };
}

export const timeAgo = (d: Date) => {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return fmtShort(d);
};

// True for a few minutes after an action, so its confirmation can play once.
export const isFresh = (d: Date, minutes = 5) => Date.now() - new Date(d).getTime() < minutes * 60_000;

// Compact schedule for cards: "Every Mon & Wed" or "Sat, 21 Nov".
export function fmtScheduleShort(r: Pick<Request, "kind" | "startDate" | "weekdays" | "startTime" | "endTime">) {
  const time = `${fmtTime(r.startTime)} – ${fmtTime(r.endTime)}`;
  if (r.kind === "one_off") {
    const day = new Intl.DateTimeFormat("en-SG", { weekday: "short", day: "numeric", month: "short" }).format(new Date(r.startDate));
    return { day, time };
  }
  const d = r.weekdays;
  const day = isWeekdays(d) ? "Weekdays" : d.length === 1 ? `Every ${DAY_NAMES[d[0]] ?? d[0]}` : `Every ${d.slice(0, -1).join(", ")} & ${d.at(-1)}`;
  return { day, time };
}
