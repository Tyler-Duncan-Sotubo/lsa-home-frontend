import "server-only";
import { storefrontFetchSafe } from "@/shared/api/fetch";

export type CustomerOrderProduct = {
  id: string;
  name: string | null;
  slug: string | null;
  imageUrl: string | null;
};

export type CustomerOrderLineItem = {
  id: string;
  quantity: number;
  totalMinor: number | null;
  name: string;
  product?: CustomerOrderProduct | null;
  imageUrl: string | null;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string | null;
  status: string;
  createdAt: string; // ISO
  currency: string | null;
  totalMinor: number | null;
  items?: CustomerOrderLineItem[];
};

export type ListCustomerOrdersResponse = {
  items: CustomerOrder[];
  total: number;
  limit: number;
  offset: number;
};

export async function listCustomerOrders(
  opts?: { limit?: number; offset?: number },
  accessToken?: string | null
) {
  const qs = new URLSearchParams();
  if (opts?.limit != null) qs.set("limit", String(opts.limit));
  if (opts?.offset != null) qs.set("offset", String(opts.offset));

  const url = `/api/storefront/customers/orders${
    qs.toString() ? `?${qs}` : ""
  }`;

  const res = await storefrontFetchSafe<ListCustomerOrdersResponse>(url, {
    method: "GET",
    tags: ["customer:orders"],
    accessToken: accessToken ?? null,
  });

  if (!res.ok) {
    // do NOT console.error here (as you requested earlier)
    throw {
      statusCode: res.statusCode,
      error: res.error,
    };
  }

  return res.data;
}
