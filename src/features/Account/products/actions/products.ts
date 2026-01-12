// src/lib/storefront/account/products.ts
import "server-only";
import { storefrontFetchSafe } from "@/shared/api/fetch";
import { ListCustomerProductsResponse } from "../types/my-products";

export async function listCustomerProducts(
  input: { limit?: number; offset?: number } = {},
  accessToken?: string | null
) {
  const qs = new URLSearchParams();
  if (input.limit != null) qs.set("limit", String(input.limit));
  if (input.offset != null) qs.set("offset", String(input.offset));

  const res = await storefrontFetchSafe<ListCustomerProductsResponse>(
    `/api/storefront/customers/products?${qs.toString()}`,
    {
      method: "GET",
      tags: ["customer:products"],
      accessToken: accessToken ?? null,
    }
  );

  if (!res.ok) {
    // do NOT console.error here (per your rule) — throw so route can return message
    throw {
      statusCode: res.statusCode,
      error: res.error,
    };
  }

  return res.data;
}
