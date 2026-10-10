"use client";

import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { useState } from "react";
import { IMAGE_TYPES } from "@/lib/media";
import { COVER_LIBRARY } from "@/lib/skills";
import { uploadMedia } from "@/lib/upload";

export function CoverPicker({ name = "coverUrl", initial, upload = false }: { name?: string; initial?: string | null; upload?: boolean }) {
  const isLibrary = !initial || COVER_LIBRARY.some((c) => c.url === initial);
  const [value, setValue] = useState(initial ?? COVER_LIBRARY[0].url);
  const [custom, setCustom] = useState(isLibrary ? "" : (initial ?? ""));
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function uploadCover(file: File | undefined) {
    if (!file) return;
    setError("");
    setProgress(0);
    try {
      const { url } = await uploadMedia(file, setProgress);
      setCustom(url);
    } catch (e) {
      setError((e as Error).message || "Couldn't upload that photo. Please try again.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={custom || value} />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {COVER_LIBRARY.map((c) => {
          const selected = !custom && value === c.url;
          return (
            <button
              key={c.url}
              type="button"
              aria-pressed={selected}
              aria-label={c.label}
              onClick={() => {
                setCustom("");
                setValue(c.url);
              }}
              className={`relative aspect-[4/3] overflow-hidden rounded-xl border-4 ${selected ? "border-purple" : "border-transparent opacity-80 hover:opacity-100"}`}
            >
              <Image src={c.url} alt="" fill sizes="160px" className="object-cover" />
              {selected && <span className="absolute right-1 top-1 rounded-full bg-purple px-2 text-sm font-bold text-white">✓</span>}
            </button>
          );
        })}
        {custom && /^https:\/\//.test(custom) && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border-4 border-purple">
            <Image src={custom} alt="Your photo" fill sizes="160px" className="object-cover" />
            <span className="absolute right-1 top-1 rounded-full bg-purple px-2 text-sm font-bold text-white">✓</span>
          </div>
        )}
      </div>
      {upload && (
        <label className={`btn-ghost ${progress === null ? "cursor-pointer" : "pointer-events-none opacity-70"}`}>
          <ImagePlus aria-hidden className="h-5 w-5" />
          {progress === null ? "Upload your own photo" : `Uploading… ${progress}%`}
          <input
            type="file"
            accept={IMAGE_TYPES.join(",")}
            onChange={(e) => {
              uploadCover(e.target.files?.[0]);
              e.target.value = "";
            }}
            className="sr-only"
          />
        </label>
      )}
      {error && <p className="font-bold text-bad" role="alert">{error}</p>}
      <label className="field">
        <span className="hint">…or paste a link to your own photo</span>
        <input value={custom} onChange={(e) => setCustom(e.target.value)} type="url" className="input" placeholder="https://…" />
      </label>
    </div>
  );
}
