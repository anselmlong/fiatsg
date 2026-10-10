import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { CalendarDays, MapPin, Sparkles, UserRound, UsersRound } from "lucide-react";
import { withdrawOffer } from "@/app/actions/supporter";
import { PrayIcon } from "@/components/icons";
import { Container, DemoTag, Notice, SkillChip, StatusBadge } from "@/components/ui";
import { db, responses } from "@/db";
import { currentOrg, currentUser } from "@/lib/auth";
import { fmtSchedule, timeAgo } from "@/lib/format";
import { getCause, getRecentPrayers, getUpdates } from "@/lib/queries";
import { ageLabel } from "@/lib/skills";
import { OfferForm, PrayForm } from "./forms";

export default async function CausePage({ params }: PageProps<"/causes/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [cause, user, myOrg] = await Promise.all([getCause(id), currentUser(), currentOrg()]);
  if (!cause) notFound();
  const r = cause.request;
  const org = cause.org;
  const isOwner = myOrg?.id === org.id;
  const isPublic = (r.status === "approved" || r.status === "completed") && org.status === "approved";
  if (!isPublic && !isOwner && user?.role !== "cf_admin") notFound();

  const [updateList, prayerList, myResponse] = await Promise.all([
    getUpdates(id),
    getRecentPrayers(id),
    user?.role === "supporter"
      ? db.select().from(responses).where(and(eq(responses.requestId, id), eq(responses.userId, user.id))).then((x) => x[0])
      : undefined,
  ]);
  const alreadyPrayed = !!(await cookies()).get(`prayed_${id}`);
  const { when, time } = fmtSchedule(r);
  const mySkills = user?.role === "supporter" ? user.skills : [];
  const spotsLeft = Math.max(0, r.volunteersNeeded - cause.acceptedCount);
  const orgShort = org.name.split(" — ")[0];

  return (
    <article className="pb-24 lg:pb-0">
      <div className="relative isolate bg-purple-deep">
        {r.coverUrl && <Image src={r.coverUrl} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-50" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-purple-deep via-purple-deep/70 to-transparent" />
        <Container className="pb-10 pt-32 sm:pt-48">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/causes" className="rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-purple-deep no-underline">← All causes</Link>
            {r.isDemo && <DemoTag />}
            {!isPublic && <StatusBadge status={r.status} />}
            {r.status === "completed" && <StatusBadge status="completed" />}
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold !text-white sm:text-5xl">{r.title}</h1>
          <p className="mt-3 text-xl text-white/90">
            with <Link href={`/orgs/${org.id}`} className="font-bold text-gold underline-offset-4">{orgShort}</Link>
          </p>
        </Container>
      </div>

      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-10">
          {r.status === "completed" && (
            <section className="card border-2 border-gold/60 p-7">
              <h2 className="text-3xl font-bold">What your help made possible</h2>
              <p className="mt-3 text-lg">{r.outcomeSummary}</p>
              <dl className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div><dt className="text-sm text-muted">Hours given</dt><dd className="font-serif text-4xl font-bold tabular-nums text-purple">{r.outcomeHours ?? "—"}</dd></div>
                <div><dt className="text-sm text-muted">People served</dt><dd className="font-serif text-4xl font-bold tabular-nums text-purple">{r.outcomePeopleServed ?? "—"}</dd></div>
                <div><dt className="text-sm text-muted">Prayers</dt><dd className="font-serif text-4xl font-bold tabular-nums text-purple">{cause.prayerCount}</dd></div>
              </dl>
            </section>
          )}

          <section>
            <p className="text-xl font-bold text-purple-deep">{r.summary}</p>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink/90">
              {r.story.split(/\n+/).map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </section>

          {updateList.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold">Updates from {orgShort}</h2>
              <ol className="mt-6 space-y-6">
                {updateList.map((u) => (
                  <li key={u.id} className="card overflow-hidden">
                    {u.photoUrl && (
                      <div className="relative aspect-[16/9]"><Image src={u.photoUrl} alt="" fill sizes="(min-width:1024px) 640px, 100vw" className="object-cover" /></div>
                    )}
                    <div className="p-6">
                      <p className="text-sm font-bold text-muted">{timeAgo(u.createdAt)}</p>
                      <p className="mt-2 text-lg">{u.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="card p-7">
            <h2 className="text-2xl font-bold">Why this matters</h2>
            <p className="mt-3 font-serif text-xl italic leading-relaxed text-ink/90">{org.whyItMatters}</p>
            <h2 className="mt-8 text-2xl font-bold">About {orgShort}</h2>
            <p className="mt-3 text-ink/85">{org.history}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/orgs/${org.id}`} className="btn-ghost">More about {orgShort}</Link>
              {org.website && <a href={org.website} target="_blank" rel="noreferrer" className="btn-ghost">Visit their website ↗</a>}
            </div>
          </section>

          {prayerList.length > 0 && (
            <section>
              <h2 className="flex items-center gap-3 text-3xl font-bold"><PrayIcon aria-hidden className="h-7 w-7 text-gold" strokeWidth={1.75} /> Prayers for this cause</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {prayerList.map((p, i) => (
                  <li key={i} className="rounded-2xl bg-purple-soft/70 p-5">
                    <p className="font-serif text-lg italic">“{p.message}”</p>
                    <p className="mt-2 text-sm font-bold text-muted">— {p.name ?? "Someone"}, {timeAgo(p.createdAt)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="card space-y-5 p-6">
            <dl className="space-y-3 text-base">
              <div><dt className="flex items-center gap-2 font-bold"><CalendarDays aria-hidden className="h-5 w-5 text-purple" /> When</dt><dd>{when}<br />{time}</dd></div>
              <div><dt className="flex items-center gap-2 font-bold"><MapPin aria-hidden className="h-5 w-5 text-purple" /> Where</dt><dd>{r.area === "Online" ? "Online — from home" : <>{r.address ?? r.area}<br /><span className="text-muted">{r.area}</span></>}</dd></div>
              <div><dt className="flex items-center gap-2 font-bold"><UsersRound aria-hidden className="h-5 w-5 text-purple" /> Who can come</dt><dd>{ageLabel(r.ageGroup)}</dd></div>
              <div><dt className="flex items-center gap-2 font-bold"><UserRound aria-hidden className="h-5 w-5 text-purple" /> Volunteers</dt><dd>{r.status === "completed" ? `${r.volunteersNeeded} needed` : `${spotsLeft} of ${r.volunteersNeeded} places still open`}</dd></div>
            </dl>
            <div>
              <p className="font-bold">Gifts needed</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {r.skills.map((s) => <SkillChip key={s} id={s} highlight={mySkills.includes(s)} />)}
              </div>
              {r.skills.some((s) => mySkills.includes(s)) && <p className="mt-2 flex items-center gap-2 text-sm font-bold text-gold-ink"><Sparkles aria-hidden className="h-4 w-4" /> Highlighted gifts match yours</p>}
            </div>
          </div>

          {r.status === "approved" && isPublic && (
            <div id="offer" className="card scroll-mt-28 p-6">
              <h2 className="text-2xl font-bold">Offer your help</h2>
              <div className="mt-4">
                {!user ? (
                  <div className="space-y-3">
                    <p>Create a free account in about a minute. We'll bring you straight back here.</p>
                    <Link href={`/join?next=/causes/${id}`} className="btn-primary w-full text-lg">I'd like to help</Link>
                    <Link href={`/login?next=/causes/${id}`} className="btn-ghost w-full">I already have an account</Link>
                  </div>
                ) : user.role !== "supporter" ? (
                  <p className="text-muted">You're signed in as an organisation or CF account. Volunteers offer help from a supporter account.</p>
                ) : myResponse ? (
                  <div className="space-y-3">
                    <StatusBadge status={myResponse.status} />
                    {myResponse.status === "offered" && <p className="text-xl font-bold text-purple-deep">Thank you, {user.name.split(" ")[0]}.</p>}
                    <p>
                      {myResponse.status === "accepted"
                        ? `${orgShort} has accepted your offer. They'll be in touch with the details.`
                        : myResponse.status === "declined"
                          ? `${orgShort} has enough help for now. Thank you for offering — there are other causes that need you.`
                          : `Your details have been sent to ${orgShort}. They'll contact you to follow up.`}
                    </p>
                    {myResponse.status === "offered" && (
                      <form action={withdrawOffer.bind(null, id)}>
                        <button className="btn-ghost w-full">Withdraw my offer</button>
                      </form>
                    )}
                  </div>
                ) : (
                  <OfferForm requestId={id} orgName={orgShort} firstName={user.name.split(" ")[0]} />
                )}
              </div>
            </div>
          )}

          {isPublic && (
            <div className="card p-6">
              <h2 className="text-2xl font-bold">Can't come? You can still pray.</h2>
              <div className="mt-4">
                <PrayForm requestId={id} count={cause.prayerCount} alreadyPrayed={alreadyPrayed} needsName={!user} />
              </div>
            </div>
          )}

          {isOwner && (
            <Notice>
              This is your request. <Link href={`/org/requests/${id}`} className="font-bold">Manage it and see who responded →</Link>
            </Notice>
          )}
        </aside>
      </Container>

      {r.status === "approved" && isPublic && !myResponse && user?.role !== "org" && user?.role !== "cf_admin" && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 py-3 shadow-[0_-4px_16px_rgba(52,25,92,0.08)] backdrop-blur lg:hidden">
          <a href="#offer" className="btn-primary w-full text-lg">I'd like to help</a>
        </div>
      )}
    </article>
  );
}
