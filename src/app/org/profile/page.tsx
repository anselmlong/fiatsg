import Link from "next/link";
import { Container, Notice, StatusBadge } from "@/components/ui";
import { requireOrg } from "@/lib/auth";
import { ProfileForm } from "./form";

export const metadata = { title: "Our profile" };

export default async function OrgProfilePage() {
  const org = await requireOrg();
  return (
    <Container className="max-w-2xl py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-bold">Our profile</h1>
        <StatusBadge status={org.status} label={org.status === "approved" ? "✓ Approved by CF" : undefined} />
      </div>
      {org.status === "changes_requested" && org.reviewComment && (
        <div className="mt-6"><Notice tone="warn"><strong>The Catholic Foundation asked:</strong> “{org.reviewComment}”</Notice></div>
      )}
      {org.status === "approved" && <p className="mt-2 text-muted">This is what volunteers see. <Link href={`/orgs/${org.id}`}>View public page →</Link></p>}
      <div className="card mt-8 p-6 sm:p-8">
        <ProfileForm org={org} />
      </div>
    </Container>
  );
}
