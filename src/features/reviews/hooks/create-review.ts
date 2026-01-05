// src/features/reviews/hooks/create-review.ts
"use client";

export function useCreateReview(productId: string) {
  return async (payload: {
    rating: number;
    review: string;
    name: string;
    email: string;
    slug: string;
  }) => {
    const res = await fetch(`/api/reviews/${productId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.message ?? "Failed to submit review");
    }

    return res.json();
  };
}
