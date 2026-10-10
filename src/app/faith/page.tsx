import Link from "next/link";
import { SaintCard, SaintWaiting } from "@/components/saint-card";
import { ShareButtons } from "@/components/share-buttons";
import { Container } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { metSaintIds } from "@/lib/meet";
import { FAITH_TASKS, saint } from "@/lib/saints";
import { siteUrl } from "@/lib/site";
import { TaskButton } from "./task-button";

export const metadata = { title: "Share your faith" };

const HOW: Record<string, { href: string; label: string } | undefined> = {
  pray: { href: "/causes", label: "Find a cause to pray for" },
  offer: { href: "/causes", label: "Find a cause" },
};

export default async function FaithPage() {
  const user = await currentUser();
  const supporter = user?.role === "supporter" ? user : null;
  const met = new Set(supporter ? await metSaintIds(supporter.id) : []);
  const inviteUrl = supporter ? `${await siteUrl()}/?ref=${supporter.id}` : null;

  return (
    <Container className="py-10">
      <h1 className="text-4xl font-bold sm:text-5xl">Bring someone with you.</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        “Come and see.” — John 1:46. Each time you share your faith, you'll meet a saint who did the same.
      </p>

      {inviteUrl ? (
        <section className="card mt-8 max-w-2xl border-2 border-gold/60 p-6">
          <h2 className="text-2xl font-bold">Invite a friend to Fiat</h2>
          <p className="mt-1 text-muted">When a friend joins from your link, you'll meet the saint who brought his brother to Jesus.</p>
          <div className="mt-4">
            <ShareButtons
              url={inviteUrl}
              title="Fiat"
              text={`${supporter!.name.split(" ")[0]} would like you to join Fiat: give your time, skills and prayers to Catholic causes in Singapore.`}
            />
          </div>
        </section>
      ) : (
        <div className="card mt-8 max-w-2xl p-6">
          <p className="text-lg">Join Fiat to share your faith and meet the saints who walked this way before you.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/join?next=/faith" className="btn-primary">Join Fiat</Link>
            <Link href="/login?next=/faith" className="btn-ghost">Log in</Link>
          </div>
        </div>
      )}

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FAITH_TASKS.map((t) => {
          const s = saint(t.saintId)!;
          const done = met.has(s.id);
          const how = HOW[t.id];
          return (
            <li key={t.id} className="card flex gap-4 p-4">
              <Link href={done ? `/saints/${s.id}` : "#"} className={`w-28 shrink-0 no-underline ${done ? "" : "pointer-events-none"}`} aria-disabled={!done} tabIndex={done ? 0 : -1}>
                {done ? <SaintCard saint={s} /> : <SaintWaiting hint="" />}
              </Link>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold">{t.title}</h2>
                <p className="mt-1 text-muted">{t.body}</p>
                <div className="mt-3">
                  {done ? (
                    <p className="font-bold text-ok">You met {s.name}.</p>
                  ) : !supporter ? null : t.kind === "honour" ? (
                    <TaskButton taskId={t.id} />
                  ) : how ? (
                    <Link href={how.href} className="font-bold">{how.label} →</Link>
                  ) : t.id === "invite" ? (
                    <p className="text-sm font-bold text-gold-ink">Share your link above.</p>
                  ) : (
                    <p className="text-sm text-muted">Share a cause with a friend you invited, and both check in when you get there.</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
