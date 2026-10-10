import "server-only";
import { eq } from "drizzle-orm";
import { db, requests, responses } from "@/db";
import { meetForTask } from "@/lib/meet";

// Records a supporter's yes to a cause. Returns false when the cause isn't taking offers.
// An existing response is left alone, so logging in again never undoes an acceptance.
export async function sendOffer(userId: number, requestId: number, note: string | null = null) {
  const [req] = await db.select({ status: requests.status }).from(requests).where(eq(requests.id, requestId));
  if (req?.status !== "approved") return false;
  await db.insert(responses).values({ requestId, userId, note }).onConflictDoNothing();
  await meetForTask(userId, "offer");
  return true;
}
