"use client";

import * as React from "react";

export interface ProductReviewItem {
  id: number;
  reviewer: string;
  rating: number;
  review: string;
  date_created: string;
  verified: boolean;
}

interface ProductReviewListProps {
  reviews: ProductReviewItem[];
}

export function ProductReviewList({ reviews }: ProductReviewListProps) {
  if (!reviews.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No reviews match this filter yet.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {reviews.map((review) => {
        // Format name like: "Biplang Liadi" -> "Biplang L"
        const parts = review.reviewer.trim().split(" ");
        const formattedName =
          parts.length > 1
            ? `${parts[0]} ${parts[1][0].toUpperCase()}`
            : parts[0];

        // Clean review text: strip HTML + markdown ** **
        const cleanedText = review.review
          .replace(/<[^>]+>/g, "") // remove HTML tags (e.g. <p>)
          .replace(/\*\*/g, "") // remove markdown bold markers
          .trim();

        const paragraphs = cleanedText.split(/\n+/).filter(Boolean);

        return (
          <li
            key={review.id}
            className="border border-accent-foreground/5 rounded-lg p-4 flex flex-col h-full bg-background"
          >
            {/* Top row: stars (left) + date (right) */}
            <div className="flex items-start justify-between mb-3">
              <div className="text-yellow-500 text-xl font-semibold">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(review.date_created).toLocaleDateString()}
              </p>
            </div>

            {/* Review text */}
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed flex-1">
              {paragraphs.map((para, idx) => (
                <p key={idx} className={idx === 0 ? "font-semibold" : ""}>
                  {para}
                </p>
              ))}
            </div>

            {/* Name + verified under review */}
            <div className="pt-4">
              <p className="text-sm font-medium text-foreground">
                {formattedName}
              </p>
              {review.verified && (
                <p className="text-[11px] text-emerald-600">
                  Verified purchase
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
