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
    <ul className="space-y-6 border-t border-b border-accent-foreground/5 divide-y divide-accent-foreground/5">
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
          <li key={review.id} className="p-4 space-y-4">
            {/* ⭐ BIGGER STARS */}
            <div className="text-yellow-500 text-xl font-semibold">
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </div>

            {/* 👤 NAME */}
            <div className="text-base font-medium text-foreground">
              {formattedName}
            </div>

            {/* 📝 Review paragraphs */}
            <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
              {paragraphs.map((para, idx) => (
                <p key={idx} className={idx === 0 ? "font-semibold" : ""}>
                  {para}
                </p>
              ))}
            </div>

            {/* 📅 DATE */}
            <p className="text-xs text-muted-foreground">
              {new Date(review.date_created).toLocaleDateString()}
            </p>

            {/* ✔ Verified purchase */}
            {review.verified && (
              <p className="text-[11px] text-emerald-600">Verified purchase</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
