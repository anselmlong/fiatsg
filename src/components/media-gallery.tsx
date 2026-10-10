import Image from "next/image";
import type { MediaItem } from "@/lib/media";

// Photos and videos an organisation added to a request. Videos play inline.
export function MediaGallery({ items, sizes = "(min-width:1024px) 640px, 100vw" }: { items: MediaItem[]; sizes?: string }) {
  if (!items.length) return null;
  return (
    <ul className={`grid gap-3 ${items.length > 1 ? "sm:grid-cols-2" : ""}`}>
      {items.map((m, i) => (
        <li key={m.url} className={items.length % 2 === 1 && i === 0 && items.length > 1 ? "sm:col-span-2" : undefined}>
          {m.kind === "video" ? (
            <video src={m.url} controls playsInline preload="metadata" className="aspect-video w-full rounded-2xl bg-ink object-contain" />
          ) : (
            <a href={m.url} target="_blank" rel="noreferrer" className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-purple-soft">
              <Image src={m.url} alt="" fill sizes={sizes} className="object-cover" />
              <span className="sr-only">Open photo {i + 1} full size</span>
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
