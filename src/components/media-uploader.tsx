"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IMAGE_TYPES, MAX_MEDIA, VIDEO_TYPES, type MediaItem } from "@/lib/media";
import { uploadMedia } from "@/lib/upload";

type Pending = { id: number; name: string; pct: number };

export function MediaUploader({ name = "media", initial = [] }: { name?: string; initial?: MediaItem[] }) {
  const [items, setItems] = useState<MediaItem[]>(initial);
  const [pending, setPending] = useState<Pending[]>([]);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const slots = MAX_MEDIA - items.length - pending.length;

  // Block form submission while files are still uploading.
  useEffect(() => {
    input.current?.setCustomValidity(pending.length ? "Please wait for your photos and videos to finish uploading." : "");
  }, [pending.length]);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const chosen = Array.from(files).slice(0, Math.max(0, slots));
    if (files.length > chosen.length) setError(`You can add up to ${MAX_MEDIA} photos and videos.`);
    await Promise.all(
      chosen.map(async (file, i) => {
        const id = Date.now() + i;
        setPending((p) => [...p, { id, name: file.name, pct: 0 }]);
        try {
          const item = await uploadMedia(file, (pct) => setPending((p) => p.map((x) => (x.id === id ? { ...x, pct } : x))));
          setItems((m) => [...m, item].slice(0, MAX_MEDIA));
        } catch (e) {
          setError((e as Error).message || `Couldn't upload ${file.name}. Please try again.`);
        } finally {
          setPending((p) => p.filter((x) => x.id !== id));
        }
      }),
    );
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {(items.length > 0 || pending.length > 0) && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((m, i) => (
            <li key={m.url} className="settle-in relative aspect-[4/3] overflow-hidden rounded-xl bg-purple-soft">
              {m.kind === "video" ? (
                <video src={m.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
              ) : (
                <Image src={m.url} alt="" fill sizes="240px" className="object-cover" />
              )}
              {m.kind === "video" && <span className="absolute bottom-1 left-1 rounded-full bg-ink/80 px-2 text-sm font-bold text-white">Video</span>}
              <button
                type="button"
                onClick={() => setItems((all) => all.filter((_, j) => j !== i))}
                aria-label={`Remove ${m.kind} ${i + 1}`}
                className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink shadow hover:bg-white"
              >
                <X aria-hidden className="h-5 w-5" />
              </button>
            </li>
          ))}
          {pending.map((p) => (
            <li key={p.id} className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-white p-3 text-center" role="status">
              <span className="line-clamp-1 text-sm font-bold">{p.name}</span>
              <span className="h-2 w-full overflow-hidden rounded-full bg-purple-soft">
                <span className="block h-full bg-purple transition-[width]" style={{ width: `${p.pct}%` }} />
              </span>
              <span className="text-sm text-muted">Uploading… {p.pct}%</span>
            </li>
          ))}
        </ul>
      )}
      {/* Kept mounted even when full so the upload-in-progress validity check still applies. */}
      <label className={`btn-ghost ${slots > 0 ? "cursor-pointer" : "pointer-events-none opacity-50"}`}>
        <ImagePlus aria-hidden className="h-5 w-5" />
        {slots > 0 ? (items.length ? "Add more photos or videos" : "Add photos or videos") : `${MAX_MEDIA} of ${MAX_MEDIA} added`}
        <input
          ref={input}
          type="file"
          multiple
          accept={[...IMAGE_TYPES, ...VIDEO_TYPES].join(",")}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
        />
      </label>
      {error && <p className="font-bold text-bad" role="alert">{error}</p>}
    </div>
  );
}
