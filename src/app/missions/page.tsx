import Link from "next/link";
import { ArrowUpRight, BookOpen, CalendarDays, Check, Leaf, Sparkles } from "lucide-react";
import { Container } from "@/components/ui";
import { SaintThumb } from "@/components/saint-card";
import { ShareButtons } from "@/components/share-buttons";
import { currentUser } from "@/lib/auth";
import { metSaintIds } from "@/lib/meet";
import { MISSIONS, MISSION_CATEGORIES } from "@/lib/missions";
import { faithTask, saint } from "@/lib/saints";
import { siteUrl } from "@/lib/site";
import { TaskButton } from "@/app/faith/task-button";

export const metadata = { title: "Missions" };
const icons = { small: Sparkles, event: CalendarDays, course: BookOpen, retreat: Leaf };

export default async function MissionsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const selected = MISSION_CATEGORIES.find((c) => c.id === category);
  const user = await currentUser();
  const supporter = user?.role === "supporter" ? user : null;
  const met = new Set(supporter ? await metSaintIds(supporter.id) : []);
  const inviteUrl = supporter ? `${await siteUrl()}/?ref=${supporter.id}` : null;
  const missions = selected ? MISSIONS.filter((m) => m.category === selected.id) : MISSIONS;

  return (
    <Container className="py-10 sm:py-14">
      <p className="text-sm font-bold uppercase tracking-widest text-gold-ink">Little steps. A growing faith.</p>
      <h1 className="mt-3 text-4xl font-bold sm:text-6xl">Make room for a mission.</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">Bring a friend. Learn something new. Take a day to listen. Each mission is a way to live your faith — and meet a saint along the way.</p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <a href="#missions" className="btn-primary">Find your next step <ArrowUpRight aria-hidden className="h-4 w-4" /></a>
        <Link href="/faith" className="font-bold">{supporter ? "See your saint collection" : "Discover the saints"}&nbsp;→</Link>
      </div>
      <p className="mt-8 max-w-3xl rounded-2xl border border-line bg-paper px-5 py-4 text-sm text-muted"><strong className="text-ink">A starter collection.</strong> Activities marked “Demo activity” are examples, with no scheduled dates or bookings. Arrange a real activity with your parish or community, then record it here. Each saint joins your collection once.</p>

      <section id="missions" aria-labelledby="missions-heading" className="mt-10 scroll-mt-32">
        <h2 id="missions-heading" className="text-3xl font-bold">{selected?.label ?? "Find your next step"}</h2>
        <nav aria-label="Mission categories" className="mt-5 flex flex-wrap gap-2">
          {[{ id: "all", label: "All missions" }, ...MISSION_CATEGORIES].map((c) => {
            const active = c.id === (selected?.id ?? "all");
            return <Link key={c.id} href={c.id === "all" ? "/missions#missions" : `/missions?category=${c.id}#missions`} aria-current={active ? "page" : undefined} className={`rounded-full border px-4 py-2 text-sm font-bold no-underline ${active ? "border-gold bg-gold-soft text-gold-ink" : "border-line bg-paper text-ink hover:border-gold"}`}>{c.label}</Link>;
          })}
        </nav>
        <p className="mt-4 text-sm text-muted">{missions.length} {missions.length === 1 ? "mission" : "missions"} to explore</p>
        <ul className="mt-5 grid gap-5 md:grid-cols-2">
          {missions.map((m) => {
            const task = faithTask(m.taskId)!;
            const reward = saint(task.saintId)!;
            const done = met.has(reward.id);
            const Icon = icons[m.category];
            return (
              <li key={m.id} className="card flex flex-col p-5 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-soft text-gold-ink"><Icon aria-hidden className="h-5 w-5" /></span>
                  {m.isDemo && <span className="rounded-full border border-line px-3 py-1 text-xs font-bold text-muted">Demo activity</span>}
                </div>
                <h3 className="mt-4 text-2xl font-bold">{m.title}</h3>
                <p className="mt-2 text-muted">{m.description}</p>
                <p className="mt-4 text-sm font-bold text-gold-ink">{m.commitment}</p>
                <details className="mt-4 rounded-xl border border-line px-4 py-3">
                  <summary className="cursor-pointer font-bold">How to complete this mission</summary>
                  <p className="mt-2 text-sm text-muted">{m.nextStep}</p>
                </details>
                <div className="mt-auto pt-6">
                  <div className="flex items-center gap-4 border-t border-line pt-5">
                    <SaintThumb saint={done ? reward : undefined} />
                    <div>
                      <p className={`flex items-center gap-1 font-bold ${done ? "text-ok" : "text-gold-ink"}`}>{done ? <><Check aria-hidden className="h-4 w-4" /> Saint met</> : "A saint is waiting"}</p>
                      <p className="mt-1 text-sm text-muted">{done ? reward.name : "Complete this mission to reveal their holy card."}</p>
                    </div>
                  </div>
                  <div className="mt-5">
                    {done ? <Link href={`/saints/${reward.id}`} className="btn-ghost">Read {reward.name}&apos;s story</Link>
                      : !user ? <Link href="/login?next=/missions" className="btn-primary">Log in to begin</Link>
                      : !supporter ? <p className="text-sm text-muted">Saint missions are available to supporter accounts.</p>
                      : task.kind === "honour" ? <><p className="mb-3 text-sm text-muted">Already done this in real life? Your word is enough.</p><TaskButton taskId={task.id} /></>
                      : task.id === "invite" && inviteUrl ? <ShareButtons url={inviteUrl} title="Join me on Fiat" text="Let's take a small step together. Join me on Fiat to serve, pray and meet the saints." />
                      : <Link href="/causes" className="btn-ghost">{task.id === "pray" ? "Find a cause to pray for" : "Find a cause together"}&nbsp;→</Link>}
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
