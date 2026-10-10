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
        <Image src="/images/hero-volunteer.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover object-[60%_30%] opacity-25 lg:hidden" />
        <div className="grid lg:grid-cols-[1fr_minmax(0,40vw)]">
          <div className="px-4 py-16 sm:py-24 lg:py-28 lg:pr-12 lg:pl-[max(1rem,calc((100vw-72rem)/2+1rem))]">
            <h1 className="font-serif text-7xl font-bold leading-none tracking-tight !text-white sm:text-9xl">Fiat.</h1>
            <blockquote className="mt-8 max-w-2xl">
              <p className="font-serif text-2xl text-balance text-gold sm:text-4xl">What can I give Him, poor as I am?</p>
              <div className="mt-4 space-y-1 font-serif text-lg italic leading-relaxed text-white/90 sm:text-2xl">
                <p>If I were a shepherd, I would bring a lamb;</p>
                <p>If I were a wise man, I would do my part;</p>
                <p>Yet what I can I give Him:</p>
              </div>
              <p className="mt-3 font-serif text-4xl font-bold !text-white sm:text-5xl">Give my heart.</p>
              <footer className="mt-3 text-sm text-white/75">Christina Rossetti</footer>
            </blockquote>
            <p className="mt-8 max-w-md text-xl text-white/90">Give your time, your skills or your prayer to someone who needs it.</p>
            <Link href="/causes" className="btn-gold mt-8 text-lg">
              Find a way to help <ArrowRight aria-hidden className="h-5 w-5" />
            </Link>
          </div>
          <figure className="relative hidden lg:block">
            <Image
              src="/images/hero-volunteer.jpg"
              alt="A young volunteer laughing with a senior in a wheelchair"
              fill
              priority
              sizes="40vw"
              className="object-cover object-[60%_30%]"
            />
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-purple-deep to-transparent" />
            <figcaption className="absolute bottom-4 right-4 rounded-full bg-purple-deep/80 px-3 py-1 text-sm text-white">
              Photo: catholicwelfare.org.sg
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <h2 className="text-4xl font-bold">{mySkills.length ? "Causes that need your gifts" : "Someone is waiting for you"}</h2>
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
        <section className="border-t border-line bg-paper py-12">
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
