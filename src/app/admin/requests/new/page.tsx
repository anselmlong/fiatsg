import Link from "next/link";
import { eq } from "drizzle-orm";
import { adminCreateRequest } from "@/app/actions/admin";
import { RequestForm } from "@/components/request-form";
import { Container } from "@/components/ui";
import { db, orgs } from "@/db";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "New request" };

// The Catholic Foundation posts on an organisation's behalf: first choose whose request it is.
export default async function AdminNewRequestPage({ searchParams }: PageProps<"/admin/requests/new">) {
  await requireUser("cf_admin", "/admin/requests/new");
  const orgId = Number((await searchParams).org);
  const approved = await db.select().from(orgs).where(eq(orgs.status, "approved")).orderBy(orgs.name);
  const org = approved.find((o) => o.id === orgId);

  return (
    <Container className="max-w-2xl py-10">
      <Link href="/admin/requests" className="font-bold">← All requests</Link>
      <h1 className="mt-4 text-4xl font-bold">New request</h1>
      {!org ? (
        <>
          <p className="mt-2 text-lg text-muted">Which organisation is this request for?</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {approved.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/requests/new?org=${o.id}`} className="card block p-5 font-bold text-purple-deep no-underline hover:border-purple">
                  {o.name.split(" — ")[0]}
                  {o.tagline && <span className="mt-1 block text-sm font-normal text-muted">{o.tagline}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="mt-2 text-lg text-muted">
            For <strong className="text-ink">{org.name.split(" — ")[0]}</strong>. It goes live as soon as you publish. <Link href="/admin/requests/new" className="font-bold">Change</Link>
          </p>
          <div className="card mt-8 p-6 sm:p-8">
            <RequestForm action={adminCreateRequest.bind(null, org.id)} submitLabel="Publish" />
          </div>
        </>
      )}
    </Container>
  );
}
