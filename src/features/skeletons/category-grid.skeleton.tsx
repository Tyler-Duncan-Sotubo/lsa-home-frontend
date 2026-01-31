import { Skeleton } from "@/shared/ui/skeleton";

const ASPECTS = [
  "md:aspect-[1/1]",
  "md:aspect-[5/4]",
  "md:aspect-[5/6]",
  "md:aspect-[12/9]",
  "md:aspect-[5/4]",
  "md:aspect-[1/1]",
] as const;

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="w-[95%] mx-auto py-16">
      <div className="container mx-auto">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="columns-2 md:columns-3 gap-6 [column-fill:balance]">
          {Array.from({ length: count }).map((_, idx) => {
            const aspectClass = ASPECTS[idx % ASPECTS.length];
            return (
              <div key={idx} className="mb-6 break-inside-avoid">
                <div className="overflow-hidden rounded-xl">
                  <div
                    className={`relative w-full aspect-square ${aspectClass}`}
                  >
                    <Skeleton className="absolute inset-0" />
                  </div>
                  <div className="p-3">
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
