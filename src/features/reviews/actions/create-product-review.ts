// src/features/reviews/actions/create-product-review.ts
"use server";

import { revalidateTag } from "next/cache";
import { storefrontFetch } from "@/shared/api/fetch";

type CreateReviewPayload = {
  rating: number;
  review: string;
  name: string;
  email: string;
  slug: string;
};

export async function createProductReview(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();

  const payload: CreateReviewPayload = {
    rating: Number(formData.get("rating") ?? 0),
    review: String(formData.get("review") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
  };

  // Let your Nest validation handle final enforcement too,
  // but do basic sanity checks to avoid weird payloads.
  if (!productId) throw new Error("Missing productId");
  if (
    !Number.isFinite(payload.rating) ||
    payload.rating < 1 ||
    payload.rating > 5
  ) {
    throw new Error("Rating must be between 1 and 5");
  }
  if (!payload.review) throw new Error("Review is required");
  if (!payload.name) throw new Error("Name is required");
  if (!payload.email) throw new Error("Email is required");

  // ✅ IMPORTANT: match your Nest endpoint
  // You used: `/api/catalog/reviews/storefront/${productId}/reviews`
  const created = await storefrontFetch(
    `/api/catalog/reviews/storefront/${productId}`,
    {
      method: "POST",
      body: payload,
      revalidate: 0,
    }
  );

  // ✅ Invalidate cached reads
  revalidateTag(`product:${productId}:reviews`, {});
  revalidateTag(`product:${productId}`, {});

  return created;
}
