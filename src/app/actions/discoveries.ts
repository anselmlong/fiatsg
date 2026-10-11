"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { BONUS_SAINTS, bonusForDiscovery } from "@/lib/bonus-saints";
import { meetSaint, meetSaints } from "@/lib/meet";
import { SAINTS } from "@/lib/saints";

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

// The "allsaints" cheat code: every card in the collection and every bonus card.
export async function unlockAllSaints() {
  const user = await currentUser();
  if (!user) return { status: "sign-in" } as const;
  if (user.role !== "supporter") return { status: "supporter-only" } as const;
  const added = await meetSaints(user.id, [...SAINTS, ...BONUS_SAINTS].map((s) => s.id), "cheat:all-saints");
  revalidatePath("/", "layout");
  return { status: "unlocked", added } as const;
}
