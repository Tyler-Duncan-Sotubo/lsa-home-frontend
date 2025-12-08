"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface ProductRailSkeletonProps {
  title?: string;
  subtitle?: string;
  sectionClassName?: string;
}

export function ProductRailSkeleton({
  sectionClassName = "w-full py-8",
}: ProductRailSkeletonProps) {
  return (
    <section className={sectionClassName}>
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>

        {/* Grid skeleton: 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-4/5 rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
