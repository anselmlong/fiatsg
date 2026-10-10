"use client";

import { useFormStatus } from "react-dom";

// `busy` is for forms that submit from onSubmit, where useFormStatus can't see the request.
export function Submit({ children, pending = "Please wait…", className = "btn-primary", busy }: { children: React.ReactNode; pending?: string; className?: string; busy?: boolean }) {
  const status = useFormStatus();
  const isBusy = busy ?? status.pending;
  return (
    <button type="submit" disabled={isBusy} className={className}>
      {isBusy ? pending : children}
    </button>
  );
}
