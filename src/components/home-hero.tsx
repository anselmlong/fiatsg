import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSlideshow } from "./hero-slideshow";
import "./home-hero.css";

export function HomeHero() {
  return (
    <section className="arch-hero" aria-labelledby="hero-heading">
      <div className="arch-hero-layout">
        <div className="arch-hero-copy">
          <h1 id="hero-heading"><span lang="la" data-no-translate>Fiat</span> — let it be done.</h1>
          <p className="arch-hero-invitation">Mary&apos;s yes changed everything. Yours can be an hour, a skill, a prayer or an invite.</p>
          <p className="arch-hero-description">Fiat connects you with Catholic organisations in Singapore that need help. Every request is vetted by the Catholic Foundation.</p>
          <Link href="/causes" className="btn-gold hero-cta mt-8 text-lg">Find a way to help <ArrowRight aria-hidden className="h-5 w-5" /></Link>
        </div>
        <HeroSlideshow />
      </div>
    </section>
  );
}
