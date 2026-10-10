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
        <div className="grid lg:grid-cols-[1fr_minmax(0,46vw)]">
          <div className="flex flex-col justify-center px-4 py-12 sm:py-20 lg:py-32 lg:pr-12 lg:pl-[max(1rem,calc((100vw-72rem)/2+1rem))]">
            <blockquote>
              <h1 className="font-serif text-4xl font-bold text-balance !text-gold sm:text-6xl">What can I give Him, poor as I am?</h1>
              <p className="mt-6 font-serif text-5xl font-bold !text-white sm:text-7xl">Give my heart.</p>
              <footer className="mt-4 text-white/75">Christina Rossetti</footer>
            </blockquote>
            <Link href="/causes" className="btn-gold mt-10 self-start text-lg">
              Find a way to help <ArrowRight aria-hidden className="h-5 w-5" />
            </Link>
          </div>
          <figure className="relative order-first aspect-[4/3] lg:order-none lg:aspect-auto lg:min-h-[36rem]">
            <Image
              src="/images/hero-oyp-cross.jpg"
              alt="Young Catholics from the Office for Young People gathered around a San Damiano crucifix"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover object-[50%_45%]"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-purple-deep to-transparent lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-16 lg:bg-gradient-to-r" />
            <figcaption className="absolute bottom-3 right-4 rounded-full bg-purple-deep/80 px-3 py-1 text-xs text-white">
              Photo: Office for Young People
            </figcaption>
          </figure>
        </div>
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
