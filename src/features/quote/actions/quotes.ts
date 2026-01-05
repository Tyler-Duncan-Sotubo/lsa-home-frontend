// src/lib/storefront/quotes.ts
import "server-only";
import { storefrontFetchSafe } from "@/shared/api/fetch";

export type StorefrontQuoteItem = {
  productId?: string;
  variantId?: string;
  name: string;
  variantLabel?: string;
  attributes?: Record<string, string | null>;
  imageUrl?: string | null;
  quantity: number;
};

export type CreateStorefrontQuotePayload = {
  customerEmail: string;
  customerNote?: string;
  items: StorefrontQuoteItem[];
};

export type StorefrontQuoteResponse = {
  id: string;
  status: string;
  createdAt: string;
};

export async function submitStorefrontQuote(
  payload: CreateStorefrontQuotePayload
) {
  const res = await storefrontFetchSafe<StorefrontQuoteResponse>(
    `/api/quotes/storefront-quotes`,
    {
      method: "POST",
      body: payload,
    }
  );

  if (!res.ok) {
    return {
      ok: false as const,
      error: "Unable to submit quote request",
    };
  }

  return {
    ok: true as const,
    data: res.data,
  };
}
