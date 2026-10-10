import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { CalendarDays, MapPin, Sparkles, UserRound, UsersRound } from "lucide-react";
import { withdrawOffer } from "@/app/actions/supporter";
import { ShareButtons } from "@/components/share-buttons";
import { ScrollIntoView } from "@/components/scroll-into-view";
import { MediaGallery } from "@/components/media-gallery";
import { Container, Notice, SkillChip, StatusBadge } from "@/components/ui";
import { db, responses, users } from "@/db";
import { currentOrg, currentUser } from "@/lib/auth";
import { fmtSchedule, isFresh, timeAgo } from "@/lib/format";
import { getCause, getRecentPrayers, getUpdates } from "@/lib/queries";
import { ageLabel } from "@/lib/skills";
import { siteUrl } from "@/lib/site";
import { Confirmed } from "./confirmed";
import { OfferForm, PrayForm } from "./forms";

// Who shared this link, if anyone: their name goes on the link preview and the welcome.
async function inviterName(ref: unknown) {
  if (typeof ref !== "string" || !/^\d{1,9}$/.test(ref)) return null;
  const [u] = await db.select({ name: users.name, role: users.role }).from(users).where(eq(users.id, Number(ref)));
  return u?.role === "supporter" ? u.name.split(" ")[0] : null;
}

export async function generateMetadata({ params, searchParams }: PageProps<"/causes/[id]">) {
  const id = Number((await params).id);
  const cause = Number.isInteger(id) ? await getCause(id) : null;
  if (!cause) return {};
  const from = await inviterName((await searchParams).ref);
  const title = from ? `${from} invites you: ${cause.request.title}` : cause.request.title;
  const images = cause.request.coverUrl ? [{ url: cause.request.coverUrl }] : undefined;
  return {
    title: cause.request.title,
    description: cause.request.summary,
    openGraph: { title, description: cause.request.summary, images, siteName: "Fiat" },
    twitter: { card: "summary_large_image", title, description: cause.request.summary, images },
  };
}

export default async function CausePage({ params, searchParams }: PageProps<"/causes/[id]">) {
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
  const confirmed = myResponse?.status === "accepted" && r.status !== "completed";
  const [contact] = confirmed
    ? await db.select({ name: users.name, email: users.email, phone: users.phone }).from(users).where(eq(users.id, org.ownerId))
    : [];
  const jar = await cookies();
  const alreadyPrayed = !!jar.get(`prayed_${id}`);
  const invitedBy = !user ? await inviterName((await searchParams).ref ?? jar.get("fiat_ref")?.value) : null;
  const shareUrl = `${await siteUrl()}/causes/${id}${user?.role === "supporter" ? `?ref=${user.id}` : ""}`;
  const { when, time } = fmtSchedule(r);
  const mySkills = user?.role === "supporter" ? user.skills : [];
  const spotsLeft = Math.max(0, r.volunteersNeeded - cause.acceptedCount);
  const orgShort = org.name.split(" — ")[0];
  // Offers the organisation hasn't answered yet, so a full-looking cause doesn't seem wide open.
  const waiting = Math.max(0, cause.offeredCount - cause.acceptedCount);
  const bringAFriend = isPublic && r.status === "approved" && (
    <div className="card p-6">
      <h2 className="text-2xl font-bold">Bring a friend</h2>
      <p className="mt-1 text-muted">
        {user?.role === "supporter" ? "If a friend joins from your link, you'll meet a saint. Come together, and you'll both meet another." : "Know someone who'd love this? Send it to them."}
      </p>
      <div className="mt-4">
        <ShareButtons url={shareUrl} title={r.title} text={`Come and help with me: ${r.title}, with ${orgShort}.`} />
      </div>
    </div>
  );

  return (
    <article>
      <div className="relative isolate bg-purple-deep">
        {r.coverUrl && <Image src={r.coverUrl} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-50" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-purple-deep via-purple-deep/70 to-transparent" />
        <Container className="pb-10 pt-32 sm:pt-48">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/causes" className="rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-purple-deep no-underline">← All causes</Link>
            {!isPublic && <StatusBadge status={r.status} />}
            {r.status === "completed" && <StatusBadge status="completed" />}
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold !text-white sm:text-5xl">{r.title}</h1>
          <p className="mt-3 text-xl text-white/90">
            with <Link href={`/orgs/${org.id}`} className="font-bold text-gold underline-offset-4">{orgShort}</Link>
          </p>
        </Container>
      </div>

      {invitedBy && (
        <div className="border-b border-gold/40 bg-gold-soft">
          <Container className="py-4">
            <p className="font-serif text-xl text-purple-deep"><strong>{invitedBy}</strong> invited you. A saint is waiting to meet you.</p>
            <p className="text-ink/80">Join Fiat, say yes to a cause like this one, and see who you meet.</p>
          </Container>
        </div>
      )}

      {confirmed && contact && <Confirmed request={r} org={org} contact={contact} firstName={user!.name.split(" ")[0]} />}

      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-10">
          {r.status === "completed" && (
            <section className="card border-2 border-gold/60 p-7">
              <h2 className="text-3xl font-bold">What your help made possible</h2>
              <p className="mt-3 text-lg">{r.outcomeSummary}</p>
              <dl className="flex flex-wrap justify-around gap-4 text-center empty:hidden [&:not(:empty)]:mt-6">
                {[
                  { label: "Hours given", value: r.outcomeHours },
                  { label: "People served", value: r.outcomePeopleServed },
                  { label: "Prayers", value: cause.prayerCount },
                ]
                  .filter((s) => s.value != null && s.value !== 0)
                  .map((s) => (
                    <div key={s.label} className="min-w-24 flex-1"><dt className="text-sm text-muted">{s.label}</dt><dd className="font-serif text-4xl font-bold tabular-nums text-purple">{s.value}</dd></div>
                  ))}
              </dl>
            </section>
          )}

          <section>
            {/* On phones the summary sits above the help button instead (see the aside). */}
            <p className="mb-5 hidden text-xl font-bold text-purple-deep lg:block">{r.summary}</p>
            <div className="space-y-4 text-lg leading-relaxed text-ink/90">
              {r.story.split(/\n+/).map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </section>

          {r.media.length > 0 && (
            <section aria-label="Photos and videos">
              <MediaGallery items={r.media} />
            </section>
          )}

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

          {bringAFriend && <div className="lg:hidden">{bringAFriend}</div>}

          <section>
            <h2 className="text-2xl font-bold">About {orgShort}</h2>
            <p className="mt-3 line-clamp-3 text-ink/85">{org.history}</p>
            <Link href={`/orgs/${org.id}`} className="mt-3 inline-block font-bold">Read more about {orgShort} →</Link>
          </section>

          {isPublic && r.status !== "completed" && (
            <section className="card p-6">
              <h2 className="text-2xl font-bold">Can't come? You can still pray.</h2>
              <div className="mt-4">
                <PrayForm requestId={id} count={cause.prayerCount} alreadyPrayed={alreadyPrayed} needsName={!user} />
              </div>
              {prayerList.length > 0 && (
                <ul className="mt-6 space-y-3 border-t border-line pt-5">
                  {prayerList.slice(0, 3).map((p, i) => (
                    <li key={i}>
                      <p className="font-serif text-lg italic">“{p.message}”</p>
                      <p className="text-sm text-muted">{p.name ?? "Someone"}, {timeAgo(p.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

        </div>

        <aside className="order-first space-y-6 lg:order-none lg:sticky lg:top-28 lg:self-start">
          <div className="card space-y-5 p-6">
            <p className="text-lg font-bold text-purple-deep lg:hidden">{r.summary}</p>
            <dl className="space-y-3 text-base">
              <div><dt className="flex items-center gap-2 font-bold"><CalendarDays aria-hidden className="h-5 w-5 text-purple" /> When</dt><dd>{when}<br />{time}</dd></div>
              <div><dt className="flex items-center gap-2 font-bold"><MapPin aria-hidden className="h-5 w-5 text-purple" /> Where</dt><dd>{r.area === "Online" ? "Online — from home" : <>{r.address ?? r.area}<br /><span className="text-muted">{r.area}</span></>}</dd></div>
              <div><dt className="flex items-center gap-2 font-bold"><UsersRound aria-hidden className="h-5 w-5 text-purple" /> Who can come</dt><dd>{ageLabel(r.ageGroup)}</dd></div>
              <div><dt className="flex items-center gap-2 font-bold"><UserRound aria-hidden className="h-5 w-5 text-purple" /> Volunteers</dt><dd>{r.status === "completed" ? `${r.volunteersNeeded} needed` : spotsLeft === 0 ? "All places filled" : <>{spotsLeft} {spotsLeft === 1 ? "place" : "places"} open{waiting > 0 && <span className="text-muted"> · {waiting} waiting to hear back</span>}</>}</dd></div>
            </dl>
            <div>
              <p className="font-bold">Gifts needed</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {r.skills.map((s) => <SkillChip key={s} id={s} highlight={mySkills.includes(s)} />)}
              </div>
              {r.skills.some((s) => mySkills.includes(s)) && <p className="mt-2 flex items-center gap-2 text-sm font-bold text-gold-ink"><Sparkles aria-hidden className="h-4 w-4" /> Highlighted gifts match yours</p>}
            </div>

          {r.status === "approved" && isPublic && (
            <div id="offer" className="scroll-mt-28 border-t border-line pt-5">
              <div>
                {!user ? (
                  <div className="space-y-3">
                    <Link href={`/join?next=/causes/${id}&offer=${id}`} className="btn-primary w-full text-lg">I'd like to help</Link>
                    <Link href={`/login?next=/causes/${id}&offer=${id}`} className="btn-ghost w-full">I already have an account</Link>
                    <NextSteps orgName={orgShort} />
                  </div>
                ) : user.role !== "supporter" ? (
                  <p className="text-muted">You're signed in as an organisation or CF account. Volunteers offer help from a supporter account.</p>
                ) : myResponse ? (
                  <div className="space-y-3">
                    {myResponse.status === "offered" && isFresh(myResponse.createdAt) ? (
                      <div className="relative isolate overflow-hidden rounded-2xl bg-purple-deep px-5 py-7 text-center" role="status">
                        <ScrollIntoView />
                        <div aria-hidden className="received-glow absolute inset-0 -z-10 m-auto h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(246,213,138,0.55),transparent_70%)]" />
                        <p className="rise-in font-serif text-5xl font-bold italic !text-white">Fiat.</p>
                        <p className="rise-in mt-2 font-serif text-xl text-gold [animation-delay:150ms]">Your yes has been received.</p>
                        <p className="rise-in mt-4 text-white/90 [animation-delay:300ms]">
                          Thank you, {user.name.split(" ")[0]}. {orgShort} has your details and will contact you soon.
                        </p>
                      </div>
                    ) : (
                      <>
                        <StatusBadge status={myResponse.status} />
                        <p>
                          {myResponse.status === "accepted"
                            ? <>{orgShort} has welcomed your offer. <a href="#confirmed" className="font-bold">See where to go and who to contact ↑</a></>
                            : myResponse.status === "declined"
                              ? `${orgShort} has enough help for now. Thank you for offering — there are other causes that need you.`
                              : `Your details have been sent to ${orgShort}. They'll contact you to follow up.`}
                        </p>
                      </>
                    )}
                    {myResponse.status === "offered" && (
                      <form action={withdrawOffer.bind(null, id)}>
                        <button className="btn-ghost w-full">Withdraw my offer</button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <OfferForm requestId={id} orgName={orgShort} firstName={user.name.split(" ")[0]} />
                    <NextSteps orgName={orgShort} />
                  </div>
                )}
              </div>
            </div>
          )}
          </div>

          {bringAFriend && <div className="hidden lg:block">{bringAFriend}</div>}

          {isOwner && (
            <Notice>
              This is your request. <Link href={`/org/requests/${id}`} className="font-bold">Manage it and see who responded →</Link>
            </Notice>
          )}
        </aside>
      </Container>

    </article>
  );
}

function NextSteps({ orgName }: { orgName: string }) {
  return (
    <div className="border-t border-line pt-4">
      <p className="font-bold">What happens next</p>
      <ol className="mt-2 space-y-2 text-sm">
        {[
          "You offer to help. It takes a minute.",
          `${orgName} looks at your offer and confirms you.`,
          "You'll see the address, your contact person and a calendar invite right here.",
        ].map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple text-xs font-bold text-white">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
