import { HomeHero } from "@/components/home-hero";
import Link from "next/link";
import { CauseCard, Container } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { listCauses } from "@/lib/queries";
import { SaintDiscovery } from "@/components/saint-discovery";

export default async function Home() {
  const [user, causes] = await Promise.all([currentUser(), listCauses(["approved"])]);
  const mySkills = user?.skills ?? [];
  const score = (s: string[]) => s.filter((x) => mySkills.includes(x)).length;
  const featured = [...causes].sort((a, b) => score(b.request.skills) - score(a.request.skills)).slice(0, 3);

  return (
    <>
      <HomeHero />

      <section className="pt-16 pb-12 sm:pt-24">
        <Container>
          <h2 className="text-4xl font-bold">{mySkills.length ? "Causes that need your gifts" : "Where the Church needs you"}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CauseCard key={c.request.id} cause={c} mySkills={mySkills} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/causes" className="btn-ghost text-lg">See all {causes.length} causes</Link>
          </div>
        </Container>
      </section>

      {!user && (
        <section className="border-t border-line pt-12">
          <Container className="scroll-arrival flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-lg">
              <strong className="text-ink">Part of a Catholic organisation?</strong> Ask for the volunteers you need.
            </p>
            <Link href="/join/organisation" className="btn-ghost">Register your organisation</Link>
          </Container>
        </section>
      )}
      <Container className="mt-6 flex justify-end">
        <SaintDiscovery discovery="lost-key" />
      </Container>
    </>
  );
}
