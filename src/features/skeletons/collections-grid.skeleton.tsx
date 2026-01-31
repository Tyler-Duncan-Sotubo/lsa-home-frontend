import { Skeleton } from "@/shared/ui/skeleton";

export function CollectionsGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <section className="mx-auto w-[95%] py-20">
      <Skeleton className="mb-12 h-9 w-48" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl bg-muted shadow-sm"
          >
            {/* Image */}
            <div className="relative aspect-5/6">
              <Skeleton className="absolute inset-0" />
            </div>

            {/* Badge placeholder */}
            <Skeleton className="absolute left-3 top-3 h-6 w-12 rounded-full" />

            {/* Label placeholder */}
            <Skeleton className="absolute left-4 bottom-4 h-7 w-32 rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  );
}
