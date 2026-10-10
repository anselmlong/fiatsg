import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { saint } from "@/lib/saints";

export async function generateMetadata({ params }: PageProps<"/saints/[id]">) {
  const s = saint((await params).id);
  return { title: s?.name ?? "Saint" };
}

export default async function SaintPage({ params }: PageProps<"/saints/[id]">) {
  const s = saint((await params).id);
  if (!s) notFound();
  return (
    <Container className="max-w-5xl py-8 sm:py-12">
      <Link href="/me#saints" className="font-bold">← Saints you've met</Link>

      <div className="mt-8 grid gap-10 md:grid-cols-[17rem_1fr] md:gap-14 lg:grid-cols-[19rem_1fr]">
        {/* The portrait stays in view beside the story on wider screens. */}
        <figure className="mx-auto w-60 self-start sm:w-64 md:sticky md:top-32 md:mx-0 md:w-full">
          <div className="rounded-[1.6rem] bg-gold p-[5px] shadow-[0_18px_40px_-20px_rgba(52,25,92,0.55)]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[1.3rem] border-2 border-gold-soft bg-purple-deep">
              <Image src={s.image} alt={s.name} fill priority sizes="(min-width:1024px) 304px, (min-width:768px) 272px, 256px" className="object-cover" />
            </div>
          </div>
          {s.credit && <figcaption className="mt-3 text-center text-xs leading-relaxed text-muted md:text-left">{s.credit}</figcaption>}
        </figure>

        <article className="min-w-0">
          <h1 className="text-balance text-4xl font-bold sm:text-5xl">{s.name}</h1>
          <p className="mt-3 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 text-sm font-bold uppercase tracking-[0.08em] text-gold-ink">
            {s.feast && <span>Feast · {s.feast}</span>}
            {s.feast && s.patron && <span aria-hidden className="hidden h-1 w-1 rounded-full bg-gold sm:block" />}
            {s.patron && <span className="normal-case tracking-normal">{s.patron}</span>}
          </p>

          <p className="mt-8 text-balance font-serif text-2xl italic leading-snug text-purple-deep">{s.why}</p>

          <div className="mt-6 max-w-[62ch] space-y-5 text-lg leading-[1.75] text-ink/90">
            {s.story.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {s.quote.text && (
            <figure className="mt-12 max-w-[56ch]">
              <svg aria-hidden viewBox="0 0 32 24" className="h-6 w-8 text-gold"><path fill="currentColor" d="M0 24V14C0 6 4.5 1.3 12 0l1.4 3.4C9.2 4.8 7.2 7.6 7 11h6v13H0zm18 0V14c0-8 4.5-12.7 12-14l1.4 3.4C27.2 4.8 25.2 7.6 25 11h6v13H18z" /></svg>
              <blockquote className="mt-3 text-balance font-serif text-2xl italic leading-snug text-purple-deep sm:text-[1.7rem]">{s.quote.text}</blockquote>
              <figcaption className="mt-3 text-sm text-muted">{s.quote.source}</figcaption>
            </figure>
          )}

          {s.prayer && (
            <section aria-label="Prayer" className="mt-12 rounded-3xl bg-purple-deep px-6 py-8 text-center sm:px-10">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Let us pray</p>
              <p className="mx-auto mt-3 max-w-[40ch] text-balance font-serif text-xl leading-relaxed !text-white sm:text-2xl">{s.prayer}</p>
              <p className="mt-4 font-serif text-lg italic text-gold">Amen.</p>
            </section>
          )}
        </article>
      </div>
    </Container>
  );
}
