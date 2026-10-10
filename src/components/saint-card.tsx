import Image from "next/image";
import type { Saint } from "@/lib/saints";

// A holy card: the saint's image inside one gold frame, so paintings from different centuries sit together.
export function SaintCard({ saint, size = "md", priority }: { saint: Saint; size?: "md" | "lg"; priority?: boolean }) {
  return (
    <figure className={`relative overflow-hidden rounded-[1.4rem] bg-gold p-[5px] shadow-lg ${size === "lg" ? "w-72 sm:w-80" : "w-full"}`}>
      <div className="overflow-hidden rounded-[1.1rem] border-2 border-gold-soft bg-paper">
        <div className="relative aspect-[3/4] bg-purple-deep">
          <Image src={saint.image} alt={`${saint.name}`} fill priority={priority} sizes={size === "lg" ? "320px" : "(min-width:768px) 220px, 45vw"} className="object-cover" />
          <div aria-hidden className="absolute inset-0 rounded-t-[1rem] ring-1 ring-inset ring-gold/60" />
        </div>
        <figcaption className="px-3 py-3 text-center">
          <p className={`font-serif font-bold leading-tight text-purple-deep ${size === "lg" ? "text-2xl" : "text-lg"}`}>{saint.name}</p>
          {saint.feast && <p className="text-xs font-bold uppercase tracking-wider text-gold-ink">Feast · {saint.feast}</p>}
        </figcaption>
      </div>
    </figure>
  );
}

// Someone not yet met: a soft halo and a hint at the task that brings them. No names, no counts.
export function SaintWaiting({ hint }: { hint: string }) {
  return (
    <div className="flex h-full flex-col rounded-[1.4rem] border-2 border-dashed border-gold/60 bg-purple-soft/40 p-[5px]">
      <div className="relative flex aspect-[3/4] items-center justify-center">
        <svg viewBox="0 0 100 130" aria-hidden className="halo-breathe h-3/5 text-gold">
          <circle cx="50" cy="34" r="24" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="50" cy="40" r="15" fill="currentColor" opacity="0.18" />
          <path d="M18 128c2-34 14-58 32-58s30 24 32 58" fill="currentColor" opacity="0.18" />
        </svg>
      </div>
      <p className="px-3 pb-3 text-center text-sm font-bold text-purple-deep">{hint}</p>
    </div>
  );
}
