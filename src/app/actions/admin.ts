"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, orgs, requests } from "@/db";
import { requireUser } from "@/lib/auth";
import { type FormState, str } from "@/lib/forms";
import { readRequest } from "@/lib/request-input";

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

// The Catholic Foundation can post, edit and remove any request. As the reviewer,
// what it posts goes live at once, and its edits keep the request's current status.
export async function adminCreateRequest(orgId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireUser("cf_admin");
  const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId));
  if (!org) return { error: "That organisation no longer exists." };
  const { values, error } = readRequest(fd);
  if (error) return { error };
  const [req] = await db.insert(requests).values({ ...values, orgId, status: "approved" }).returning();
  revalidatePath("/", "layout");
  redirect(`/admin/requests?saved=${req.id}`);
}

export async function adminEditRequest(requestId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireUser("cf_admin");
  const [req] = await db.select().from(requests).where(eq(requests.id, requestId));
  if (!req) return { error: "This request no longer exists." };
  const { values, error } = readRequest(fd);
  if (error) return { error };
  await db.update(requests).set({ ...values, tier: req.tier }).where(eq(requests.id, requestId));
  revalidatePath("/", "layout");
  redirect(`/admin/requests?saved=${requestId}`);
}

export async function adminDeleteRequest(requestId: number) {
  await requireUser("cf_admin");
  await db.delete(requests).where(eq(requests.id, requestId));
  revalidatePath("/", "layout");
  redirect("/admin/requests?deleted=1");
}
