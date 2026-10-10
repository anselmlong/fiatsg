import { redirect } from "next/navigation";
import { createRequest } from "@/app/actions/org";
import { RequestForm } from "@/components/request-form";
import { Container } from "@/components/ui";
import { requireOrg } from "@/lib/auth";

export const metadata = { title: "Ask for volunteers" };

export default async function NewRequestPage() {
  const org = await requireOrg();
  if (org.status !== "approved") redirect("/org");
  return (
    <Container className="max-w-3xl py-10">
      <h1 className=" text-4xl font-bold">Ask for volunteers</h1>
      <p className="mt-2 text-lg text-muted">Tell people what you need and why. The more human the story, the more people will say yes.</p>
      <div className="card mt-8 p-6 sm:p-8">
        <RequestForm action={createRequest} submitLabel="Send for review" />
      </div>
    </Container>
  );
}
