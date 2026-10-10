import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake, ShieldCheck, Sprout } from "lucide-react";
import { PrayIcon } from "@/components/icons";
import { CauseCard, Container } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { getUpdates, listCauses, siteStats } from "@/lib/queries";

const PEOPLE = [
  {
    who: "A student with two dollars a day",
    quote: "I only have two dollars of pocket money. I want to give something to God — but what?",
    answer: "A Sunday afternoon at Villa Francis. An hour teaching English. A prayer tonight.",
    photo: "/images/oyp-1.webp",
  },
  {
    who: "A father of four",
    quote: "Every dollar is already stretched. I can't write a cheque.",
    answer: "One Saturday morning helping a family with their forms. His children can come too.",
    photo: "/images/caritas-community.jpg",
  },
  {
    who: "A grandmother at home",
    quote: "My knees are not good anymore. What use am I?",
    answer: "Her Rosary for a worker far from home. Her voice on the phone to someone lonely.",
    photo: "/images/vf-banner4.jpg",
  },
];

const STEPS = [
  { t: "Pray", d: "Every cause has a prayer button. Tap it, add a few words if you like. The organisation sees every one.", Icon: PrayIcon },
  { t: "Serve", d: "Tell us what you're good at. We'll show you the causes that need exactly that — once, or every week.", Icon: HeartHandshake },
  { t: "See the fruit", d: "Organisations post updates. Your “My impact” page shows the lives your time has touched.", Icon: Sprout },
];

export default async function Home() {
  const [user, causes, completed, stats] = await Promise.all([
    currentUser(),
    listCauses(["approved"]),
    listCauses(["completed"]),
    siteStats(),
  ]);
  const mySkills = user?.skills ?? [];
  const score = (s: string[]) => s.filter((x) => mySkills.includes(x)).length;
  const featured = [...causes].sort((a, b) => score(b.request.skills) - score(a.request.skills)).slice(0, 3);
  const stories = await Promise.all(completed.slice(0, 2).map(async (c) => ({ cause: c, updates: await getUpdates(c.request.id) })));
  const n = (v: number) => <strong className="font-serif text-[1.15em] tabular-nums text-purple">{v.toLocaleString()}</strong>;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-purple-deep">
        <Image src="/images/hero-volunteer.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover object-[60%_30%] opacity-25 lg:hidden" />
        <div className="grid lg:grid-cols-[1fr_minmax(0,40vw)]">
          <div className="px-4 py-20 sm:py-28 lg:py-32 lg:pr-12 lg:pl-[max(1rem,calc((100vw-72rem)/2+1rem))]">
            <h1 className="font-serif text-7xl font-bold leading-none tracking-tight !text-white sm:text-9xl">Fiat.</h1>
            <p className="mt-5 font-serif text-3xl text-balance text-gold sm:text-5xl">Mary said yes. How about us?</p>
            <p className="mt-10 max-w-2xl font-serif text-2xl font-bold text-balance text-white sm:text-3xl">
              Not everyone can give money. Everyone can give something.
            </p>
            <p className="mt-5 max-w-xl text-xl text-white/90">
              Your time. Your skills. Your prayer. Fiat brings Catholics in Singapore, of every age, to the people who need
              what they already have.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/causes" className="btn-gold text-lg">
                Find a cause to help <ArrowRight aria-hidden className="h-5 w-5" />
              </Link>
              {!user && (
                <Link href="/join/organisation" className="btn border-2 border-white/80 text-lg !text-white hover:bg-white/10">
                  I represent an organisation
                </Link>
              )}
            </div>
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
              Volunteers with residents · Catholic Welfare Services
            </figcaption>
          </figure>
        </div>
      </section>

      <section aria-label="So far" className="border-b border-line bg-paper">
        <Container className="py-10">
          <p className="max-w-4xl text-xl leading-relaxed text-ink/85 sm:text-2xl">
            So far, Catholics here have offered {n(stats.prayers)} prayers, given {n(stats.hours)} hours and reached {n(stats.served)} people.
            Right now, {n(stats.causes)} causes are waiting for someone to say yes.
          </p>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <h2 className="max-w-3xl text-4xl font-bold text-balance sm:text-5xl">The widow gave two small coins, and it was more than all the rest.</h2>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            The Catholic Foundation asks us to give our time, talent and treasure. For many of us, treasure is the hardest
            part. Fiat is for everyone else.
          </p>
          <ol className="mt-14 divide-y divide-line border-y border-line">
            {PEOPLE.map((p) => (
              <li key={p.who} className="grid items-center gap-6 py-10 md:grid-cols-[180px_1fr_1fr] md:gap-10">
                <div className="relative aspect-square w-28 overflow-hidden rounded-full md:w-40">
                  <Image src={p.photo} alt="" fill sizes="160px" className="object-cover" />
                </div>
                <blockquote>
                  <p className="font-serif text-2xl italic leading-snug text-purple-deep sm:text-3xl">“{p.quote}”</p>
                  <footer className="mt-3 font-bold text-muted">{p.who}</footer>
                </blockquote>
                <p className="text-lg md:text-xl">
                  <span className="block text-sm font-bold text-gold-ink">What they can give</span>
                  {p.answer}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-label="In the Bleak Midwinter" className="border-y border-gold/30 bg-gold-soft/50 py-24 sm:py-32">
        <Container className="max-w-3xl text-center">
          <PrayIcon aria-hidden className="mx-auto h-8 w-8 text-gold" strokeWidth={1.5} />
          <blockquote className="mt-8">
            <p className="font-serif text-3xl leading-snug text-purple-deep text-balance sm:text-5xl sm:leading-tight">
              What can I give Him, poor as I am?
            </p>
            <div className="mx-auto mt-8 max-w-xl space-y-1 font-serif text-xl italic leading-relaxed text-ink/85 sm:text-2xl">
              <p>If I were a shepherd, I would bring a lamb;</p>
              <p>If I were a wise man, I would do my part;</p>
              <p>Yet what I can I give Him:</p>
            </div>
            <p className="mt-6 font-serif text-4xl font-bold text-purple sm:text-6xl">Give my heart.</p>
            <footer className="mt-8 text-muted">
              Christina Rossetti, <cite className="not-italic">“In the Bleak Midwinter”</cite>
            </footer>
          </blockquote>
          <Link href="/causes" className="btn-primary mt-12 text-lg">Give what you can <ArrowRight aria-hidden className="h-5 w-5" /></Link>
        </Container>
      </section>

      <section id="how" className="scroll-mt-24 bg-purple-deep py-20 text-white sm:py-28">
        <Container>
          <h2 className="text-4xl font-bold !text-white sm:text-5xl">Pray. Serve. See the fruit.</h2>
          <ol className="mt-12 grid gap-12 md:grid-cols-3">
            {STEPS.map(({ t, d, Icon }) => (
              <li key={t}>
                <Icon aria-hidden className="h-10 w-10 text-gold" strokeWidth={1.5} />
                <h3 className="mt-5 text-3xl !text-white">{t}</h3>
                <p className="mt-3 text-lg text-white/85">{d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-14 flex max-w-3xl items-start gap-3 text-lg text-white/90">
            <ShieldCheck aria-hidden className="mt-1 h-6 w-6 shrink-0 text-gold" />
            <span>Every organisation and every request is reviewed by the Catholic Foundation before it appears here, so you can give with confidence.</span>
          </p>
        </Container>
      </section>

      {stories.length > 0 && (
        <section className="py-20 sm:py-28">
          <Container>
            <h2 className="text-4xl font-bold sm:text-5xl">What happened when people said yes</h2>
            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {stories.map(({ cause, updates }) => (
                <Link key={cause.request.id} href={`/causes/${cause.request.id}`} className="card group overflow-hidden no-underline">
                  <div className="relative aspect-[16/9]">
                    {cause.request.coverUrl && <Image src={cause.request.coverUrl} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.02]" />}
                  </div>
                  <div className="p-7">
                    <p className="text-sm font-bold text-muted">{cause.org.name.split(" — ")[0]}</p>
                    <h3 className="mt-1 text-2xl group-hover:underline">{cause.request.title}</h3>
                    {updates[0] && <blockquote className="mt-4 font-serif text-xl italic leading-relaxed text-ink/90">“{updates[0].body}”</blockquote>}
                    <p className="mt-6 text-muted">
                      {n(cause.request.outcomeHours ?? 0)} hours given · {n(cause.request.outcomePeopleServed ?? 0)} people served · {n(cause.prayerCount)} prayers
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="bg-paper py-20 sm:py-28">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-bold sm:text-5xl">{mySkills.length ? "Causes that need your gifts" : "Someone is waiting for you"}</h2>
            <Link href="/causes" className="btn-ghost">See all {causes.length} causes</Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CauseCard key={c.request.id} cause={c} mySkills={mySkills} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src="/images/acmi-volunteer.jpg" alt="Volunteers sorting donated clothes" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-4xl font-bold sm:text-5xl">Ask for the help you actually need</h2>
            <p className="mt-5 text-lg text-ink/85">
              Catholic organisations can post a one-off or weekly request in a few minutes. Tell your story, list the
              skills you need, and see who responds, with their skills and contact details, so you can follow up
              personally.
            </p>
            <Link href={user ? "/org" : "/join/organisation"} className="btn-primary mt-8">Register your organisation</Link>
          </div>
        </Container>
      </section>
    </>
  );
}
