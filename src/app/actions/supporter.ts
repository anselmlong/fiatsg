"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db, prayers, requests, responses, users } from "@/db";
import { currentUser, requireUser } from "@/lib/auth";
import { type FormState, list, str, strOrNull } from "@/lib/forms";
import { isSkill } from "@/lib/skills";

export async function offerHelp(requestId: number, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(undefined, `/causes/${requestId}`);
  if (user.role !== "supporter") return { error: "Only supporter accounts can offer to help." };
  const [req] = await db.select().from(requests).where(eq(requests.id, requestId));
  if (!req || req.status !== "approved") return { error: "This cause is no longer taking offers." };

  await db
    .insert(responses)
    .values({ requestId, userId: user.id, note: strOrNull(fd, "note") })
    .onConflictDoUpdate({
      target: [responses.requestId, responses.userId],
      set: { note: strOrNull(fd, "note"), status: "offered" },
    });
  revalidatePath(`/causes/${requestId}`);
  return { ok: "sent" };
}

export async function withdrawOffer(requestId: number) {
  const user = await requireUser();
  await db.delete(responses).where(and(eq(responses.requestId, requestId), eq(responses.userId, user.id)));
  revalidatePath(`/causes/${requestId}`);
  revalidatePath("/me");
}

export async function pray(requestId: number, _: FormState, fd: FormData): Promise<FormState> {
  const user = await currentUser();
  const jar = await cookies();
  const key = `prayed_${requestId}`;
  if (jar.get(key)) return { ok: "already" };
  await db.insert(prayers).values({
    requestId,
    userId: user?.id ?? null,
    name: user?.name.split(" ")[0] ?? (str(fd, "name") || null),
    message: strOrNull(fd, "message"),
  });
  jar.set(key, "1", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath(`/causes/${requestId}`);
  return { ok: "prayed" };
}

export async function updateMySkills(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser("supporter");
  await db
    .update(users)
    .set({
      skills: list(fd, "skills").filter(isSkill),
      otherSkill: strOrNull(fd, "otherSkill"),
      area: strOrNull(fd, "area"),
      phone: strOrNull(fd, "phone"),
    })
    .where(eq(users.id, user.id));
  revalidatePath("/", "layout");
  return { ok: "Saved. Your matches have been updated." };
}
