"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { bonusForDiscovery } from "@/lib/bonus-saints";
import { meetSaint } from "@/lib/meet";

export async function claimDiscovery(discovery: string) {
  const reward = bonusForDiscovery(discovery);
  if (!reward) return { status: "invalid" } as const;
  const user = await currentUser();
  if (!user) return { status: "sign-in" } as const;
  if (user.role !== "supporter") return { status: "supporter-only" } as const;
  // The unique user/saint constraint makes retries and simultaneous clicks safe.
  const added = await meetSaint(user.id, reward.id, { taskId: `discovery:${reward.discovery}` });
  revalidatePath("/", "layout");
  return { status: added ? "found" : "already", name: reward.name } as const;
}
