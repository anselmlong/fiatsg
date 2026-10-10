import Link from "next/link";
import { Container } from "@/components/ui";
import { getCause } from "@/lib/queries";
import { LoginForm } from "./form";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "";
  // Arrived from "I'd like to help": logging in sends that offer too.
  const offerId = Number(sp.offer);
  const cause = Number.isInteger(offerId) && offerId > 0 ? await getCause(offerId) : null;
  const offer = cause?.request.status === "approved" ? { id: offerId, orgName: cause.org.name.split(" — ")[0] } : null;
  const query = new URLSearchParams({ ...(next && { next }), ...(offer && { offer: String(offer.id) }) }).toString();

  return (
    <Container className="max-w-xl py-14">
      <h1 className="text-4xl font-bold">Welcome back</h1>
      <p className="mt-2 text-lg text-muted">
        {offer
          ? `Log in and your offer goes straight to ${offer.orgName}, with your name, email and phone so they can contact you.`
          : "Log in with the email and password you joined with."}
      </p>
      <div className="card mt-8 p-7">
        <LoginForm next={next} offer={offer?.id} />
      </div>
      <p className="mt-6 text-center text-lg">
        New here? <Link href={`/join${query ? `?${query}` : ""}`} className="font-bold">Create a free account</Link>
      </p>
    </Container>
  );
}
