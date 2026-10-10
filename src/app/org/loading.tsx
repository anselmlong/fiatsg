import { Container, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Container className="py-10">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-3 h-6 w-48" />
      <div className="mt-8 grid gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="card space-y-3 p-5">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
      <p className="sr-only" role="status">Loading…</p>
    </Container>
  );
}
