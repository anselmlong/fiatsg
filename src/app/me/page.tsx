import Image from "next/image";
import Link from "next/link";
import { desc, eq, inArray, or } from "drizzle-orm";
import { Container, SkillChip, StatusBadge } from "@/components/ui";
import { db, orgs, prayers, requests, responses, updates } from "@/db";
import { requireUser } from "@/lib/auth";
import { fmtSchedule, timeAgo } from "@/lib/format";
import { SkillsForm } from "./skills-form";
import { SaintCard, SaintWaiting } from "@/components/saint-card";
import { metSaintIds } from "@/lib/meet";
import { CATEGORIES, FAITH_TASKS, causePool, saint, saintsIn, type Saint } from "@/lib/saints";
import { Sprout } from "lucide-react";

export const metadata = { title: "My impact" };

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
  const metIds = await metSaintIds(user.id);
  const met = new Set(metIds);

  return (
    <Container className="py-10">
      <h1 className=" text-4xl font-bold sm:text-5xl">Thank you, {first}.</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        “Whatever you did for one of the least of these brothers and sisters of mine, you did for me.” — Matthew 25:40
      </p>

      <section aria-label="Your numbers" className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { n: mine.filter((m) => m.response.status !== "declined").length, l: "causes you offered to help" },
          { n: accepted.length, l: "times you were welcomed" },
          { n: prayed.length, l: "causes you prayed for" },
          { n: peopleReached, l: "people reached by causes you served" },
        ].map((s) => (
          <div key={s.l} className="card p-5 text-center">
            <p className="font-serif text-5xl font-bold tabular-nums text-purple">{s.n}</p>
            <p className="mt-1 text-sm text-muted">{s.l}</p>
          </div>
        ))}
      </section>

      <Saints met={met} />

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-bold">My causes</h2>
            {mine.length === 0 ? (
              <div className="card mt-6 p-8 text-center">
                <Sprout aria-hidden className="mx-auto h-12 w-12 text-ok" strokeWidth={1.5} />
                <p className="mt-3 font-serif text-2xl text-purple-deep">Every yes begins small.</p>
                <p className="mt-2 text-lg text-muted">When you offer to help, it will appear here, with news of what your help made possible.</p>
                <Link href="/causes" className="btn-primary mt-5">Find a cause</Link>
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
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

const TIER_PLACE = ["", "a one-off event", "a regular role", "a long-term role"];
const grid = "mt-3 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

// The saints met so far, by category, with one soft silhouette hinting at who comes next.
function Saints({ met }: { met: Set<string> }) {
  // Sharing the faith first: it's open to everyone, every day.
  const groups = [...CATEGORIES].sort((a, b) => Number(b.id === "faith") - Number(a.id === "faith")).map((c) => {
    const all = saintsIn(c.id);
    if (!all.length) return null;
    const mine = all.filter((s) => met.has(s.id));
    let hint: string | null = null;
    if (c.id === "faith") {
      const task = FAITH_TASKS.find((t) => !met.has(t.saintId));
      if (task) hint = task.title;
    } else {
      const tier = [1, 2, 3].find((t) => causePool(c.id, t).some((s) => !met.has(s.id)));
      if (tier) hint = `Serve ${c.label.toLowerCase()} at ${TIER_PLACE[tier]}`;
    }
    return { c, mine, hint };
  }).filter((g) => g !== null);

  return (
    <section id="saints" aria-labelledby="saints-title" className="mt-12 scroll-mt-28">
      <h2 id="saints-title" className="text-3xl font-bold">Saints you've met</h2>
      <p className="mt-1 text-lg text-muted">Each time you serve, pray or bring someone along, you meet a saint who did the same.</p>
      <div className="mt-6 space-y-8">
        {groups.map(({ c, mine, hint }) => (
          <div key={c.id}>
            <h3 className="text-xl font-bold">{c.label}</h3>
            <ul className={grid}>
              {mine.map((s: Saint) => (
                <li key={s.id}>
                  <Link href={`/saints/${s.id}`} className="block h-full rounded-[1.4rem] no-underline transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1">
                    <SaintCard saint={saint(s.id)!} />
                  </Link>
                </li>
              ))}
              {hint && (
                <li>
                  <Link href={c.id === "faith" ? "/faith" : "/causes"} className="group block h-full rounded-[1.4rem] no-underline">
                    <SaintWaiting hint={hint} />
                  </Link>
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
