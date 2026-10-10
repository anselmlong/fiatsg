import Link from "next/link";
import { Container } from "@/components/ui";
import { LoginForm } from "./form";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = (await searchParams).next;
  return (
    <Container className="max-w-xl py-14">
      <h1 className="text-4xl font-bold">Welcome back</h1>
      <p className="mt-2 text-lg text-muted">Log in with the email and password you joined with.</p>
      <div className="card mt-8 p-7">
        <LoginForm next={typeof next === "string" ? next : ""} />
      </div>
      <p className="mt-6 text-center text-lg">
        New here? <Link href={`/join${typeof next === "string" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold">Create a free account</Link>
      </p>
    </Container>
  );
}
