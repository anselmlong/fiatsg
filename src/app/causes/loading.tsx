import { CardGridSkeleton, Container, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Container className="py-10">
      <h1 className="text-4xl font-bold sm:text-5xl">Find a cause</h1>
      <Skeleton className="mt-6 h-14 w-full rounded-full sm:w-96" />
      <Skeleton className="mt-12 h-9 w-48" />
      <CardGridSkeleton />
      <p className="sr-only" role="status">Loading causes…</p>
    </Container>
  );
}
