import { Skeleton } from "@/shared/ui/skeleton";

interface ProductCardSkeletonProps {
  size?: "compact" | "default" | "large";
  showQuickView?: boolean;
}

export function ProductCardSkeleton({
  size = "default",
  showQuickView = true,
}: ProductCardSkeletonProps) {
  const imageHeight =
    size === "compact"
      ? "aspect-square"
      : size === "large"
        ? "aspect-square"
        : "aspect-square";

  const titleHeight =
    size === "compact" ? "h-3" : size === "large" ? "h-5" : "h-4";

  const priceHeight =
    size === "compact" ? "h-3" : size === "large" ? "h-5" : "h-4";

  return (
    <article className="flex flex-col w-full mt-10">
      {/* Image */}
      <div className={`relative w-full ${imageHeight} overflow-hidden`}>
        <Skeleton className="absolute inset-0 rounded-md" />

        {/* Tag / discount pill */}
        <Skeleton className="absolute left-3 top-3 h-5 w-14 rounded-full" />

        {/* Hover icons (wishlist / quick view placeholders) */}
        {showQuickView && (
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        )}

        {/* Bottom CTA */}
        <Skeleton className="absolute inset-x-3 bottom-3 h-10 rounded-md" />
      </div>

      {/* Content */}
      <div className="p-1 mt-4 flex flex-col gap-2">
        {/* Title */}
        <Skeleton className={`${titleHeight} w-[85%]`} />
        <Skeleton className={`${titleHeight} w-[60%]`} />

        {/* Price */}
        <Skeleton className={`${priceHeight} w-[40%]`} />
      </div>
    </article>
  );
}
