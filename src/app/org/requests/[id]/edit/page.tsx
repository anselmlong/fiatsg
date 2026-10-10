import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { editRequest } from "@/app/actions/org";
import { RequestForm } from "@/components/request-form";
import { Container, Notice } from "@/components/ui";
import { db, requests } from "@/db";
import { requireOrg } from "@/lib/auth";

export default async function EditRequestPage({ params }: PageProps<"/org/requests/[id]/edit">) {
  const org = await requireOrg();
  const id = Number((await params).id);
  const [req] = await db.select().from(requests).where(and(eq(requests.id, id), eq(requests.orgId, org.id)));
  if (!req || req.status === "completed") notFound();
  return (
    <Container className="max-w-2xl py-10">
      <h1 className="text-4xl font-bold">Edit request</h1>
      {req.reviewComment && req.status === "changes_requested" && (
        <div className="mt-6"><Notice tone="warn"><strong>The Catholic Foundation asked:</strong> “{req.reviewComment}”</Notice></div>
      )}
      <p className="mt-4 text-muted">Saving will send this request back to the Catholic Foundation for review.</p>
      <div className="card mt-8 p-6 sm:p-8">
        <RequestForm action={editRequest.bind(null, id)} initial={req} submitLabel="Save and resubmit" />
      </div>
    </Container>
  );
}
