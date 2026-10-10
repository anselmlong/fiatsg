import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { setResponseStatus } from "@/app/actions/org";
import { Container, Notice, SkillChip, StatusBadge } from "@/components/ui";
import { db, requests } from "@/db";
import { requireOrg } from "@/lib/auth";
import { fmtSchedule, timeAgo } from "@/lib/format";
import { getUpdates, respondents } from "@/lib/queries";
import { CompleteForm, UpdateForm } from "./forms";
import { Mail, Phone } from "lucide-react";

export default async function OrgRequestPage({ params, searchParams }: PageProps<"/org/requests/[id]">) {
  const org = await requireOrg();
  const id = Number((await params).id);
  const sp = await searchParams;
  const [req] = await db.select().from(requests).where(and(eq(requests.id, id), eq(requests.orgId, org.id)));
  if (!req) notFound();
  const [people, updateList] = await Promise.all([respondents(id), getUpdates(id)]);
  const { when, time } = fmtSchedule(req);
  const accepted = people.filter((p) => p.response.status === "accepted").length;
  const order = { offered: 0, accepted: 1, declined: 2 } as const;
  people.sort((a, b) => order[a.response.status] - order[b.response.status]);

  return (
    <Container className="py-10">
      <Link href="/org" className="font-bold">← Our requests</Link>
      {sp.submitted && (
        <div className="mt-6">
          <Notice tone="ok"><strong>Sent to the Catholic Foundation for review.</strong> Once approved, it will appear for volunteers to see.</Notice>
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <StatusBadge status={req.status} />
          <h1 className="mt-3 text-4xl font-bold">{req.title}</h1>
          <p className="mt-2 text-lg text-muted">{when} · {time} · {req.area}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/causes/${id}`} className="btn-ghost">View public page</Link>
          {req.status !== "completed" && <Link href={`/org/requests/${id}/edit`} className="btn-ghost">Edit</Link>}
        </div>
      </div>
      {req.status === "changes_requested" && req.reviewComment && (
        <div className="mt-6"><Notice tone="warn"><strong>The Catholic Foundation asked for changes:</strong> “{req.reviewComment}” <Link href={`/org/requests/${id}/edit`} className="font-bold">Edit and resubmit →</Link></Notice></div>
      )}
      {req.status === "rejected" && req.reviewComment && (
        <div className="mt-6"><Notice tone="bad"><strong>Not approved:</strong> “{req.reviewComment}”</Notice></div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <section>
          <h2 className="text-3xl font-bold">People who offered to help</h2>
          <p className="mt-1 text-muted">{accepted} of {req.volunteersNeeded} confirmed. Contact each person, then let them know here.</p>
          {people.length === 0 ? (
            <div className="card mt-6 p-8 text-center text-muted">
              {req.status === "approved" ? "No one has offered yet. Share your request with your parish!" : "Volunteers can respond once your request is live."}
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {people.map(({ response, user }) => (
                <li key={response.id} className={`card p-5 ${response.status === "declined" ? "opacity-60" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold text-purple-deep">{user.name}</p>
                      <p className="text-sm text-muted">Offered {timeAgo(response.createdAt)}{user.area ? ` · Lives near ${user.area}` : ""}</p>
                    </div>
                    <StatusBadge status={response.status} label={response.status === "offered" ? "New" : undefined} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-lg">
                    <a href={`mailto:${user.email}`} className="inline-flex items-center gap-2 font-bold"><Mail aria-hidden className="h-5 w-5" /> {user.email}</a>
                    {user.phone && <a href={`tel:${user.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 font-bold"><Phone aria-hidden className="h-5 w-5" /> {user.phone}</a>}
                  </div>
                  {(user.skills.length > 0 || user.otherSkill) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[...user.skills].sort((a, b) => Number(req.skills.includes(b)) - Number(req.skills.includes(a))).map((s) => (
                        <SkillChip key={s} id={s} highlight={req.skills.includes(s)} />
                      ))}
                      {user.otherSkill && <span className="chip">{user.otherSkill}</span>}
                    </div>
                  )}
                  {response.note && <p className="mt-3 rounded-2xl bg-cream p-4 font-serif text-lg italic">“{response.note}”</p>}
                  {req.status !== "completed" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {response.status !== "accepted" && (
                        <form action={setResponseStatus.bind(null, response.id, id, "accepted")}>
                          <button className="btn-primary">✓ Accept</button>
                        </form>
                      )}
                      {response.status !== "declined" && (
                        <form action={setResponseStatus.bind(null, response.id, id, "declined")}>
                          <button className="btn-ghost">Not this time</button>
                        </form>
                      )}
                      {response.status !== "offered" && (
                        <form action={setResponseStatus.bind(null, response.id, id, "offered")}>
                          <button className="btn-ghost">Undo</button>
                        </form>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          {(req.status === "approved" || req.status === "completed") && (
            <div className="card p-6">
              <h2 className="text-2xl font-bold">Share an update</h2>
              <p className="mt-1 text-sm text-muted">Everyone who offered or prayed will see it on their “My impact” page.</p>
              <div className="mt-4"><UpdateForm requestId={id} /></div>
            </div>
          )}
          {req.status === "approved" && (
            <div className="card p-6">
              <h2 className="text-2xl font-bold">Finished?</h2>
              <p className="mt-1 text-sm text-muted">Mark it completed and tell your volunteers what they achieved.</p>
              <div className="mt-4"><CompleteForm requestId={id} /></div>
            </div>
          )}
          {req.status === "completed" && (
            <div className="card p-6">
              <h2 className="text-2xl font-bold">Completed</h2>
              <p className="mt-2">{req.outcomeSummary}</p>
              <p className="mt-2 text-muted">{req.outcomeHours ?? 0} hours · {req.outcomePeopleServed ?? 0} people served</p>
            </div>
          )}
          {updateList.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold">Past updates</h2>
              <ul className="mt-3 space-y-3">
                {updateList.map((u) => <li key={u.id} className="border-t border-line pt-3"><p className="text-sm text-muted">{timeAgo(u.createdAt)}</p><p>{u.body}</p></li>)}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </Container>
  );
}
