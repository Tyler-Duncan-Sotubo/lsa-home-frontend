import { ProductCardSkeleton } from "./product-card.skeleton";

interface ProductRailSkeletonProps {
  count?: number;
  size?: "compact" | "default" | "large";
}

export function ProductRailSkeleton({
  count = 6,
  size = "default",
}: ProductRailSkeletonProps) {
  return (
    <section className="w-full py-8">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-muted rounded-md animate-pulse" />
          <div className="h-4 w-80 bg-muted rounded-md animate-pulse" />
        </div>
      </div>

      {/* Mobile grid */}
      <div className="grid grid-cols-2 gap-4 md:hidden">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} size="compact" />
        ))}
      </div>

      {/* Desktop rail */}
      <div className="hidden md:flex gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="shrink-0 w-[calc((100%-3rem)/3)]">
            <ProductCardSkeleton size={size} />
          </div>
        ))}
      </div>
    </section>
  );
}
