"use client";

import { useRef, type ComponentProps } from "react";

type Field = HTMLInputElement | HTMLSelectElement;

// A GET form that applies itself as soon as a choice is made.
// Arrow keys only move the choice (each step would otherwise reload the page and
// lose focus); the form applies when focus leaves that field, or on Enter.
export function AutoSubmitForm(props: Omit<ComponentProps<"form">, "method" | "onKeyDown" | "onChange" | "onBlur">) {
  const arrow = useRef(false);
  const dirty = useRef(false);
  return (
    <form
      method="get"
      {...props}
      onKeyDown={(e) => {
        arrow.current = e.key.startsWith("Arrow");
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.requestSubmit();
        }
      }}
      onChange={(e) => {
        if (arrow.current) dirty.current = true;
        else e.currentTarget.requestSubmit();
        arrow.current = false;
      }}
      onBlur={(e) => {
        const to = e.relatedTarget as Field | null;
        // Moving between chips in the same group isn't leaving the choice.
        if (dirty.current && to?.name !== (e.target as EventTarget as Field).name) {
          dirty.current = false;
          e.currentTarget.requestSubmit();
        }
      }}
    />
  );
}
