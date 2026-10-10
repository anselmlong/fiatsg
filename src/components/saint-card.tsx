import Image from "next/image";
import type { Saint } from "@/lib/saints";

// Every holy card shares one geometry: a 5px gold frame, a 3:4 image, and a caption of fixed height,
// so cards line up in any grid whatever the saint's name or feast.
const frame = "flex h-full flex-col rounded-[1.4rem] p-[5px]";
const inner = "flex flex-1 flex-col overflow-hidden rounded-[1.1rem]";
const caption = "flex h-[4.75rem] flex-col items-center justify-center gap-0.5 px-3 text-center";

export function SaintCard({ saint, size = "md", priority }: { saint: Saint; size?: "md" | "lg"; priority?: boolean }) {
  const lg = size === "lg";
  return (
    <figure className={`saint-tile ${frame} bg-gold shadow-[0_6px_18px_-8px_rgba(52,25,92,0.45)] ${lg ? "w-72 sm:w-80" : "w-full"}`}>
      <div className={`${inner} border-2 border-gold-soft bg-paper`}>
        <div className="relative aspect-[3/4] bg-gold-soft">
          <Image src={saint.image} alt={saint.name} fill priority={priority} sizes={lg ? "320px" : "(min-width:1024px) 180px, (min-width:640px) 30vw, 45vw"} className="object-cover" />
        </div>
        <figcaption className={`${caption} ${lg ? "h-[5.5rem]" : ""}`}>
          <p className={`line-clamp-2 text-balance font-serif font-bold leading-[1.15] text-ink ${lg ? "text-2xl" : "text-[0.95rem]"}`}>{saint.name}</p>
          {saint.feast && <p className="whitespace-nowrap text-[0.68rem] font-bold uppercase tracking-[0.08em] text-gold-ink">{saint.feast}</p>}
        </figcaption>
      </div>
    </figure>
  );
}

// Keep an unmet saint's identity hidden while showing their place in the collection.
export function SaintLocked({ hint }: { hint: string }) {
  return (
    <div className={`saint-tile ${frame} border-2 border-gold/35 bg-paper !p-[3px] transition-colors group-hover:border-gold`}>
      <div className={inner}>
        <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-gold-soft/35">
          <SaintCardBack className="h-full w-full text-gold-ink/65 transition-colors group-hover:text-gold-ink" />
        </div>
        <div className="flex flex-1 flex-col items-center gap-2 px-3 py-4 text-center">
          <p className="font-serif text-[0.95rem] font-bold leading-[1.15] text-gold-ink">Saint to meet</p>
          <p className="text-balance text-xs leading-relaxed text-muted">{hint}</p>
          <p className="mt-auto pt-1 text-xs font-bold text-purple group-hover:underline">See how <span aria-hidden>→</span></p>
        </div>
      </div>
    </div>
  );
}

// A hint at the next way to meet a saint.
export function SaintWaiting({ hint }: { hint: string }) {
  return (
    <div className={`saint-tile ${frame} border-2 border-gold/35 bg-paper !p-[3px] transition-colors group-hover:border-gold group-hover:bg-gold-soft/30`}>
      <div className={inner}>
        <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-3 px-3">
          <SaintCardBack className="h-20 w-16 shrink-0 text-gold-ink/65" />
          <p className="text-balance text-center text-sm font-bold leading-snug text-purple-deep">{hint}</p>
        </div>
        <div className={caption}>
          <p className="font-serif text-[0.95rem] font-bold leading-[1.15] text-gold-ink">Waiting for you</p>
        </div>
      </div>
    </div>
  );
}

// A small image-only card for lists, the same size whether met or waiting.
export function SaintThumb({ saint }: { saint?: Saint }) {
  if (!saint) {
    return (
      <div className="flex aspect-[3/4] w-20 items-center justify-center overflow-hidden rounded-2xl border border-gold/40 bg-gold-soft/35">
        <SaintCardBack className="h-full w-full text-gold-ink/65" />
      </div>
    );
  }
  return (
    <div className="w-20 rounded-2xl bg-gold p-[3px] shadow-[0_4px_12px_-6px_rgba(52,25,92,0.45)]">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[0.8rem] bg-gold-soft">
        <Image src={saint.image} alt={saint.name} fill sizes="80px" className="object-cover" />
      </div>
    </div>
  );
}

// A printed holy-card reverse, shared by every unrevealed saint.
function SaintCardBack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 132" fill="none" aria-hidden="true" focusable="false" className={className}>
      <rect x="9" y="9" width="82" height="114" rx="14" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
      <rect x="13" y="13" width="74" height="106" rx="11" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <path d="M50 24v9m0 66v9M24 66h8m36 0h8" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
      <circle cx="50" cy="66" r="22" stroke="currentColor" strokeWidth="0.7" opacity="0.6" />
      <path d="M50 51v30M40 61h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m50 37 2 3-2 3-2-3Zm0 52 2 3-2 3-2-3Z" fill="currentColor" opacity="0.65" />
    </svg>
  );
}
