import { Container, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Container className="max-w-4xl py-8 sm:py-12">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="mt-4 h-6 w-full max-w-2xl" />
      <Skeleton className="mt-4 h-4 w-48" />
      <div className="mt-8 divide-y divide-line border-y border-line">
        {Array.from({ length: 2 }, (_, i) => <div key={i} className="py-6"><Skeleton className="h-28 w-full" /></div>)}
      </div>
      <div className="mt-10 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="mt-8 h-16 w-full" />
      </div>
      <p className="sr-only" role="status">Loading…</p>
    </Container>
  );
}
