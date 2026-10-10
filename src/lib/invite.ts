import "server-only";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db, users } from "@/db";

// The supporter whose share link brought this visitor (set by proxy.ts), if any.
export async function inviterFrom(ref: unknown) {
  if (typeof ref !== "string" || !/^\d{1,9}$/.test(ref)) return null;
  const [u] = await db.select({ id: users.id, name: users.name, role: users.role }).from(users).where(eq(users.id, Number(ref)));
  return u?.role === "supporter" ? { id: u.id, firstName: u.name.split(" ")[0] } : null;
}

export async function currentInviter() {
  return inviterFrom((await cookies()).get("fiat_ref")?.value);
}
