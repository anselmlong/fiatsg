import { Container, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Container className="py-10">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="mt-4 h-6 w-full max-w-2xl" />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="mt-12 space-y-4">
        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <p className="sr-only" role="status">Loading…</p>
    </Container>
  );
}
