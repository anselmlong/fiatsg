import { Container, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div>
      <div className="bg-purple-deep">
        <Container className="pb-10 pt-32 sm:pt-48">
          <Skeleton className="h-7 w-28 rounded-full bg-white/20" />
          <Skeleton className="mt-4 h-12 w-full max-w-2xl bg-white/20" />
          <Skeleton className="mt-3 h-7 w-56 bg-white/20" />
        </Container>
      </div>
      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <div className="card order-first space-y-4 p-6 lg:order-none">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </Container>
      <p className="sr-only" role="status">Loading cause…</p>
    </div>
  );
}
