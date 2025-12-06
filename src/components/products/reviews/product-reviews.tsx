// src/components/products/product-reviews.tsx
"use client";

import { useMemo, useState } from "react";
import type { ProductReview } from "@/types/products";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductReviewList } from "./product-review-list";
import { HiMiniStar, HiOutlineStar } from "react-icons/hi2";

interface ProductReviewsProps {
  productId: number;
  averageRating: string; // from product.average_rating
  ratingCount: number; // from product.rating_count
  onWriteReview?: () => void;
}

interface ReviewSummaryHeaderProps {
  averageRating: number;
  ratingCount: number;
  distribution: Record<number, number>; // {5: X, 4: Y, ...}
  onWriteReview?: () => void;
}

async function getReviews(productId: number) {
  const res = await fetch(`/api/products/${productId}/reviews`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return (await res.json()) as ProductReview[];
}

function ReviewSummaryHeader({
  averageRating,
  ratingCount,
  distribution,
  onWriteReview,
}: ReviewSummaryHeaderProps) {
  const counts = Object.values(distribution);
  const maxCount = counts.length ? Math.max(...counts) : 0;

  return (
    <div className="grid max-w-2xl my-16 gap-8 md:grid-cols-2 mx-auto">
      {/* LEFT: Overall summary */}
      <div className="space-y-4 flex flex-col items-center">
        {/* Reviews count */}
        <h3 className="text-4xl text-black text-center font-bold">
          {ratingCount} review{ratingCount === 1 ? "" : "s"}
        </h3>

        {/* Stars + big score */}
        <div className="flex items-center gap-4">
          {/* Big Score */}

          {/* Stars */}
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < Math.floor(averageRating);
              const half =
                i === Math.floor(averageRating) &&
                averageRating % 1 >= 0.3 &&
                averageRating % 1 <= 0.7;

              return (
                <span key={i} className="text-yellow-500 text-3xl">
                  {filled ? (
                    <HiMiniStar />
                  ) : half ? (
                    <HiMiniStar className="opacity-50" />
                  ) : (
                    <HiOutlineStar />
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* "4.5 of 5 stars" text */}
        <p className="text-sm text-muted-foreground">
          {averageRating.toFixed(1)} of 5 stars
        </p>
      </div>

      {/* RIGHT: distribution + button */}
      <div className="space-y-4">
        {/* Star Distribution */}
        <div className="space-y-2">
          {([5, 4, 3, 2, 1] as const).map((stars) => {
            const count = distribution[stars] ?? 0;
            const width =
              maxCount === 0 ? 0 : Math.round((count / maxCount) * 100);

            return (
              <div
                key={stars}
                className="flex items-center gap-3 text-sm cursor-default"
              >
                {/* Star Number + Icon */}
                <div className="flex items-center gap-1 w-10 shrink-0">
                  <span className="font-medium">{stars}</span>
                  <span className="text-yellow-500 text-sm">
                    <HiMiniStar />
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${width}%` }}
                  />
                </div>

                {/* Value */}
                <div className="w-6 text-right text-muted-foreground">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review Button */}
      <div className="flex justify-end">
        <Button
          onClick={onWriteReview}
          className="w-full md:w-[80%] lg:w-[70%]"
        >
          Write a Review
        </Button>
      </div>
    </div>
  );
}

export function ProductReviews({
  productId,
  averageRating,
  ratingCount,
  onWriteReview,
}: ProductReviewsProps) {
  const [ratingFilter, setRatingFilter] = useState<
    "all" | "1" | "2" | "3" | "4" | "5"
  >("all");

  const {
    data: reviews = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => getReviews(productId),
  });

  // Build star distribution from ALL reviews (not filtered)
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
    }
  }

  const avg = Number(averageRating) || 0;

  const filteredReviews = useMemo(() => {
    if (ratingFilter === "all") return reviews;
    const target = Number(ratingFilter);
    return reviews.filter((r) => r.rating === target);
  }, [reviews, ratingFilter]);

  // No reviews at all (and Woo also says 0)
  if (!ratingCount && reviews.length === 0 && !isLoading && !error) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl text-foreground uppercase font-bold">Reviews</h2>
        <p className="text-sm text-muted-foreground">
          No reviews yet. Be the first to share your thoughts.
        </p>
        <ReviewSummaryHeader
          averageRating={0}
          ratingCount={0}
          distribution={distribution}
          onWriteReview={onWriteReview}
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Title + Rating Filter */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl text-foreground uppercase font-bold">Reviews</h2>
      </div>

      {/* Summary header (unchanged) */}
      <ReviewSummaryHeader
        averageRating={avg}
        ratingCount={ratingCount}
        distribution={distribution}
        onWriteReview={onWriteReview}
      />

      {/* Loading / error states */}
      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      )}
      {error && (
        <p className="text-sm text-destructive">
          Failed to load reviews. Please try again later.
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading reviews...</p>
      )}

      {error && (
        <p className="text-sm text-red-500">
          Failed to load reviews. Please try again later.
        </p>
      )}

      <div>
        {reviews.length > 0 && (
          <div className="mb-4 flex items-center space-x-10">
            <h4 className="text-2xl font-bold">Filter Reviews</h4>
            <Select
              value={ratingFilter}
              onValueChange={(val) =>
                setRatingFilter(val as "all" | "1" | "2" | "3" | "4" | "5")
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ratings</SelectItem>
                <SelectItem value="5">5 stars</SelectItem>
                <SelectItem value="4">4 stars</SelectItem>
                <SelectItem value="3">3 stars</SelectItem>
                <SelectItem value="2">2 stars</SelectItem>
                <SelectItem value="1">1 star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!isLoading && !error && <ProductReviewList reviews={filteredReviews} />}
    </section>
  );
}
