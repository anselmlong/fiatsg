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
export function SaintLocked() {
  return (
    <div className={`saint-tile ${frame} border-2 border-gold/35 bg-gold-soft/40 !p-[3px] transition-colors group-hover:border-gold group-hover:bg-gold-soft/70`}>
      <div className={inner}>
        <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden">
          <Halo className="w-4/5 text-gold-ink" />
          <span aria-hidden className="absolute inset-0 flex items-center justify-center pt-10 font-serif text-5xl font-bold text-purple-deep">?</span>
        </div>
        <div className={caption}>
          <p className="font-serif text-[0.95rem] font-bold leading-[1.15] text-gold-ink">Saint to meet</p>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-muted">Locked</p>
        </div>
      </div>
    </div>
  );
}

// A hint at the next way to meet a saint.
export function SaintWaiting({ hint }: { hint: string }) {
  return (
    <div className={`saint-tile ${frame} border-2 border-dashed border-gold/55 bg-gold-soft/40 !p-[3px] transition-colors group-hover:border-gold group-hover:bg-gold-soft/70`}>
      <div className={inner}>
        <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-3 px-3">
          <Halo className="halo-breathe w-1/2 text-gold" />
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
      <div className="flex aspect-[3/4] w-20 items-center justify-center rounded-2xl border-2 border-dashed border-gold/55 bg-gold-soft/40">
        <Halo className="halo-breathe w-1/2 text-gold" />
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

function Halo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 110" aria-hidden className={className}>
      <circle cx="50" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="50" cy="36" r="15" fill="currentColor" opacity="0.2" />
      <path d="M18 110c2-30 14-52 32-52s30 22 32 52" fill="currentColor" opacity="0.2" />
    </svg>
  );
}
