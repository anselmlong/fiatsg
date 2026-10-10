"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, orgs, requests, responses, updates, type ResponseStatus } from "@/db";
import { requireOrg } from "@/lib/auth";
import { type FormState, int, list, str, strOrNull } from "@/lib/forms";
import { parseMedia } from "@/lib/media";
import { AREAS, isSkill, WEEKDAYS } from "@/lib/skills";

async function ownedRequest(requestId: number) {
  const org = await requireOrg();
  const [req] = await db.select().from(requests).where(and(eq(requests.id, requestId), eq(requests.orgId, org.id)));
  if (!req) throw new Error("Not found");
  return { org, req };
}

function readRequest(fd: FormData) {
  const kind = str(fd, "kind") === "regular" ? "regular" : "one_off";
  const remote = str(fd, "area") === "Online";
  const values = {
    title: str(fd, "title"),
    summary: str(fd, "summary"),
    story: str(fd, "story"),
    coverUrl: strOrNull(fd, "coverUrl"),
    media: parseMedia(str(fd, "media")),
    skills: list(fd, "skills").filter(isSkill),
    volunteersNeeded: Math.max(1, int(fd, "volunteersNeeded") ?? 1),
    kind: kind as "one_off" | "regular",
    startDate: str(fd, "startDate"),
    endDate: kind === "regular" ? strOrNull(fd, "endDate") : null,
    weekdays: kind === "regular" ? list(fd, "weekdays").filter((d) => (WEEKDAYS as readonly string[]).includes(d)) : [],
    startTime: str(fd, "startTime"),
    endTime: str(fd, "endTime"),
    area: (AREAS as readonly string[]).includes(str(fd, "area")) ? str(fd, "area") : "Central",
    address: remote ? null : strOrNull(fd, "address"),
    volunteerNotes: strOrNull(fd, "volunteerNotes"),
    ageGroup: str(fd, "ageGroup") || "all",
  };
  let error: string | undefined;
  if (!values.title) error = "Please give your request a title.";
  else if (!values.summary) error = "Please add a one-line summary.";
  else if (values.story.length < 30) error = "Please tell volunteers a little more about why this matters (a few sentences).";
  else if (!values.skills.length) error = "Please choose at least one skill you need.";
  else if (!values.startDate) error = kind === "regular" ? "Please choose a start date." : "Please choose a date.";
  else if (values.endDate && values.endDate < values.startDate) error = "The end date can't be before the start date.";
  else if (kind === "regular" && !values.weekdays.length) error = "Please choose which day(s) of the week.";
  else if (!values.startTime || !values.endTime) error = "Please set a start and end time.";
  else if (values.endTime <= values.startTime) error = "The end time needs to be after the start time.";
  return { values, error };
}

export async function createRequest(_: FormState, fd: FormData): Promise<FormState> {
  const org = await requireOrg();
  if (org.status !== "approved") return { error: "Your organisation needs to be approved by the Catholic Foundation first." };
  const { values, error } = readRequest(fd);
  if (error) return { error };
  const [req] = await db.insert(requests).values({ ...values, orgId: org.id, status: "pending_review" }).returning();
  revalidatePath("/org");
  redirect(`/org/requests/${req.id}?submitted=1`);
}

export async function editRequest(requestId: number, _: FormState, fd: FormData): Promise<FormState> {
  const { req } = await ownedRequest(requestId);
  if (req.status === "completed") return { error: "Completed requests can't be edited." };
  const { values, error } = readRequest(fd);
  if (error) return { error };
  await db.update(requests).set({ ...values, status: "pending_review" }).where(eq(requests.id, requestId));
  revalidatePath("/org");
  redirect(`/org/requests/${requestId}?submitted=1`);
}

export async function setResponseStatus(responseId: number, requestId: number, status: ResponseStatus) {
  await ownedRequest(requestId);
  await db
    .update(responses)
    .set({ status })
    .where(and(eq(responses.id, responseId), eq(responses.requestId, requestId)));
  revalidatePath(`/org/requests/${requestId}`);
}

export async function completeRequest(requestId: number, _: FormState, fd: FormData): Promise<FormState> {
  await ownedRequest(requestId);
  const summary = str(fd, "outcomeSummary");
  if (!summary) return { error: "Please share a sentence about what was achieved." };
  await db
    .update(requests)
    .set({
      status: "completed",
      completedAt: new Date(),
      outcomeHours: int(fd, "outcomeHours"),
      outcomePeopleServed: int(fd, "outcomePeopleServed"),
      outcomeSummary: summary,
    })
    .where(eq(requests.id, requestId));
  revalidatePath(`/org/requests/${requestId}`);
  return { ok: "Marked as completed. Your volunteers will see the impact." };
}

export async function postUpdate(requestId: number, _: FormState, fd: FormData): Promise<FormState> {
  await ownedRequest(requestId);
  const body = str(fd, "body");
  if (body.length < 5) return { error: "Please write a short update." };
  await db.insert(updates).values({ requestId, body, photoUrl: strOrNull(fd, "photoUrl") });
  revalidatePath(`/org/requests/${requestId}`);
  return { ok: "Update posted. Everyone who helped or prayed will see it." };
}

export async function updateOrgProfile(_: FormState, fd: FormData): Promise<FormState> {
  const org = await requireOrg();
  if (!str(fd, "name")) return { error: "Please enter your organisation's name." };
  const resubmit = org.status !== "approved";
  await db
    .update(orgs)
    .set({
      name: str(fd, "name"),
      tagline: str(fd, "tagline"),
      history: str(fd, "history"),
      whyItMatters: str(fd, "whyItMatters"),
      website: strOrNull(fd, "website"),
      contactPhone: strOrNull(fd, "contactPhone"),
      coverUrl: strOrNull(fd, "coverUrl"),
      foundedYear: int(fd, "foundedYear"),
      ...(resubmit ? { status: "pending" as const } : {}),
    })
    .where(eq(orgs.id, org.id));
  revalidatePath("/", "layout");
  return { ok: resubmit ? "Saved and sent to the Catholic Foundation for review." : "Profile saved." };
}
