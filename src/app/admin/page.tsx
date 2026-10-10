import Image from "next/image";
import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { reviewOrg, reviewRequest } from "@/app/actions/admin";
import { MediaGallery } from "@/components/media-gallery";
import { Container, SkillChip, StatusBadge } from "@/components/ui";
import { db, orgs, requests, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { fmtSchedule, timeAgo } from "@/lib/format";
import { ageLabel } from "@/lib/skills";

export const metadata = { title: "Review queue" };

function Decision({ action }: { action: (fd: FormData) => Promise<void> }) {
  return (
    <form action={action} className="mt-5 space-y-3 border-t border-line pt-5">
      <label className="field">
        <span className="label">Note to the organisation</span>
        <textarea name="comment" rows={2} className="input" placeholder="Required if you ask for changes or decline." />
      </label>
      <div className="flex flex-wrap gap-2">
        <button name="decision" value="approved" className="btn-primary">✓ Approve</button>
        <button name="decision" value="changes_requested" className="btn-ghost">Ask for changes</button>
        <button name="decision" value="rejected" className="btn-danger">Decline</button>
      </div>
    </form>
  );
}

export default async function AdminPage() {
  await requireUser("cf_admin", "/admin");
  const [orgQueue, reqQueue, recentOrgs] = await Promise.all([
    db
      .select({ org: orgs, contact: { name: users.name, email: users.email, phone: users.phone } })
      .from(orgs)
      .innerJoin(users, eq(users.id, orgs.ownerId))
      .where(inArray(orgs.status, ["pending", "changes_requested"]))
      .orderBy(orgs.createdAt),
    db
      .select({ request: requests, orgName: orgs.name })
      .from(requests)
      .innerJoin(orgs, eq(orgs.id, requests.orgId))
      .where(inArray(requests.status, ["pending_review", "changes_requested"]))
      .orderBy(requests.createdAt),
    db.select().from(orgs).where(inArray(orgs.status, ["approved", "rejected"])).orderBy(desc(orgs.createdAt)),
  ]);
  const waiting = orgQueue.filter((o) => o.org.status === "pending").length + reqQueue.filter((r) => r.request.status === "pending_review").length;

  return (
    <Container className="py-10">
      <h1 className="text-4xl font-bold">Review queue</h1>
      <p className="mt-2 text-lg text-muted">
        {waiting ? `${waiting} ${waiting === 1 ? "item needs" : "items need"} your review.` : "All caught up. Thank you."} Nothing goes public until you approve it.
      </p>

      <section className="mt-10">
        <h2 className="text-3xl font-bold">Organisations ({orgQueue.length})</h2>
        {orgQueue.length === 0 && <p className="mt-3 text-muted">No organisations waiting.</p>}
        <div className="mt-6 space-y-6">
          {orgQueue.map(({ org, contact }) => (
            <article key={org.id} className="card overflow-hidden">
              <div className="grid sm:grid-cols-[220px_1fr]">
                <div className="relative min-h-40 bg-purple-soft">
                  {org.coverUrl && <Image src={org.coverUrl} alt="" fill sizes="220px" className="object-cover" />}
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={org.status} label={org.status === "changes_requested" ? "Waiting for their changes" : "New — needs review"} />
                    <span className="text-sm text-muted">Registered {timeAgo(org.createdAt)}</span>
                  </div>
                  <h3 className="mt-2 text-2xl">{org.name}</h3>
                  {org.tagline && <p className="font-serif italic">{org.tagline}</p>}
                  <p className="mt-3">{org.history}</p>
                  {org.whyItMatters && <p className="mt-2 text-muted"><strong>Why it matters:</strong> {org.whyItMatters}</p>}
                  <p className="mt-3 text-sm">
                    <strong>Contact:</strong> {contact.name} · <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    {contact.phone && <> · {contact.phone}</>}
                    {org.website && <> · <a href={org.website} target="_blank" rel="noreferrer">{org.website.replace(/^https?:\/\//, "")}</a></>}
                  </p>
                  {org.reviewComment && <p className="mt-2 text-sm text-warn"><strong>Your last note:</strong> “{org.reviewComment}”</p>}
                  <Decision action={reviewOrg.bind(null, org.id)} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-3xl font-bold">Volunteer requests ({reqQueue.length})</h2>
        {reqQueue.length === 0 && <p className="mt-3 text-muted">No requests waiting.</p>}
        <div className="mt-6 space-y-6">
          {reqQueue.map(({ request: r, orgName }) => {
            const { when, time } = fmtSchedule(r);
            return (
              <article key={r.id} className="card overflow-hidden">
                <div className="grid sm:grid-cols-[220px_1fr]">
                  <div className="relative min-h-40 bg-purple-soft">
                    {r.coverUrl && <Image src={r.coverUrl} alt="" fill sizes="220px" className="object-cover" />}
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={r.status} label={r.status === "changes_requested" ? "Waiting for their changes" : "New — needs review"} />
                      <span className="chip">{r.kind === "regular" ? "Regular" : "One-off"}</span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-muted">{orgName.split(" — ")[0]}</p>
                    <h3 className="text-2xl">{r.title}</h3>
                    <p className="mt-1 font-bold">{r.summary}</p>
                    <details className="mt-2">
                      <summary className="cursor-pointer font-bold text-purple">Read the full story</summary>
                      <div className="mt-2 space-y-2">{r.story.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}</div>
                    </details>
                    {r.media.length > 0 && (
                      <details className="mt-2" open>
                        <summary className="cursor-pointer font-bold text-purple">Photos and videos ({r.media.length})</summary>
                        <div className="mt-3"><MediaGallery items={r.media} sizes="320px" /></div>
                      </details>
                    )}
                    <p className="mt-3 text-sm text-muted">
                      {when} · {time} · {r.address ?? r.area} · {r.volunteersNeeded} volunteers · {ageLabel(r.ageGroup)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">{r.skills.map((s) => <SkillChip key={s} id={s} />)}</div>
                    <Link href={`/causes/${r.id}`} className="mt-3 inline-block text-sm font-bold">Preview public page →</Link>
                    <Decision action={reviewRequest.bind(null, r.id)} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">Reviewed organisations</h2>
        <ul className="mt-4 divide-y divide-line rounded-3xl border border-line bg-paper">
          {recentOrgs.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
              <Link href={`/orgs/${o.id}`} className="font-bold">{o.name.split(" — ")[0]}</Link>
              <StatusBadge status={o.status} label={o.status === "approved" ? "Approved" : undefined} />
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
