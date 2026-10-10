import Link from "next/link";
import { notFound } from "next/navigation";
import { SaintCard } from "@/components/saint-card";
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
    <Container className="max-w-4xl py-10">
      <Link href="/me#saints" className="font-bold">← Saints you've met</Link>
      <div className="mt-6 grid gap-10 md:grid-cols-[320px_1fr]">
        <div className="mx-auto md:mx-0">
          <SaintCard saint={s} size="lg" priority />
          {s.credit && <p className="mt-3 max-w-80 text-xs text-muted">{s.credit}</p>}
        </div>
        <article>
          <h1 className="text-4xl font-bold sm:text-5xl">{s.name}</h1>
          {s.patron && <p className="mt-2 text-lg font-bold text-gold-ink">{s.patron}</p>}
          <p className="mt-6 font-serif text-xl italic text-purple-deep">{s.why}</p>
          <div className="mt-6 space-y-4 text-lg leading-relaxed">
            {s.story.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {s.quote.text && (
            <blockquote className="mt-8 border-l-4 border-gold pl-5">
              <p className="font-serif text-2xl italic text-purple-deep">“{s.quote.text}”</p>
              <footer className="mt-2 text-sm text-muted">{s.quote.source}</footer>
            </blockquote>
          )}
          {s.prayer && (
            <div className="card mt-8 bg-purple-deep p-6 text-center">
              <p className="font-serif text-xl !text-white">{s.prayer}</p>
              <p className="mt-2 text-sm font-bold uppercase tracking-wider text-gold">Amen</p>
            </div>
          )}
        </article>
      </div>
    </Container>
  );
}
