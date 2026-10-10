"use client";

import { useState } from "react";

const SIZES = [
  { id: "normal", label: "A", title: "Normal text" },
  { id: "large", label: "A", title: "Large text" },
  { id: "xl", label: "A", title: "Extra large text" },
];

function persist(id: string) {
  document.documentElement.dataset.text = id;
  document.cookie = `fiat_text=${id}; path=/; max-age=31536000; samesite=lax`;
}

export function TextSize({ initial }: { initial: string }) {
  const [size, setSize] = useState(initial);
  function choose(id: string) {
    setSize(id);
    persist(id);
  }
  return (
    <div role="group" aria-label="Text size" className="flex items-center rounded-full border border-line bg-white p-1">
      {SIZES.map((s, i) => (
        <button
          key={s.id}
          type="button"
          title={s.title}
          aria-label={s.title}
          aria-pressed={size === s.id}
          onClick={() => choose(s.id)}
          className={`flex h-10 w-10 items-center justify-center rounded-full font-serif font-bold transition ${
            size === s.id ? "bg-purple text-white" : "text-purple hover:bg-purple-soft"
          }`}
          style={{ fontSize: `${0.85 + i * 0.2}rem` }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
