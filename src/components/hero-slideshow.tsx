"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const PHOTOS = [
  { src: "/images/acmi-care-packs.jpg", alt: "Migrant workers and volunteers holding blue care packs at an ACMI outreach visit", credit: "ACMI", href: "https://acmi.org.sg/outreach-engagement/", position: "50% center" },
  { src: "/images/oyp-community.webp", alt: "Young people smiling together during a community gathering", credit: "Office for Young People", href: "https://www.oyp.org.sg/communities", position: "55% center" },
  { src: "/images/caritas-seniors-outing.jpg", alt: "Seniors and companions enjoying a group outing at Bird Paradise", credit: "Caritas Singapore", href: "https://www.caritas-singapore.org/", position: "50% 65%" },
] as const;

function subscribeMotion(listener: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

export function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);
  const element = useRef<HTMLElement>(null);
  const autoplay = !paused && !hovered && !focused && !reducedMotion;

  useEffect(() => {
    if (!autoplay) return;
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    function sync() {
      clearInterval(timer);
      if (visible && !document.hidden) {
        timer = setInterval(() => setActive((n) => (n + 1) % PHOTOS.length), 8000);
      }
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.25 });
    if (element.current) observer.observe(element.current);
    document.addEventListener("visibilitychange", sync);
    return () => { clearInterval(timer); observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [autoplay]);

  function move(direction: number) {
    setPaused(true);
    setActive((n) => (n + direction + PHOTOS.length) % PHOTOS.length);
  }

  const photo = PHOTOS[active];
  return (
    <figure ref={element} className="hero-slideshow" aria-label="Community photographs" aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="hero-slideshow-frame">
        <div className="hero-slideshow-images">
          {PHOTOS.map((p, index) => (
            <div key={p.src} className="hero-slide" data-active={index === active} aria-hidden={index !== active} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${PHOTOS.length}`}>
              <Image src={p.src} alt={p.alt} fill priority={index === 0} sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" style={{ objectPosition: p.position }} />
            </div>
          ))}
        </div>
      </div>
      <figcaption className="hero-slideshow-caption">
        <span aria-live={autoplay ? "off" : "polite"} aria-atomic="true" className="hero-photo-credit">Photo via <a href={photo.href} target="_blank" rel="noreferrer">{photo.credit}</a><span className="sr-only">. {photo.alt}</span></span>
        <div className="hero-slideshow-controls">
          {!reducedMotion && <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play slideshow" : "Pause slideshow"}>{paused ? <Play aria-hidden /> : <Pause aria-hidden />}</button>}
          <button type="button" onClick={() => move(-1)} aria-label="Previous photo"><ChevronLeft aria-hidden /></button>
          <span className="hero-slide-count" aria-hidden="true">{active + 1} / {PHOTOS.length}</span>
          <button type="button" onClick={() => move(1)} aria-label="Next photo"><ChevronRight aria-hidden /></button>
        </div>
      </figcaption>
    </figure>
  );
}
