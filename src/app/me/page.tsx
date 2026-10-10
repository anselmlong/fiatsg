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
import { ArrowRight, ChevronDown, Sprout } from "lucide-react";

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
    <Container className="max-w-4xl py-8 sm:py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">My causes</h1>
          <p className="mt-2 text-muted">Thank you, {first}. Here’s where you’re helping.</p>
        </div>
        <Link href="/faith" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold no-underline hover:underline">
          Your saints <span className="font-normal text-muted">{metCount}/{SAINTS.length}</span>
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </header>
      {numbers.length > 0 && (
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
          {numbers.map((x) => (
            <span key={x.l}><strong className="tabular-nums text-ink">{x.n}</strong> {x.l}</span>
          ))}
        </p>
      )}

      <section aria-label="Causes you've said yes to" className="mt-8">
        {mine.length === 0 ? (
          <div className="border-y border-line py-10">
            <Sprout aria-hidden className="h-8 w-8 text-ok" strokeWidth={1.5} />
            <p className="mt-3 font-serif text-2xl text-ink">Every yes begins small.</p>
            <p className="mt-2 max-w-lg text-muted">When you offer to help, your causes and their updates will appear here.</p>
            <Link href="/causes" className="btn-primary mt-5">Find a cause</Link>
          </div>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {mine.map((m) => {
              const { when, time } = fmtSchedule(m.request);
              return (
                <li key={m.response.id}>
                  <Link href={`/causes/${m.request.id}`} className="group flex items-start gap-4 rounded-lg py-6 no-underline sm:gap-5">
                    {m.request.coverUrl && (
                      <div className="relative hidden h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:block">
                        <Image src={m.request.coverUrl} alt="" fill sizes="96px" className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                        <p className="text-sm text-muted">{m.orgName.split(" — ")[0]}</p>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge status={m.response.status} />
                          {m.request.status === "completed" && <StatusBadge status="completed" label="Completed" />}
                        </div>
                      </div>
                      <h2 className="mt-2 text-xl font-bold group-hover:underline">{m.request.title}</h2>
                      <p className="mt-1 text-sm text-muted">{when} · {time}</p>
                      {m.response.status === "offered" && <p className="mt-2 text-sm text-muted">They'll contact you soon to follow up.</p>}
                      {m.response.status === "accepted" && m.request.status !== "completed" && (
                        <p className="mt-2 text-sm text-ok">You're confirmed. View the address, contact and calendar invite.</p>
                      )}
                    </div>
                    <ArrowRight aria-hidden className="mt-1 hidden h-4 w-4 shrink-0 text-purple sm:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="cause-updates" className="mt-10">
        <h2 id="cause-updates" className="text-2xl font-bold">Updates</h2>
        {feed.length === 0 ? (
          <p className="mt-2 max-w-xl text-sm text-muted">No news yet. Updates from causes you’ve helped or prayed for will appear here.</p>
        ) : (
          <ol className="mt-5 divide-y divide-line">
            {feed.map((f) => (
              <li key={f.update.id} className="py-5 first:pt-0">
                <p className="text-sm text-muted">{f.orgName.split(" — ")[0]} · {timeAgo(f.update.createdAt)}</p>
                <Link href={`/causes/${f.requestId}`} className="mt-1 inline-block text-lg font-bold">{f.title}</Link>
                <p className="mt-2 whitespace-pre-line">{f.update.body}</p>
                {f.update.photoUrl && <div className="relative mt-4 aspect-[21/9] overflow-hidden rounded-xl"><Image src={f.update.photoUrl} alt="" fill sizes="(min-width:1024px) 864px, 100vw" className="object-cover" /></div>}
              </li>
            ))}
          </ol>
        )}
      </section>

      <aside aria-label="Your gifts and prayers" className="mt-10 border-t border-line">
        <details id="skills" className="group/skills scroll-mt-28 border-b border-line">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block font-bold text-ink">My gifts & details</span>
              <span className="mt-1 block text-sm text-muted">{user.skills.length + (user.otherSkill ? 1 : 0)} gifts selected · Update your skills, area and contact</span>
            </span>
            <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-purple group-open/skills:rotate-180" />
          </summary>
          <div className="max-w-xl pb-6">
            <div className="mb-5 flex flex-wrap gap-2">
              {user.skills.map((s) => <SkillChip key={s} id={s} />)}
              {user.otherSkill && <span className="chip">{user.otherSkill}</span>}
            </div>
            <SkillsForm skills={user.skills} otherSkill={user.otherSkill} area={user.area} phone={user.phone} />
          </div>
        </details>
        {prayed.length > 0 && (
          <details className="group/prayers border-b border-line">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
              <span className="font-bold text-ink">I’m praying for <span className="ml-2 font-normal tabular-nums text-muted">{prayed.length}</span></span>
              <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-purple group-open/prayers:rotate-180" />
            </summary>
            <ul className="space-y-3 pb-5">
              {prayed.map((p) => <li key={p.requestId}><Link href={`/causes/${p.requestId}`} className="inline-block py-1">{p.title}</Link></li>)}
            </ul>
          </details>
        )}
      </aside>
    </Container>
  );
}
