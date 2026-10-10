import type { Org, Request } from "@/db";

type Event = Pick<Request, "id" | "title" | "kind" | "startDate" | "endDate" | "weekdays" | "startTime" | "endTime" | "area" | "address">;

const BYDAY: Record<string, string> = { Mon: "MO", Tue: "TU", Wed: "WE", Thu: "TH", Fri: "FR", Sat: "SA", Sun: "SU" };
const DAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// Singapore is UTC+8 with no daylight saving, so local times convert to UTC by a fixed offset.
function utcStamp(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh - 8, mm)).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// A regular request's first session is the first chosen weekday on or after its start date.
function firstSession(r: Event) {
  if (r.kind !== "regular" || !r.weekdays.length) return r.startDate;
  const d = new Date(`${r.startDate}T00:00:00Z`);
  const wanted = new Set(r.weekdays.map((w) => DAY_INDEX[w]));
  while (!wanted.has(d.getUTCDay())) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function rrule(r: Event) {
  if (r.kind !== "regular" || !r.weekdays.length) return null;
  const until = r.endDate ? `;UNTIL=${utcStamp(r.endDate, "23:59")}` : "";
  return `RRULE:FREQ=WEEKLY;BYDAY=${r.weekdays.map((w) => BYDAY[w]).join(",")}${until}`;
}

const location = (r: Event) => (r.area === "Online" ? "Online" : (r.address ?? r.area));

export function googleCalendarUrl(r: Event, details: string) {
  const day = firstSession(r);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: r.title,
    dates: `${utcStamp(day, r.startTime)}/${utcStamp(day, r.endTime)}`,
    details,
    location: location(r),
  });
  const rule = rrule(r);
  if (rule) params.set("recur", rule);
  return `https://calendar.google.com/calendar/render?${params}`;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

export function icsFile(r: Event, details: string) {
  const day = firstSession(r);
  const rule = rrule(r);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fiat//Volunteer//EN",
    "BEGIN:VEVENT",
    `UID:fiat-request-${r.id}@fiat.sg`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART:${utcStamp(day, r.startTime)}`,
    `DTEND:${utcStamp(day, r.endTime)}`,
    ...(rule ? [rule] : []),
    `SUMMARY:${esc(r.title)}`,
    `LOCATION:${esc(location(r))}`,
    `DESCRIPTION:${esc(details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export type Contact = { name: string; email: string; phone: string | null };

// The text that goes in the invite: who it's with, the organisation's note, and who to call.
export function inviteDetails(r: Pick<Request, "volunteerNotes">, org: Pick<Org, "name" | "contactPhone">, contact: Contact) {
  const phone = org.contactPhone ?? contact.phone;
  return [
    `With ${org.name.split(" — ")[0]}.`,
    r.volunteerNotes,
    `Contact: ${contact.name}${phone ? `, ${phone}` : ""}, ${contact.email}`,
  ]
    .filter(Boolean)
    .join("\n\n")
    .replace(/\r\n?/g, "\n");
}
