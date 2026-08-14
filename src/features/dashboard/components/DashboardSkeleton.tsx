import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-4 sm:space-y-6 sm:px-6 lg:px-6">
        <section className="rounded-sm  bg-surface-container-lowest px-5 py-6 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.35)] sm:px-6 sm:py-7">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="mt-4 h-4 w-3/4" />
          <Skeleton className="mt-3 h-4 w-1/2" />
        </section>

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <article
              key={index}
              className="rounded-sm bg-surface-container-lowest p-4 shadow-[0_8px_20px_-18px_rgba(15,23,42,0.35)]"
            >
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="mt-4 h-3 w-20" />
              <Skeleton className="mt-2 h-5 w-24" />
            </article>
          ))}
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <article
              key={index}
              className="overflow-hidden rounded-sm bg-surface-container-lowest p-5 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-4 h-6 w-3/4" />
              <Skeleton className="mt-3 h-3 w-full" />
            </article>
          ))}
        </section>

        <section className="w-full rounded-sm  bg-surface-container-lowest p-6 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.15)]">
          <Skeleton className="h-5 w-40" />
          <div className="mt-6 grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-sm" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
