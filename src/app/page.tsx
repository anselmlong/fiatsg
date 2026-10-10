import Image from "next/image";
import Link from "next/link";
import { CauseCard, Container } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { getUpdates, listCauses, siteStats } from "@/lib/queries";

const PEOPLE = [
  {
    who: "A student with $2 a day",
    quote: "“I only have two dollars of pocket money. I want to give something to God — but what?”",
    answer: "Your Sunday afternoon. Your patience teaching English. Your prayer tonight.",
    icon: "🎒",
  },
  {
    who: "A father of four",
    quote: "“Every dollar is already stretched. I can't write a cheque.”",
    answer: "One Saturday morning helping a family fill in forms. Your children can come too.",
    icon: "👨‍👧‍👦",
  },
  {
    who: "A grandmother at home",
    quote: "“My knees are not good anymore. What use am I?”",
    answer: "Your Rosary for a migrant worker far from home. Your voice on a phone call to someone lonely.",
    icon: "📿",
  },
];

export default async function Home() {
  const [user, causes, completed, stats] = await Promise.all([
    currentUser(),
    listCauses(["approved"]),
    listCauses(["completed"]),
    siteStats(),
  ]);
  const mySkills = user?.skills ?? [];
  const featured = [...causes]
    .sort((a, b) => b.request.skills.filter((s) => mySkills.includes(s)).length - a.request.skills.filter((s) => mySkills.includes(s)).length)
    .slice(0, 3);
  const stories = await Promise.all(completed.slice(0, 2).map(async (c) => ({ cause: c, updates: await getUpdates(c.request.id) })));

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-purple-deep">
        <Image src="/images/cws-sjh.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-deep via-purple-deep/85 to-purple-deep/30" />
        <Container className="py-20 sm:py-28">
          <p className="eyebrow !text-gold">Fiat · “Let it be done”</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-bold !text-white sm:text-6xl">
            Not everyone can give money.
            <br />
            <span className="text-gold">Everyone can give something.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-white/90">
            Your time. Your skills. Your prayer. Fiat connects Catholics in Singapore — of every age — with the people and
            organisations who need exactly what you already have.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/causes" className="btn-gold text-lg">Find a cause to help →</Link>
            {!user && (
              <Link href="/join/organisation" className="btn border-2 border-white text-lg text-white hover:bg-white/10">
                I represent an organisation
              </Link>
            )}
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section aria-label="Impact so far" className="border-b border-line bg-paper">
        <Container className="grid grid-cols-2 gap-6 py-10 text-center md:grid-cols-4">
          {[
            { n: stats.causes, l: "causes needing help now" },
            { n: stats.prayers, l: "prayers offered" },
            { n: stats.hours, l: "hours given" },
            { n: stats.served, l: "people served" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-serif text-5xl font-bold text-purple">{s.n.toLocaleString()}</p>
              <p className="mt-1 text-muted">{s.l}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* People */}
      <section className="py-20">
        <Container>
          <p className="eyebrow">What can I give?</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-bold">The widow gave two small coins — and it was more than all the rest.</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            The Catholic Foundation asks us to give our time, talent and treasure. For many of us, treasure is the hardest.
            Fiat is for everyone else.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PEOPLE.map((p) => (
              <article key={p.who} className="card flex flex-col p-7">
                <span aria-hidden className="text-5xl">{p.icon}</span>
                <h3 className="mt-4 text-2xl">{p.who}</h3>
                <p className="mt-3 font-serif text-lg italic text-ink/85">{p.quote}</p>
                <p className="mt-4 border-t border-line pt-4 font-bold text-purple">{p.answer}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-24 bg-purple-soft/60 py-20">
        <Container>
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-4xl font-bold">Pray. Serve. See the fruit.</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { t: "Pray", d: "Every cause has a 🙏 button. Tap it, and add a short prayer if you like. The organisation sees every one.", i: "🙏" },
              { t: "Serve", d: "Tell us what you're good at. We'll show you causes that need exactly that — once, or every week.", i: "🤝" },
              { t: "See the fruit", d: "Organisations post updates. Your “My impact” page shows the lives your time has touched.", i: "🌱" },
            ].map((s, i) => (
              <li key={s.t} className="card p-7">
                <p className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple font-serif text-2xl font-bold text-white">{i + 1}</span>
                  <span aria-hidden className="text-3xl">{s.i}</span>
                </p>
                <h3 className="mt-4 text-2xl">{s.t}</h3>
                <p className="mt-2 text-ink/85">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 rounded-2xl border-2 border-gold/50 bg-paper p-5 text-ink/85">
            <strong className="text-purple-deep">Every organisation and every request is reviewed by the Catholic Foundation</strong> before it
            appears here — so you can give with confidence.
          </p>
        </Container>
      </section>

      {/* Stories */}
      {stories.length > 0 && (
        <section className="py-20">
          <Container>
            <p className="eyebrow">The fruit</p>
            <h2 className="mt-3 text-4xl font-bold">What happened when people said yes</h2>
            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              {stories.map(({ cause, updates }) => (
                <Link key={cause.request.id} href={`/causes/${cause.request.id}`} className="card group overflow-hidden no-underline">
                  <div className="relative aspect-[16/9]">
                    {cause.request.coverUrl && <Image src={cause.request.coverUrl} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />}
                  </div>
                  <div className="p-7">
                    <p className="text-sm font-bold text-muted">{cause.org.name.split(" — ")[0]}</p>
                    <h3 className="mt-1 text-2xl group-hover:underline">{cause.request.title}</h3>
                    {updates[0] && <blockquote className="mt-4 border-l-4 border-gold pl-4 font-serif text-lg italic text-ink/90">{updates[0].body}</blockquote>}
                    <dl className="mt-6 flex gap-8">
                      <div>
                        <dt className="text-sm text-muted">Hours given</dt>
                        <dd className="font-serif text-3xl font-bold text-purple">{cause.request.outcomeHours}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted">People served</dt>
                        <dd className="font-serif text-3xl font-bold text-purple">{cause.request.outcomePeopleServed}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted">Prayers</dt>
                        <dd className="font-serif text-3xl font-bold text-purple">{cause.prayerCount}</dd>
                      </div>
                    </dl>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Featured causes */}
      <section className="bg-paper py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Needing help now</p>
              <h2 className="mt-3 text-4xl font-bold">{mySkills.length ? "Causes that need your gifts" : "Someone is waiting for you"}</h2>
            </div>
            <Link href="/causes" className="btn-ghost">See all {causes.length} causes</Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CauseCard key={c.request.id} cause={c} mySkills={mySkills} />
            ))}
          </div>
        </Container>
      </section>

      {/* Orgs */}
      <section className="py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src="/images/acmi-volunteer.jpg" alt="Volunteers packing donations" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow">For Catholic organisations</p>
            <h2 className="mt-3 text-4xl font-bold">Ask for the help you actually need</h2>
            <p className="mt-4 text-lg text-ink/85">
              Post a one-off or regular request in a few minutes. Tell your story, list the skills you need, and see who
              responds — with their skills and contact details — so you can follow up personally.
            </p>
            <Link href={user ? "/org" : "/join/organisation"} className="btn-primary mt-8">Register your organisation</Link>
          </div>
        </Container>
      </section>
    </>
  );
}
