"use client";

import { useFormStatus } from "react-dom";

// A submit button that asks before doing something that can't be undone.
export function ConfirmButton({ message, children, className = "btn-danger" }: { message: string; children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "Deleting…" : children}
    </button>
  );
}
