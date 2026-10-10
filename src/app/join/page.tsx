import Link from "next/link";
import { Container } from "@/components/ui";
import { JoinForm } from "./form";

export const metadata = { title: "Join" };

export default async function JoinPage({ searchParams }: PageProps<"/join">) {
  const next = (await searchParams).next;
  const fromCause = typeof next === "string" && next.startsWith("/causes/");
  return (
    <Container className="max-w-2xl py-14">
      <h1 className=" text-4xl font-bold sm:text-5xl">{fromCause ? "Join to offer your help" : "What gifts has God given you?"}</h1>
      <p className="mt-3 text-lg text-muted">
        {fromCause
          ? "Just your name and how to reach you. You'll go straight back to the cause."
          : "It takes about a minute. Tell us what you're good at, and we'll show you the causes that need it."}
      </p>
      <div className="card mt-8 p-6 sm:p-8">
        <JoinForm next={typeof next === "string" ? next : ""} />
      </div>
      <p className="mt-6 text-center text-lg">
        Already joined? <Link href={`/login${typeof next === "string" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold">Log in</Link>
        <span className="mx-3 text-muted">·</span>
        <Link href="/join/organisation" className="font-bold">Registering an organisation?</Link>
      </p>
    </Container>
  );
}
