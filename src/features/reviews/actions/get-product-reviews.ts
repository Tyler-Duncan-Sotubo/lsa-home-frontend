// src/features/reviews/actions/get-product-reviews.ts
"use server";

import { ProductReview } from "@/features/products/types/products";
import { storefrontFetch } from "@/shared/api/fetch";

export async function getProductReviews(productId: string) {
  return storefrontFetch<ProductReview[]>(
    `/api/catalog/reviews/storefront/${productId}`,
    { revalidate: 60, tags: [`product:${productId}:reviews`] }
  );
}
