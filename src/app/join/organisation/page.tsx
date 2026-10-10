import { Container } from "@/components/ui";
import { OrgJoinForm } from "./form";

export const metadata = { title: "Register your organisation" };

export default function OrgJoinPage() {
  return (
    <Container className="max-w-3xl py-14">
      <p className="eyebrow">For Catholic organisations</p>
      <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Register your organisation</h1>
      <p className="mt-3 text-lg text-muted">
        The Catholic Foundation reviews every organisation before it can post requests. This usually takes a few days —
        we'll let you know here if anything needs changing.
      </p>
      <div className="card mt-8 p-6 sm:p-8">
        <OrgJoinForm />
      </div>
    </Container>
  );
}
