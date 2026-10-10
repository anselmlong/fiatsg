import Image from "next/image";
import Link from "next/link";
import { desc, eq, inArray, or } from "drizzle-orm";
import { Container, SkillChip, StatusBadge } from "@/components/ui";
import { db, orgs, prayers, requests, responses, updates } from "@/db";
import { requireUser } from "@/lib/auth";
import { fmtSchedule, timeAgo } from "@/lib/format";
import { SkillsForm } from "./skills-form";
import { metSaintIds } from "@/lib/meet";
import { SAINTS } from "@/lib/saints";
import { Sprout } from "lucide-react";

export const metadata = { title: "My causes" };

export default async function MePage() {
  const user = await requireUser("supporter", "/me");

  const mine = await db
    .select({ response: responses, request: requests, orgName: orgs.name })
    .from(responses)
    .innerJoin(requests, eq(requests.id, responses.requestId))
    .innerJoin(orgs, eq(orgs.id, requests.orgId))
    .where(eq(responses.userId, user.id))
    .orderBy(desc(responses.createdAt));

  const prayed = await db
    .selectDistinct({ requestId: prayers.requestId, title: requests.title })
    .from(prayers)
    .innerJoin(requests, eq(requests.id, prayers.requestId))
    .where(eq(prayers.userId, user.id));

  const helpedIds = mine.filter((m) => m.response.status === "accepted").map((m) => m.request.id);
  const followIds = [...new Set([...helpedIds, ...mine.map((m) => m.request.id), ...prayed.map((p) => p.requestId)])];
  const feed = followIds.length
    ? await db
        .select({ update: updates, title: requests.title, requestId: requests.id, orgName: orgs.name })
        .from(updates)
        .innerJoin(requests, eq(requests.id, updates.requestId))
        .innerJoin(orgs, eq(orgs.id, requests.orgId))
        .where(or(inArray(updates.requestId, followIds)))
        .orderBy(desc(updates.createdAt))
        .limit(10)
    : [];

  const accepted = mine.filter((m) => m.response.status === "accepted");
  const completed = accepted.filter((m) => m.request.status === "completed");
  const peopleReached = completed.reduce((a, m) => a + (m.request.outcomePeopleServed ?? 0), 0);
  const first = user.name.split(" ")[0];
  const met = new Set(await metSaintIds(user.id));
  const metCount = SAINTS.filter((s) => met.has(s.id)).length;
  // A quiet line of thanks rather than a dashboard: the causes themselves come first.
  const numbers = [
    { n: mine.filter((m) => m.response.status !== "declined").length, l: "offered" },
    { n: accepted.length, l: "welcomed" },
    { n: prayed.length, l: "prayed for" },
    { n: peopleReached, l: "people reached" },
  ].filter((x) => x.n > 0);

  return (
    <Container className="py-10">
      <h1 className=" text-4xl font-bold sm:text-5xl">My causes</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Thank you, {first}. “Whatever you did for one of the least of these, you did for me.” — Matthew 25:40
      </p>
      {numbers.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-base">
          {numbers.map((x) => (
            <span key={x.l}><strong className="font-serif text-xl tabular-nums text-purple">{x.n}</strong> {x.l}</span>
          ))}
        </p>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-12">
          <section aria-label="Causes you've said yes to">
            {mine.length === 0 ? (
              <div className="card p-8 text-center">
                <Sprout aria-hidden className="mx-auto h-12 w-12 text-ok" strokeWidth={1.5} />
                <p className="mt-3 font-serif text-2xl text-purple-deep">Every yes begins small.</p>
                <p className="mt-2 text-lg text-muted">When you offer to help, it will appear here, with news of what your help made possible.</p>
                <Link href="/causes" className="btn-primary mt-5">Find a cause</Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {mine.map((m) => {
                  const { when, time } = fmtSchedule(m.request);
                  return (
                    <li key={m.response.id}>
                      <Link href={`/causes/${m.request.id}`} className="card flex gap-4 p-4 no-underline hover:shadow-md">
                        <div className="relative hidden h-24 w-32 shrink-0 overflow-hidden rounded-2xl sm:block">
                          {m.request.coverUrl && <Image src={m.request.coverUrl} alt="" fill sizes="128px" className="object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={m.response.status} />
                            {m.request.status === "completed" && <StatusBadge status="completed" label="Completed" />}
                          </div>
                          <p className="mt-2 text-xl font-bold text-purple-deep">{m.request.title}</p>
                          <p className="text-sm text-muted">{m.orgName.split(" — ")[0]} · {when} · {time}</p>
                          {m.response.status === "offered" && <p className="mt-1 text-sm">They'll contact you soon to follow up.</p>}
                          {m.response.status === "accepted" && m.request.status !== "completed" && (
                            <p className="mt-1 text-sm font-bold text-ok">You're confirmed. Open for the address, your contact and a calendar invite.</p>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-3xl font-bold">News from the causes you follow</h2>
            {feed.length === 0 ? (
              <p className="mt-4 text-muted">When organisations you've helped or prayed for post updates, they'll appear here.</p>
            ) : (
              <ol className="mt-6 space-y-5">
                {feed.map((f) => (
                  <li key={f.update.id} className="card overflow-hidden">
                    {f.update.photoUrl && <div className="relative aspect-[21/9]"><Image src={f.update.photoUrl} alt="" fill sizes="(min-width:1024px) 640px, 100vw" className="object-cover" /></div>}
                    <div className="p-5">
                      <p className="text-sm font-bold text-muted">{f.orgName.split(" — ")[0]} · {timeAgo(f.update.createdAt)}</p>
                      <Link href={`/causes/${f.requestId}`} className="text-lg font-bold">{f.title}</Link>
                      <p className="mt-2">{f.update.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* Headings sit outside the cards, as "My causes" does, so the cards start on one line. */}
        <aside id="skills" className="scroll-mt-28 space-y-12">
          <Link href="/faith" className="card flex items-center justify-between gap-4 border-2 border-gold/60 p-5 no-underline hover:shadow-md">
            <span>
              <span className="block text-xl font-bold text-purple-deep">Your saints</span>
              <span className="text-muted"><strong className="tabular-nums text-purple">{metCount}</strong> of {SAINTS.length} met</span>
            </span>
            <span aria-hidden className="font-bold text-purple">→</span>
          </Link>
          <section>
            <h2 className="text-3xl font-bold">My gifts</h2>
            <div className="card mt-6 p-6">
              <div className="flex flex-wrap gap-2">
                {user.skills.length ? user.skills.map((s) => <SkillChip key={s} id={s} />) : <p className="text-muted">None chosen yet.</p>}
                {user.otherSkill && <span className="chip">{user.otherSkill}</span>}
              </div>
              <details className="mt-5">
                <summary className="btn-ghost w-full cursor-pointer list-none">Change my gifts & details</summary>
                <div className="mt-5">
                  <SkillsForm skills={user.skills} otherSkill={user.otherSkill} area={user.area} phone={user.phone} />
                </div>
              </details>
            </div>
          </section>
          {prayed.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold">I'm praying for</h2>
              <ul className="card mt-6 space-y-2 p-6">
                {prayed.map((p) => <li key={p.requestId}><Link href={`/causes/${p.requestId}`}>{p.title}</Link></li>)}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </Container>
  );
}
