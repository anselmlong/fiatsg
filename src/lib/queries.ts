import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db, orgs, prayers, requests, responses, updates, users } from "@/db";

const prayerCount = sql<number>`(select count(*)::int from ${prayers} where ${prayers.requestId} = ${requests.id})`;
const acceptedCount = sql<number>`(select count(*)::int from ${responses} where ${responses.requestId} = ${requests.id} and ${responses.status} = 'accepted')`;
const offeredCount = sql<number>`(select count(*)::int from ${responses} where ${responses.requestId} = ${requests.id} and ${responses.status} <> 'declined')`;

const causeFields = {
  request: requests,
  org: { id: orgs.id, name: orgs.name, isDemo: orgs.isDemo },
  prayerCount,
  acceptedCount,
  offeredCount,
};

export type CauseRow = Awaited<ReturnType<typeof listCauses>>[number];

export async function listCauses(statuses: ("approved" | "completed")[] = ["approved"]) {
  return db
    .select(causeFields)
    .from(requests)
    .innerJoin(orgs, eq(orgs.id, requests.orgId))
    .where(and(inArray(requests.status, statuses), eq(orgs.status, "approved")))
    .orderBy(requests.startDate);
}

export async function getCause(id: number) {
  const [row] = await db
    .select({ ...causeFields, org: orgs })
    .from(requests)
    .innerJoin(orgs, eq(orgs.id, requests.orgId))
    .where(eq(requests.id, id));
  return row ?? null;
}

export async function getUpdates(requestId: number) {
  return db.select().from(updates).where(eq(updates.requestId, requestId)).orderBy(desc(updates.createdAt));
}

export async function getRecentPrayers(requestId: number) {
  return db
    .select({ name: prayers.name, message: prayers.message, createdAt: prayers.createdAt })
    .from(prayers)
    .where(and(eq(prayers.requestId, requestId), sql`${prayers.message} is not null and ${prayers.message} <> ''`))
    .orderBy(desc(prayers.createdAt))
    .limit(6);
}

export async function orgRequests(orgId: number) {
  return db
    .select({ request: requests, prayerCount, acceptedCount, offeredCount })
    .from(requests)
    .where(eq(requests.orgId, orgId))
    .orderBy(desc(requests.createdAt));
}

export async function respondents(requestId: number) {
  return db
    .select({
      response: responses,
      user: { id: users.id, name: users.name, email: users.email, phone: users.phone, skills: users.skills, otherSkill: users.otherSkill, area: users.area },
    })
    .from(responses)
    .innerJoin(users, eq(users.id, responses.userId))
    .where(eq(responses.requestId, requestId))
    .orderBy(responses.createdAt);
}

export async function siteStats() {
  const [row] = await db.execute<{ volunteers: number; hours: number; served: number; prayers: number; causes: number }>(sql`
    select
      (select count(*)::int from ${responses} where ${responses.status} = 'accepted') as volunteers,
      (select coalesce(sum(${requests.outcomeHours}), 0)::int from ${requests}) as hours,
      (select coalesce(sum(${requests.outcomePeopleServed}), 0)::int from ${requests}) as served,
      (select count(*)::int from ${prayers}) as prayers,
      (select count(*)::int from ${requests} where ${requests.status} = 'approved') as causes
  `).then((r) => r.rows);
  return row;
}
