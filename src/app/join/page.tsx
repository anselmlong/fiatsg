import Link from "next/link";
import { Container } from "@/components/ui";
import { getCause } from "@/lib/queries";
import { JoinForm } from "./form";

export const metadata = { title: "Join" };

export default async function JoinPage({ searchParams }: PageProps<"/join">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "";
  const fromCause = next.startsWith("/causes/");
  // Arrived from "I'd like to help": joining sends that offer too.
  const offerId = Number(sp.offer);
  const cause = Number.isInteger(offerId) && offerId > 0 ? await getCause(offerId) : null;
  const offer = cause?.request.status === "approved" ? { id: offerId, orgName: cause.org.name.split(" — ")[0] } : null;
  const query = new URLSearchParams({ ...(next && { next }), ...(offer && { offer: String(offer.id) }) }).toString();

  return (
    <Container className="max-w-2xl py-14">
      <h1 className=" text-4xl font-bold sm:text-5xl">{fromCause ? "Join to offer your help" : "What gifts has God given you?"}</h1>
      <p className="mt-3 text-lg text-muted">
        {offer
          ? `Just your name and how to reach you. Your offer goes to ${offer.orgName} as soon as you join.`
          : fromCause
            ? "Just your name and how to reach you. You'll go straight back to the cause."
            : "It takes about a minute. Tell us what you're good at, and we'll show you the causes that need it."}
      </p>
      <div className="card mt-8 p-6 sm:p-8">
        <JoinForm next={next} quick={fromCause} offer={offer} />
      </div>
      <p className="mt-6 text-center text-lg">
        Already joined? <Link href={`/login${query ? `?${query}` : ""}`} className="font-bold">Log in</Link>
        <span className="mx-3 text-muted">·</span>
        <Link href="/join/organisation" className="font-bold">Registering an organisation?</Link>
      </p>
    </Container>
  );
}
