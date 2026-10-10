import Image from "next/image";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import { adminDeleteRequest } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/confirm-button";
import { Container, Notice, StatusBadge } from "@/components/ui";
import { db, orgs, requests } from "@/db";
import { requireUser } from "@/lib/auth";
import { fmtSchedule } from "@/lib/format";
import { categoryLabel } from "@/lib/saints";

export const metadata = { title: "All requests" };

const FILTERS = [
  { id: "all", label: "All" },
  { id: "approved", label: "Live" },
  { id: "pending_review", label: "Waiting for review" },
  { id: "changes_requested", label: "Changes asked" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Declined" },
] as const;

export default async function AdminRequestsPage({ searchParams }: PageProps<"/admin/requests">) {
  await requireUser("cf_admin", "/admin/requests");
  const sp = await searchParams;
  const filter = FILTERS.some((f) => f.id === sp.status) ? String(sp.status) : "all";
  const all = await db
    .select({ request: requests, orgName: orgs.name })
    .from(requests)
    .innerJoin(orgs, eq(orgs.id, requests.orgId))
    .orderBy(desc(requests.createdAt));
  const shown = filter === "all" ? all : all.filter((r) => r.request.status === filter);
  const saved = sp.saved ? all.find((r) => String(r.request.id) === sp.saved) : null;

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">All requests</h1>
          <p className="mt-2 text-lg text-muted">Every request from every organisation. You can post, edit or remove any of them.</p>
        </div>
        <Link href="/admin/requests/new" className="btn-primary"><Plus aria-hidden className="h-5 w-5" /> New request</Link>
      </div>

      {saved && <div className="mt-6"><Notice tone="ok"><strong>Saved.</strong> “{saved.request.title}” is up to date. <Link href={`/causes/${saved.request.id}`} className="font-bold">View it →</Link></Notice></div>}
      {sp.deleted && <div className="mt-6"><Notice tone="ok">The request was deleted.</Notice></div>}

      <nav aria-label="Filter by status" className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const n = f.id === "all" ? all.length : all.filter((r) => r.request.status === f.id).length;
          const on = f.id === filter;
          return (
            <Link key={f.id} href={f.id === "all" ? "/admin/requests" : `/admin/requests?status=${f.id}`} aria-current={on ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-bold no-underline ${on ? "bg-purple text-white" : "bg-purple-soft text-purple-deep hover:bg-purple/15"}`}>
              {f.label} <span className="tabular-nums opacity-75">{n}</span>
            </Link>
          );
        })}
      </nav>

      {shown.length === 0 ? (
        <p className="mt-8 text-muted">No requests here.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {shown.map(({ request: r, orgName }) => {
            const { when, time } = fmtSchedule(r);
            return (
              <li key={r.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded-2xl bg-purple-soft sm:block">
                  {r.coverUrl && <Image src={r.coverUrl} alt="" fill sizes="112px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={r.status} label={r.status === "approved" ? "Live" : undefined} />
                    {r.category && <span className="chip">{categoryLabel(r.category)}</span>}
                  </div>
                  <p className="mt-1.5 text-lg font-bold text-purple-deep">{r.title}</p>
                  <p className="text-sm text-muted">{orgName.split(" — ")[0]} · {when} · {time}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Link href={`/causes/${r.id}`} className="btn-ghost !min-h-10 !px-4 !py-2">View</Link>
                  <Link href={`/admin/requests/${r.id}/edit`} className="btn-primary !min-h-10 !px-4 !py-2">Edit</Link>
                  <form action={adminDeleteRequest.bind(null, r.id)}>
                    <ConfirmButton message={`Delete “${r.title}”? Volunteers' offers, prayers and updates for it will be removed too. This can't be undone.`} className="btn-danger !min-h-10 !px-4 !py-2">Delete</ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
