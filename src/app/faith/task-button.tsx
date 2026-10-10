"use client";

import { doFaithTask } from "@/app/actions/supporter";
import { pingSaints } from "@/components/saint-reveal";
import { Submit } from "@/components/submit";

export function TaskButton({ taskId }: { taskId: string }) {
  return (
    <form action={async () => { await doFaithTask(taskId); pingSaints(); }}>
      <Submit className="btn-primary" pending="One moment…">I did this</Submit>
    </form>
  );
}
