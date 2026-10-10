"use client";

import { useActionState, useEffect } from "react";
import { checkIn } from "@/app/actions/supporter";
import { pingSaints } from "@/components/saint-reveal";
import { Submit } from "@/components/submit";

export function CheckInForm({ requestId, token }: { requestId: number; token: string }) {
  const [state, action] = useActionState(checkIn.bind(null, requestId, token), undefined);
  useEffect(() => {
    if (state?.ok) pingSaints();
  }, [state]);
  return (
    <form action={action} className="space-y-3">
      {state?.error && <p className="rounded-2xl bg-bad-soft p-4 font-bold text-bad" role="alert">{state.error}</p>}
      <Submit className="btn-gold w-full text-xl" pending="Checking you in…">I'm here</Submit>
    </form>
  );
}
