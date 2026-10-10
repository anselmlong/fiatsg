import Link from "next/link";
import { Container, Notice, StatusBadge } from "@/components/ui";
import { requireOrg } from "@/lib/auth";
import { fmtSchedule } from "@/lib/format";
import { orgRequests } from "@/lib/queries";
import { Megaphone } from "lucide-react";

export const metadata = { title: "Our requests" };

export default async function OrgDashboard({ searchParams }: PageProps<"/org">) {
  const org = await requireOrg();
  const sp = await searchParams;
  const rows = await orgRequests(org.id);
  const newOffers = rows.reduce((a, r) => a + r.offeredCount - r.acceptedCount, 0);

  return (
    <Container className="py-10">
      {sp.joined && (
        <div className="mb-6">
          <Notice tone="ok"><strong>Thank you for registering!</strong> The Catholic Foundation will review your organisation soon.</Notice>
        </div>
      )}
      {org.status !== "approved" && (
        <div className="mb-8">
          <Notice tone={org.status === "rejected" ? "bad" : "warn"}>
            <p className="text-lg font-bold">
              {org.status === "pending" && "Your organisation is waiting for review by the Catholic Foundation."}
              {org.status === "changes_requested" && "The Catholic Foundation has asked for some changes."}
              {org.status === "rejected" && "Your organisation was not approved."}
            </p>
            {org.reviewComment && <p className="mt-2">“{org.reviewComment}”</p>}
            <p className="mt-2">
              {org.status === "pending" ? "You can keep editing your profile in the meantime. " : ""}
              <Link href="/org/profile" className="font-bold">{org.status === "changes_requested" ? "Update and resubmit →" : "Edit our profile →"}</Link>
            </p>
          </Notice>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Our requests</h1>
          <p className="mt-1 text-lg text-muted">{org.name.split(" — ")[0]}</p>
          {newOffers > 0 && <p className="mt-2 text-lg font-bold text-purple">{newOffers} {newOffers === 1 ? "person is" : "people are"} waiting to hear from you</p>}
        </div>
        {org.status === "approved" && <Link href="/org/requests/new" className="btn-primary text-lg">+ Ask for volunteers</Link>}
      </div>

      {rows.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <Megaphone aria-hidden className="mx-auto h-12 w-12 text-gold" strokeWidth={1.5} />
          <p className="mt-3 text-lg">You haven't asked for help yet.</p>
          {org.status === "approved" && <Link href="/org/requests/new" className="btn-primary mt-5">Create your first request</Link>}
        </div>
      ) : (
        <ul className="mt-8 grid gap-4">
          {rows.map(({ request: r, offeredCount, acceptedCount, prayerCount }) => {
            const { when } = fmtSchedule(r);
            const waiting = offeredCount - acceptedCount;
            return (
              <li key={r.id}>
                <Link href={`/org/requests/${r.id}`} className="card flex flex-col gap-3 p-5 no-underline hover:shadow-md sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={r.status} />
                      <span className="chip">{r.kind === "regular" ? "Regular" : "One-off"}</span>
                    </div>
                    <p className="mt-2 text-xl font-bold text-purple-deep">{r.title}</p>
                    <p className="text-sm text-muted">{when}</p>
                    {r.status === "changes_requested" && r.reviewComment && <p className="mt-1 text-sm font-bold text-warn">CF: “{r.reviewComment}”</p>}
                  </div>
                  <div className="flex gap-6 text-center">
                    <div><p className="font-serif text-3xl font-bold text-purple">{acceptedCount}/{r.volunteersNeeded}</p><p className="text-sm text-muted">confirmed</p></div>
                    <div><p className={`font-serif text-3xl tabular-nums font-bold ${waiting ? "text-gold-ink" : "text-purple"}`}>{waiting}</p><p className="text-sm text-muted">new offers</p></div>
                    <div><p className="font-serif text-3xl font-bold text-purple">{prayerCount}</p><p className="text-sm text-muted">praying</p></div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
