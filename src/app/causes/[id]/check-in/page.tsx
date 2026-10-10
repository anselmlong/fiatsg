import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { Container } from "@/components/ui";
import { db, responses } from "@/db";
import { currentUser } from "@/lib/auth";
import { getCause } from "@/lib/queries";
import { CheckInForm } from "./form";

export const metadata = { title: "Check in" };

// Where the QR code at the venue leads.
export default async function CheckInPage({ params, searchParams }: PageProps<"/causes/[id]/check-in">) {
  const id = Number((await params).id);
  const k = (await searchParams).k;
  const token = typeof k === "string" ? k : "";
  const cause = Number.isInteger(id) ? await getCause(id) : null;
  if (!cause) notFound();
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/causes/${id}/check-in?k=${token}`)}`);
  const [mine] = user.role === "supporter"
    ? await db.select().from(responses).where(and(eq(responses.requestId, id), eq(responses.userId, user.id)))
    : [];
  const orgShort = cause.org.name.split(" — ")[0];

  return (
    <Container className="max-w-xl py-14 text-center">
      <p className="font-bold text-gold-ink">{orgShort}</p>
      <h1 className="mt-2 text-4xl font-bold">{cause.request.title}</h1>
      <div className="card mt-8 p-6">
        {mine?.checkedInAt ? (
          <>
            <p className="font-serif text-2xl text-purple-deep">You're checked in. Thank you for coming, {user.name.split(" ")[0]}.</p>
            <Link href="/me#saints" className="btn-primary mt-5">See the saints you've met</Link>
          </>
        ) : (
          <>
            <p className="text-lg">Welcome, {user.name.split(" ")[0]}. Tap below to let {orgShort} know you're here.</p>
            <div className="mt-5"><CheckInForm requestId={id} token={token} /></div>
          </>
        )}
      </div>
    </Container>
  );
}
