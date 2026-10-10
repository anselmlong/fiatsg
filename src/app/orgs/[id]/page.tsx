import Image from "next/image";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CauseCard, Container } from "@/components/ui";
import { db, orgs } from "@/db";
import { currentUser } from "@/lib/auth";
import { listCauses } from "@/lib/queries";

export default async function OrgPage({ params }: PageProps<"/orgs/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [[org], user, causes] = await Promise.all([
    db.select().from(orgs).where(eq(orgs.id, id)),
    currentUser(),
    listCauses(["approved", "completed"]),
  ]);
  if (!org || (org.status !== "approved" && user?.role !== "cf_admin" && user?.id !== org.ownerId)) notFound();
  const mine = causes.filter((c) => c.org.id === id);
  const open = mine.filter((c) => c.request.status === "approved");
  const done = mine.filter((c) => c.request.status === "completed");
  const totals = done.reduce((a, c) => ({ h: a.h + (c.request.outcomeHours ?? 0), p: a.p + (c.request.outcomePeopleServed ?? 0) }), { h: 0, p: 0 });

  return (
    <>
      <div className="relative isolate bg-purple-deep">
        {org.coverUrl && <Image src={org.coverUrl} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-45" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-purple-deep via-purple-deep/70 to-transparent" />
        <Container className="pb-10 pt-32 sm:pt-44">
          <h1 className="mt-3 max-w-4xl text-4xl font-bold !text-white sm:text-5xl">{org.name}</h1>
          <p className="mt-3 font-serif text-2xl italic text-gold">{org.tagline}</p>
        </Container>
      </div>
      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <h2 className="text-3xl font-bold">Our story</h2>
            <p className="mt-4 text-lg leading-relaxed">{org.history}</p>
          </section>
          {org.whyItMatters && (
            <section className="rounded-3xl bg-gold-soft/60 p-7">
              <h2 className="text-2xl font-bold">Why it matters</h2>
              <p className="mt-3 font-serif text-xl italic leading-relaxed">{org.whyItMatters}</p>
            </section>
          )}
        </div>
        <aside className="card h-fit space-y-4 p-6">
          {org.foundedYear && <p><strong>Serving since</strong><br /><span className="font-serif text-3xl font-bold text-purple">{org.foundedYear}</span></p>}
          {totals.h > 0 && <p><strong>Hours given through Fiat</strong><br /><span className="font-serif text-3xl font-bold tabular-nums text-purple">{totals.h}</span></p>}
          {totals.p > 0 && <p><strong>People served</strong><br /><span className="font-serif text-3xl font-bold tabular-nums text-purple">{totals.p}</span></p>}
          <p><strong>Open requests</strong><br /><span className="font-serif text-3xl font-bold tabular-nums text-purple">{open.length}</span></p>
          {org.website && <a href={org.website} target="_blank" rel="noreferrer" className="btn-ghost w-full">Website ↗</a>}
          <p className="hint">✓ Vetted by the Catholic Foundation</p>
        </aside>
      </Container>
      <Container>
        <h2 className="text-3xl font-bold">Needing help now</h2>
        {open.length ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{open.map((c) => <CauseCard key={c.request.id} cause={c} mySkills={user?.skills} />)}</div>
        ) : (
          <p className="mt-4 text-muted">No open requests right now.</p>
        )}
        {done.length > 0 && (
          <>
            <h2 className="mt-14 text-3xl font-bold">What volunteers made possible</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{done.map((c) => <CauseCard key={c.request.id} cause={c} />)}</div>
          </>
        )}
      </Container>
    </>
  );
}
