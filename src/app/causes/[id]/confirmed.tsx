import { CalendarDays, CalendarPlus, Download, Mail, MapPin, Phone, UserRound } from "lucide-react";
import type { Org, Request } from "@/db";
import { type Contact, googleCalendarUrl, inviteDetails } from "@/lib/calendar";
import { fmtSchedule } from "@/lib/format";

// What an accepted volunteer needs to actually turn up: when, where, who to contact, and a calendar invite.
export function Confirmed({
  request: r,
  org,
  contact,
  firstName,
}: {
  request: Request;
  org: Org;
  contact: Contact;
  firstName: string;
}) {
  const { when, time } = fmtSchedule(r);
  const orgShort = org.name.split(" — ")[0];
  const phone = org.contactPhone ?? contact.phone;
  const online = r.area === "Online";
  const place = online ? "Online — from home" : (r.address ?? r.area);
  return (
    <section id="confirmed" aria-labelledby="confirmed-title" className="scroll-mt-28 border-b border-line bg-ok-soft/60">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="flex items-center gap-4">
          <Seal />
          <div>
            <h2 id="confirmed-title" className="font-serif text-3xl font-bold sm:text-4xl">You're confirmed, {firstName}.</h2>
            <p className="mt-1 text-lg text-ink/80">{orgShort} is expecting you.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="card rise-in p-5 [animation-delay:250ms]">
            <p className="flex items-center gap-2 font-bold"><CalendarDays aria-hidden className="h-5 w-5 text-purple" /> When</p>
            <p className="mt-2 text-lg">{when}</p>
            <p className="text-lg">{time}</p>
          </div>
          <div className="card rise-in p-5 [animation-delay:330ms]">
            <p className="flex items-center gap-2 font-bold"><MapPin aria-hidden className="h-5 w-5 text-purple" /> Where</p>
            <p className="mt-2 text-lg">{place}</p>
            {!online && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place}, Singapore`)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-bold"
              >
                Open in Google Maps →
              </a>
            )}
          </div>
          <div className="card rise-in p-5 [animation-delay:410ms]">
            <p className="flex items-center gap-2 font-bold"><UserRound aria-hidden className="h-5 w-5 text-purple" /> Your contact</p>
            <p className="mt-2 text-lg font-bold">{contact.name}</p>
            <p className="text-muted">{orgShort}</p>
            <div className="mt-2 space-y-1">
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 font-bold"><Phone aria-hidden className="h-4 w-4" /> {phone}</a>
              )}
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 break-all font-bold"><Mail aria-hidden className="h-4 w-4 shrink-0" /> {contact.email}</a>
            </div>
          </div>
        </div>

        {r.volunteerNotes && (
          <div className="card mt-4 p-5">
            <p className="font-bold">A note from {orgShort}</p>
            <p className="mt-2 whitespace-pre-line text-lg">{r.volunteerNotes}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a href={googleCalendarUrl(r, inviteDetails(r, org, contact))} target="_blank" rel="noreferrer" className="btn-primary">
            <CalendarPlus aria-hidden className="h-5 w-5" /> Add to Google Calendar
          </a>
          <a href={`/causes/${r.id}/calendar`} className="btn-ghost">
            <Download aria-hidden className="h-5 w-5" /> Apple or Outlook calendar
          </a>
        </div>
        <p className="mt-3 text-muted">Can't make it after all? Please let {orgShort} know as early as you can.</p>
      </div>
    </section>
  );
}

// A gold seal whose ring and check draw in once, set inside a soft glow.
function Seal() {
  return (
    <span aria-hidden className="relative isolate flex h-14 w-14 shrink-0 items-center justify-center">
      <span className="seal-glow absolute -inset-4 -z-10 rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.9),transparent_70%)]" />
      <svg viewBox="0 0 56 56" className="h-14 w-14 text-gold" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="28" cy="28" r="24" className="seal-ring" transform="rotate(-90 28 28)" />
        <path d="M17 28.5l7 7 14-14.5" className="seal-check" stroke="var(--ok)" />
      </svg>
    </span>
  );
}
