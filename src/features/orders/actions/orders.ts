/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import "server-only";
import { storefrontFetch } from "@/shared/api/fetch";

export type StorefrontOrder = any; // optionally type this properly later

export async function getStorefrontOrderById(orderId: string) {
  if (!orderId) throw new Error("Missing orderId");

  // Backend: GET /storefront/orders/:orderId
  return storefrontFetch<StorefrontOrder>(`/api/storefront/orders/${orderId}`, {
    cache: "no-store",
    tags: [`order:${orderId}`],
  });
}
