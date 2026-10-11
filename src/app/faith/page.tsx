import Link from "next/link";
import { SaintCard, SaintLocked, SaintThumb, SaintWaiting } from "@/components/saint-card";
import { ShareButtons } from "@/components/share-buttons";
import { Container } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { metSaintIds } from "@/lib/meet";
import { FAITH_TASKS, SAINTS, categoryLabel, causePool, saint } from "@/lib/saints";
import { siteUrl } from "@/lib/site";
import { TaskButton } from "./task-button";
import { BONUS_SAINTS, type Discovery } from "@/lib/bonus-saints";

export const metadata = { title: "Saints" };

const HOW: Record<string, { href: string; label: string } | undefined> = {
  pray: { href: "/causes", label: "Find a cause to pray for" },
  offer: { href: "/causes", label: "Find a cause" },
};

const DISCOVERY_HREF: Record<Discovery, string> = { "lost-key": "/", bird: "#footer-bird", sources: "/saints/monica", "cheat-code": "#bonus-cards" };

// The collection first, then the ways to meet more.
export default async function SaintsPage() {
  const user = await currentUser();
  const supporter = user?.role === "supporter" ? user : null;
  const met = new Set(supporter ? await metSaintIds(supporter.id) : []);
  const inviteUrl = supporter ? `${await siteUrl()}/?ref=${supporter.id}` : null;

  return (
    <Container className="py-10">
      <h1 className="text-4xl font-bold sm:text-5xl">{supporter ? "Your Faith Companions" : "Meet the saints"}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Each time you serve, pray or bring someone along, you meet a saint who did the same, and their holy card joins your collection.
      </p>

      {supporter ? (
        <>
          <p className="mt-4 font-serif text-2xl text-ink">
            <strong className="tabular-nums">{SAINTS.filter((s) => met.has(s.id)).length}</strong> met
          </p>
          <Collection met={met} />
          <section id="bonus-cards" aria-labelledby="bonus-heading" className="mt-12 scroll-mt-28 border-t border-line pt-8">
            <h2 id="bonus-heading" className="text-3xl font-bold">Little discoveries</h2>
            <p className="mt-2 max-w-xl text-muted">Four bonus cards for curious souls. These are separate from your main collection.</p>
            <p className="mt-2 text-sm text-gold-ink">{BONUS_SAINTS.filter((s) => met.has(s.id)).length} of {BONUS_SAINTS.length} discovered</p>
            <ul className="mt-5 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
              {BONUS_SAINTS.map((s) => (
                <li key={s.id}>
                  {met.has(s.id) ? (
                    <Link href={`/saints/${s.id}`} className="block h-full rounded-[1.4rem] no-underline"><SaintCard saint={s} /></Link>
                  ) : (
                    <Link href={DISCOVERY_HREF[s.discovery]} className="group block h-full rounded-[1.4rem] no-underline">
                      <SaintLocked hint={s.hint} />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <div className="card mt-8 max-w-2xl p-6">
          <p className="text-lg">Join Fiat to start your collection and meet the saints who walked this way before you.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/join?next=/faith" className="btn-primary">Join Fiat</Link>
            <Link href="/login?next=/faith" className="btn-ghost">Log in</Link>
          </div>
        </div>
      )}

      <section aria-labelledby="meet-more" className="mt-14">
        <h2 id="meet-more" className="text-3xl font-bold">Meet more saints</h2>
        <p className="mt-1 text-lg text-muted">“Come and see.” — John 1:46. Each of these has a saint waiting.</p>

        {inviteUrl && (
          <div className="card mt-6 max-w-2xl border-2 border-gold/60 p-6">
            <h3 className="text-2xl font-bold">Invite a friend to Fiat</h3>
            <p className="mt-1 text-muted">When a friend joins from your link, you'll meet the saint who brought his brother to Jesus.</p>
            <div className="mt-4">
              <ShareButtons
                url={inviteUrl}
                title="Fiat"
                text={`${supporter!.name.split(" ")[0]} would like you to join Fiat: give your time, gifts and prayers to Catholic causes in Singapore.`}
              />
            </div>
          </div>
        )}

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FAITH_TASKS.map((t) => {
            const s = saint(t.saintId)!;
            const done = met.has(s.id);
            const how = HOW[t.id];
            return (
              <li key={t.id} id={`meet-${t.id}`} className="card scroll-mt-28 flex items-start gap-4 p-4">
                {done ? (
                  <Link href={`/saints/${s.id}`} className="shrink-0 rounded-2xl no-underline" aria-label={`Read ${s.name}'s story`}>
                    <SaintThumb saint={s} />
                  </Link>
                ) : (
                  <div className="shrink-0 text-center">
                    <SaintThumb />
                    <p className="mt-1 w-20 text-xs font-bold text-gold-ink">Saint to meet</p>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold">{t.title}</h3>
                  <p className="mt-1 text-muted">{t.body}</p>
                  <div className="mt-3">
                    {done ? (
                      <Link href={`/saints/${s.id}`} className="font-bold text-ok">You met {s.name}&nbsp;→</Link>
                    ) : !supporter ? null : t.kind === "honour" ? (
                      <TaskButton taskId={t.id} />
                    ) : how ? (
                      <Link href={how.href} className="font-bold">{how.label}&nbsp;→</Link>
                    ) : t.id === "invite" ? (
                      <p className="text-sm font-bold text-gold-ink">Share your link above.</p>
                    ) : (
                      <Link href="/causes" className="font-bold">Find a cause to share&nbsp;→</Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </Container>
  );
}

// Set iteration preserves the newest-first order returned by metSaintIds.
function Collection({ met }: { met: Set<string> }) {
  const mine = [...met].flatMap((id) => {
    const s = SAINTS.find((entry) => entry.id === id);
    return s ? [s] : [];
  });
  const hint = FAITH_TASKS.find((t) => !met.has(t.saintId))?.title ?? "Serve at any cause";
  const locked = SAINTS.filter((s) => !met.has(s.id));

  return (
    <section id="collection" aria-label="Your saint collection" className="mt-8 scroll-mt-28">
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {mine.map((s) => (
          <li key={s.id}>
            <Link href={`/saints/${s.id}`} className="block h-full rounded-[1.4rem] no-underline transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1">
              <SaintCard saint={s} />
            </Link>
          </li>
        ))}
        {locked.map((s, index) => {
          const task = FAITH_TASKS.find((t) => t.saintId === s.id);
          const remaining = causePool(s.category, s.tier).filter((candidate) => !met.has(candidate.id));
          const checkIns = remaining.findIndex((candidate) => candidate.id === s.id) + 1;
          const commitment = s.tier === 1 ? "one-off" : s.tier === 2 ? "regular" : "long-term or skilled";
          const unlockHint = task
            ? `${task.body}${task.kind === "honour" ? " Then mark it done below." : ""}`
            : `Check in at ${checkIns} more ${commitment} ${checkIns === 1 ? "cause" : "causes"} supporting ${categoryLabel(s.category).toLowerCase()}.`;
          return (
            <li key={s.id}>
              <Link href={task ? `#meet-${task.id}` : "/causes"} aria-label={`Saint to meet ${index + 1}: ${unlockHint} See how`} className="group block h-full rounded-[1.4rem] no-underline">
                <SaintLocked hint={unlockHint} />
              </Link>
            </li>
          );
        })}
        <li>
          <Link href="#meet-more" className="group block h-full rounded-[1.4rem] no-underline">
            <SaintWaiting hint={hint} />
          </Link>
        </li>
      </ul>
    </section>
  );
}
