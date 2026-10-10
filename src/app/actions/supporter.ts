"use server";

import { and, eq, isNotNull, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db, prayers, requests, responses, saintMeetings, users } from "@/db";
import { currentUser, requireUser } from "@/lib/auth";
import { type FormState, list, str, strOrNull } from "@/lib/forms";
import { checkInToken, meetForCause, meetForTask } from "@/lib/meet";
import { sendOffer } from "@/lib/offers";
import { faithTask } from "@/lib/saints";
import { isSkill } from "@/lib/skills";

export async function offerHelp(requestId: number, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(undefined, `/causes/${requestId}`);
  if (user.role !== "supporter") return { error: "Only supporter accounts can offer to help." };
  if (!(await sendOffer(user.id, requestId, strOrNull(fd, "note")))) return { error: "This cause is no longer taking offers." };
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
  if (user?.role === "supporter") await meetForTask(user.id, "pray");
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

// Faith tasks with no one to verify them: the supporter's word is enough.
export async function doFaithTask(taskId: string) {
  const user = await requireUser("supporter", "/faith");
  const task = faithTask(taskId);
  if (!task || task.kind !== "honour") return;
  await meetForTask(user.id, task.id);
  revalidatePath("/faith");
  revalidatePath("/me");
}

// Scanning the QR code at the venue. Fiat trusts the code as proof of being there.
export async function checkIn(requestId: number, token: string): Promise<FormState> {
  const user = await requireUser("supporter", `/causes/${requestId}/check-in?k=${token}`);
  if (token !== checkInToken(requestId)) return { error: "This check-in code isn't right. Please scan the code at the venue again." };
  const [req] = await db.select().from(requests).where(eq(requests.id, requestId));
  const [mine] = await db.select().from(responses).where(and(eq(responses.requestId, requestId), eq(responses.userId, user.id)));
  if (!req || !mine) return { error: "You haven't offered to help with this cause yet." };
  if (mine.status !== "accepted") return { error: "The organisation hasn't confirmed you for this cause yet." };

  if (!mine.checkedInAt) await db.update(responses).set({ checkedInAt: new Date() }).where(eq(responses.id, mine.id));
  await meetForCause(user.id, req);

  // Serving alongside someone you invited, or who invited you, means you both meet St Pier Giorgio Frassati.
  const others = await db
    .select({ id: users.id, invitedBy: users.invitedBy })
    .from(responses)
    .innerJoin(users, eq(users.id, responses.userId))
    .where(and(eq(responses.requestId, requestId), ne(responses.userId, user.id), isNotNull(responses.checkedInAt)));
  for (const friend of others.filter((o) => o.invitedBy === user.id || o.id === user.invitedBy)) {
    await meetForTask(user.id, "with_friend");
    await meetForTask(friend.id, "with_friend");
  }

  revalidatePath("/", "layout");
  return { ok: "checked-in" };
}

export async function markSaintSeen(meetingId: number) {
  const user = await currentUser();
  if (!user) return;
  await db
    .update(saintMeetings)
    .set({ seenAt: new Date() })
    .where(and(eq(saintMeetings.id, meetingId), eq(saintMeetings.userId, user.id)));
  revalidatePath("/me");
}
