import "server-only";
import { createHmac } from "node:crypto";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db, saintMeetings, type Request } from "@/db";
import { causePool, faithTask, type FaithTaskId } from "./saints";

// Records that a supporter met a saint. Each saint is met once; returns false if already met.
export async function meetSaint(userId: number, saintId: string, from: { taskId?: string; requestId?: number } = {}) {
  const rows = await db
    .insert(saintMeetings)
    .values({ userId, saintId, taskId: from.taskId ?? null, requestId: from.requestId ?? null })
    .onConflictDoNothing()
    .returning({ id: saintMeetings.id });
  return rows.length > 0;
}

export async function meetForTask(userId: number, taskId: FaithTaskId) {
  const task = faithTask(taskId)!;
  return meetSaint(userId, task.saintId, { taskId });
}

// A cause brings the next saint this supporter hasn't met in the cause's (category, tier) pool.
// Categories without saints yet bring no one.
export async function meetForCause(userId: number, request: Pick<Request, "id" | "category" | "tier">) {
  if (!request.category) return null;
  const met = new Set(await metSaintIds(userId));
  const next = causePool(request.category, request.tier).find((s) => !met.has(s.id));
  if (!next) return null;
  return (await meetSaint(userId, next.id, { requestId: request.id })) ? next : null;
}

export async function metSaintIds(userId: number) {
  const rows = await db.select({ saintId: saintMeetings.saintId }).from(saintMeetings).where(eq(saintMeetings.userId, userId));
  return rows.map((r) => r.saintId);
}

export async function nextUnseen(userId: number) {
  const [row] = await db
    .select()
    .from(saintMeetings)
    .where(and(eq(saintMeetings.userId, userId), isNull(saintMeetings.seenAt)))
    .orderBy(asc(saintMeetings.createdAt))
    .limit(1);
  return row ?? null;
}

// The QR code at an event encodes this token, so only someone at the venue (who can see the code) can check in.
export const checkInToken = (requestId: number) =>
  createHmac("sha256", process.env.SESSION_SECRET ?? "").update(`check-in:${requestId}`).digest("hex").slice(0, 16);
