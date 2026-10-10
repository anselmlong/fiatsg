"use client";

import Image from "next/image";
import { useState } from "react";
import { COVER_LIBRARY } from "@/lib/skills";

export function CoverPicker({ name = "coverUrl", initial }: { name?: string; initial?: string | null }) {
  const isLibrary = !initial || COVER_LIBRARY.some((c) => c.url === initial);
  const [value, setValue] = useState(initial ?? COVER_LIBRARY[0].url);
  const [custom, setCustom] = useState(isLibrary ? "" : (initial ?? ""));
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
      </div>
      <label className="field">
        <span className="hint">…or paste a link to your own photo</span>
        <input value={custom} onChange={(e) => setCustom(e.target.value)} type="url" className="input" placeholder="https://…" />
      </label>
    </div>
  );
}
