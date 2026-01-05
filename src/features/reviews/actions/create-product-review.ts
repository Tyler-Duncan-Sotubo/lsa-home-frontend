import "server-only";
import { storefrontFetch } from "@/shared/api/fetch";

export type CreateReviewPayload = {
  rating: number;
  review: string;
  name: string;
  email: string;
  slug: string;
};

export async function submitProductReview(
  productId: string,
  payload: CreateReviewPayload
) {
  if (!productId) {
    return { ok: false as const, status: 400, error: "Missing productId" };
  }

  const res = await storefrontFetch(
    `/api/catalog/reviews/storefront/${productId}`,
    {
      method: "POST",
      body: payload,
      revalidate: 0,
    }
  );

  // If your storefrontFetch already throws on !ok, adapt accordingly.
  return { ok: true as const, data: res };
}
