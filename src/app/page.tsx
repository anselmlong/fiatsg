import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CauseCard, Container } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { listCauses } from "@/lib/queries";

export default async function Home() {
  const [user, causes] = await Promise.all([currentUser(), listCauses(["approved"])]);
  const mySkills = user?.skills ?? [];
  const score = (s: string[]) => s.filter((x) => mySkills.includes(x)).length;
  const featured = [...causes].sort((a, b) => score(b.request.skills) - score(a.request.skills)).slice(0, 3);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-purple-deep">
        <Image
          src="/images/hero-worship-crop.jpg"
          alt="Young Catholics worshipping together, hands raised, before a crucifix"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-deep via-purple-deep/85 to-purple-deep/20" />
        <div className="absolute inset-0 -z-10 bg-purple-deep/40 lg:hidden" />
        <Container className="py-20 sm:py-28 lg:py-32">
          <h1 className="font-serif text-5xl font-bold !text-gold sm:text-7xl">
            <span lang="la" data-no-translate>Fiat</span> — let it be done.
          </h1>
          <p className="mt-6 max-w-2xl font-serif text-2xl text-balance !text-white sm:text-4xl">
            Mary's yes changed everything. Yours can be an hour, a skill or a prayer.
          </p>
          <p className="mt-6 max-w-xl text-lg text-white/90 sm:text-xl">
            Fiat connects you with Catholic organisations in Singapore that need help. Every request is vetted by the
            Catholic Foundation.
          </p>
          <Link href="/causes" className="btn-gold mt-10 text-lg">
            Find a way to help <ArrowRight aria-hidden className="h-5 w-5" />
          </Link>
        </Container>
        <p className="absolute bottom-3 right-4 text-xs text-white/70">Photo: Office for Young People</p>
      </section>

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
          <Container className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-lg">
              <strong className="text-purple-deep">Part of a Catholic organisation?</strong> Ask for the volunteers you need.
            </p>
            <Link href="/join/organisation" className="btn-ghost">Register your organisation</Link>
          </Container>
        </section>
      )}
    </>
  );
}
