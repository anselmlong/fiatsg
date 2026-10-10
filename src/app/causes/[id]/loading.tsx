import { Container, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div>
      <div className="bg-purple-deep">
        <Container className="pb-10 pt-20 sm:pt-24">
          <div className="lg:mr-[calc(400px+2.5rem)]">
            <Skeleton className="h-7 w-28 rounded-full bg-white/20" />
            <Skeleton className="mt-4 h-24 w-full max-w-2xl bg-white/20" />
            <Skeleton className="mt-3 h-7 w-56 bg-white/20" />
          </div>
        </Container>
      </div>
      <Container className="grid items-start gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-4">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <aside className="relative order-first lg:order-none lg:-mt-40">
          <div className="card space-y-5 p-6">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-14 w-full rounded-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </aside>
      </Container>
      <p className="sr-only" role="status">Loading cause…</p>
    </div>
  );
}
