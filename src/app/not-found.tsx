import Link from "next/link";
import { Container } from "@/components/ui";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Container className="max-w-xl py-20 text-center">
      <p className="font-serif text-6xl font-bold text-gold">404</p>
      <h1 className="mt-4 text-4xl font-bold">We couldn't find that page</h1>
      <p className="mt-3 text-lg text-muted">
        It may have moved, or the cause may no longer be open. There are plenty of others that need you.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/causes" className="btn-primary">Find a cause</Link>
        <Link href="/" className="btn-ghost">Go home</Link>
      </div>
    </Container>
  );
}
