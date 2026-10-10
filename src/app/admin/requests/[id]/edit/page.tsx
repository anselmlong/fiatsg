import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { adminDeleteRequest, adminEditRequest } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/confirm-button";
import { RequestForm } from "@/components/request-form";
import { Container, StatusBadge } from "@/components/ui";
import { db, orgs, requests } from "@/db";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Edit request" };

export default async function AdminEditRequestPage({ params }: PageProps<"/admin/requests/[id]/edit">) {
  await requireUser("cf_admin", "/admin/requests");
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [row] = await db
    .select({ request: requests, orgName: orgs.name })
    .from(requests)
    .innerJoin(orgs, eq(orgs.id, requests.orgId))
    .where(eq(requests.id, id));
  if (!row) notFound();
  const r = row.request;

  return (
    <Container className="max-w-2xl py-10">
      <Link href="/admin/requests" className="font-bold">← All requests</Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-bold">Edit request</h1>
        <StatusBadge status={r.status} label={r.status === "approved" ? "Live" : undefined} />
      </div>
      <p className="mt-2 text-lg text-muted">
        For <strong className="text-ink">{row.orgName.split(" — ")[0]}</strong>. Your changes save straight away and keep its status.
      </p>
      <div className="card mt-8 p-6 sm:p-8">
        <RequestForm action={adminEditRequest.bind(null, id)} initial={r} submitLabel="Save changes" />
      </div>

      <section className="mt-10 rounded-3xl border-2 border-bad/30 p-6">
        <h2 className="text-2xl font-bold">Delete this request</h2>
        <p className="mt-1 text-muted">It disappears for everyone, along with volunteers' offers, prayers and updates for it.</p>
        <form action={adminDeleteRequest.bind(null, id)} className="mt-4">
          <ConfirmButton message={`Delete “${r.title}”? This can't be undone.`}>Delete request</ConfirmButton>
        </form>
      </section>
    </Container>
  );
}
