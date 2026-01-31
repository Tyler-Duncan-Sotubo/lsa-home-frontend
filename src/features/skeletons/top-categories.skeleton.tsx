import { Skeleton } from "@/shared/ui/skeleton";

export function TopCategoriesSkeleton({ count = 12 }: { count?: number }) {
  return (
    <section className="w-full py-10 mx-auto">
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between gap-4 w-[95%] mx-auto">
        <div className="mt-10 mb-2.5 space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Arrow buttons */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Slider track */}
      <div className="relative overflow-x-hidden w-[95%] mx-auto">
        <div className="flex gap-6 pb-3 w-max pl-6 md:pl-8">
          {Array.from({ length: count }).map((_, idx) => (
            <div
              key={idx}
              className={`
                relative shrink-0
                w-56 md:w-56 lg:w-70 aspect-square
                overflow-hidden rounded-xl
                ${idx === 0 ? "-ml-6 md:-ml-8" : ""}
              `}
            >
              <Skeleton className="absolute inset-0" />
              <Skeleton className="absolute left-3 bottom-3 h-5 w-32 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
