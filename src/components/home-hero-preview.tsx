import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "./home-hero-preview.css";

export const HERO_PREVIEWS = [
  { id: "split", label: "1. Clean split" },
  { id: "royal", label: "2. Royal purple" },
  { id: "arch", label: "3. Cream & arch" },
] as const;
export type HeroPreview = (typeof HERO_PREVIEWS)[number]["id"];

export function HeroPreviewSwitcher({ selected }: { selected: HeroPreview | "current" }) {
  return (
    <nav aria-label="Hero design previews" className="border-b border-line bg-paper px-4 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
        <p className="mr-3 text-sm font-bold text-muted">Compare the hero</p>
        {[...HERO_PREVIEWS, { id: "current", label: "Current gradient" }].map((v) => (
          <Link key={v.id} href={`/?hero=${v.id}`} scroll={false} aria-current={selected === v.id ? "page" : undefined} className={`rounded-full border px-4 py-2 text-sm font-bold no-underline ${selected === v.id ? "border-purple bg-purple text-white" : "border-line text-ink hover:bg-purple-soft"}`}>
            {v.label}
          </Link>
        ))}
        <Link href="/" className="ml-auto px-2 py-2 text-sm">Exit preview</Link>
      </div>
    </nav>
  );
}

export function HomeHeroPreview({ variant }: { variant: HeroPreview }) {
  return (
    <section className={`hero-option hero-option--${variant}`} aria-labelledby="hero-heading">
      <div className="hero-option-layout">
        <div className="hero-option-copy">
          <h1 id="hero-heading"><span lang="la" data-no-translate>Fiat</span> — let it be done.</h1>
          <p className="hero-option-invitation">Mary&apos;s yes changed everything. Yours can be an hour, a skill, a prayer or an invite.</p>
          <p className="hero-option-description">Fiat connects you with Catholic organisations in Singapore that need help. Every request is vetted by the Catholic Foundation.</p>
          <Link href="/causes" className="btn-gold hero-cta mt-8 text-lg">Find a way to help <ArrowRight aria-hidden className="h-5 w-5" /></Link>
        </div>
        <figure className="hero-option-figure">
          <div className="hero-option-photo">
            <Image src="/images/hero-worship-crop.jpg" alt="Young Catholics worshipping together, hands raised, before a crucifix" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-[70%_center]" />
          </div>
          <figcaption>Photo: Office for Young People</figcaption>
        </figure>
      </div>
    </section>
  );
}
