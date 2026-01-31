import { Skeleton } from "@/shared/ui/skeleton";

export function ProductPageSkeleton() {
  return (
    <section className="py-8">
      <div className="mx-auto w-[95%]">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Main grid */}
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-3 md:gap-3 items-start mt-6">
          {/* Gallery skeleton (sticky area) */}
          <div className="md:sticky md:top-24 self-start">
            <div className="relative w-full overflow-hidden rounded-xl">
              {/* Main image */}
              <div className="relative w-full h-105 md:h-162.5">
                <Skeleton className="absolute inset-0" />
              </div>

              {/* Thumbs row/column hint */}
              <div className="mt-3 flex gap-3 md:hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-16 rounded-md" />
                ))}
              </div>

              <div className="hidden md:flex gap-3 mt-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-16 rounded-md" />
                ))}
              </div>
            </div>
          </div>

          {/* Details panel skeleton */}
          <ProductDetailsPanelSkeleton />
        </div>
      </div>

      {/* Under area (tabs / description / reviews) */}
      <div className="mt-24 bg-gray-50 px-10 py-8">
        <div className="mx-auto w-[95%]">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>

          {/* Content block */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[78%]" />
            <Skeleton className="h-4 w-[88%]" />
            <Skeleton className="h-4 w-[70%]" />
          </div>

          {/* Review CTA row */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>

          {/* Reviews list hint */}
          <div className="mt-8 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mx-auto w-[95%] mt-24">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardMiniSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductDetailsPanelSkeleton() {
  return (
    <div className="rounded-xl bg-background p-4">
      {/* Title */}
      <Skeleton className="h-7 w-[80%]" />

      {/* Short description block */}
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-[88%]" />
        <Skeleton className="h-4 w-[70%]" />
      </div>

      {/* Rating */}
      <div className="mt-5 flex items-center gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Price */}
      <div className="mt-6">
        <Skeleton className="h-6 w-40" />
      </div>

      {/* Variant selectors */}
      <div className="mt-6 space-y-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-16 rounded-md" />
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="h-4 w-14 mb-2" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-16 rounded-md" />
            ))}
          </div>
        </div>
      </div>

      {/* CTA row */}
      <div className="mt-6 flex items-center gap-2">
        <Skeleton className="h-11 flex-1 rounded-md" />
        <Skeleton className="h-11 w-11 rounded-md" />
      </div>

      {/* Help box */}
      <div className="mt-4 rounded-lg p-3 bg-muted/60">
        <Skeleton className="h-4 w-[70%]" />
        <Skeleton className="mt-2 h-3 w-[85%]" />
      </div>

      {/* Info sections hint */}
      <div className="mt-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-[86%]" />
      </div>
    </div>
  );
}

function ProductCardMiniSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden">
      <div className="relative aspect-square">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[45%]" />
      </div>
    </div>
  );
}
