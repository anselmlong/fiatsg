"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, orgs, requests } from "@/db";
import { requireUser } from "@/lib/auth";
import { str } from "@/lib/forms";

type Decision = "approved" | "rejected" | "changes_requested";
const decisionOf = (fd: FormData): Decision => {
  const d = str(fd, "decision");
  return d === "approved" || d === "rejected" ? d : "changes_requested";
};

export async function reviewOrg(orgId: number, fd: FormData) {
  await requireUser("cf_admin");
  const decision = decisionOf(fd);
  await db
    .update(orgs)
    .set({ status: decision === "approved" ? "approved" : decision, reviewComment: str(fd, "comment") || null })
    .where(eq(orgs.id, orgId));
  revalidatePath("/", "layout");
}

export async function reviewRequest(requestId: number, fd: FormData) {
  await requireUser("cf_admin");
  await db
    .update(requests)
    .set({ status: decisionOf(fd), reviewComment: str(fd, "comment") || null })
    .where(eq(requests.id, requestId));
  revalidatePath("/", "layout");
}
