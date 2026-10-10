import { and, eq } from "drizzle-orm";
import { db, orgs, requests, responses, users } from "@/db";
import { currentUser } from "@/lib/auth";
import { icsFile, inviteDetails } from "@/lib/calendar";

// Calendar invite for a volunteer the organisation has accepted. It carries the private notes, so it's gated.
export async function GET(_: Request, { params }: RouteContext<"/causes/[id]/calendar">) {
  const id = Number((await params).id);
  const user = await currentUser();
  if (!user || !Number.isInteger(id)) return new Response("Not found", { status: 404 });

  const [row] = await db
    .select({ request: requests, org: orgs, contact: { name: users.name, email: users.email, phone: users.phone } })
    .from(responses)
    .innerJoin(requests, eq(requests.id, responses.requestId))
    .innerJoin(orgs, eq(orgs.id, requests.orgId))
    .innerJoin(users, eq(users.id, orgs.ownerId))
    .where(and(eq(responses.requestId, id), eq(responses.userId, user.id), eq(responses.status, "accepted")));
  if (!row) return new Response("Not found", { status: 404 });

  const { request: r, org, contact } = row;
  return new Response(icsFile(r, inviteDetails(r, org, contact)), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="fiat-${r.id}.ics"`,
    },
  });
}
