import { Skeleton } from "@/shared/ui/skeleton";

export function CollectionPageSkeleton({
  showSidebar = true,
  productCount = 12,
  showAfterContent = true,
}: {
  showSidebar?: boolean;
  productCount?: number;
  showAfterContent?: boolean;
}) {
  return (
    <section className="mx-auto w-[95%] space-y-6 py-8">
      {/* Header */}
      <header className="flex flex-col gap-2 px-5">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Title + description row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Skeleton className="h-10 w-64" /> {/* h1 */}
          <div className="md:w-1/2 space-y-2">
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[70%]" />
          </div>
        </div>
      </header>

      {/* Body */}
      <div
        className={
          showSidebar
            ? "grid grid-cols-1 gap-16 md:grid-cols-[260px_minmax(0,1fr)]"
            : ""
        }
      >
        {/* Filters sidebar */}
        {showSidebar ? (
          <aside className="hidden md:block">
            <div className="space-y-5">
              <Skeleton className="h-6 w-40" />
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <Skeleton key={j} className="h-8 w-16 rounded-md" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        ) : null}

        {/* Products area (matches your ProductRail wrap layout) */}
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 md:gap-6 py-8">
            {Array.from({ length: productCount }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* After content */}
      {showAfterContent ? (
        <div className="border-t pt-6 space-y-3">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[86%]" />
          <Skeleton className="h-4 w-[78%]" />
        </div>
      ) : null}
    </section>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="mt-10">
      <div className="relative w-full aspect-square overflow-hidden">
        <Skeleton className="absolute inset-0 rounded-md" />
      </div>
      <div className="p-1 mt-4 space-y-2">
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[55%]" />
      </div>
    </div>
  );
}
