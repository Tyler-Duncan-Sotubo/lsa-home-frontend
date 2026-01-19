/* eslint-disable @typescript-eslint/no-explicit-any */
// src/cart/cart.queries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientAxios } from "@/shared/api/clientAxios";

type ApiErrorPayload = any;

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload;
  constructor(message: string, status: number, payload: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function api(method: "GET" | "POST" | "PATCH" | "DELETE", body?: any) {
  const res = await fetch("/api/cart", {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const ct = res.headers.get("content-type") ?? "";
  const payload = ct.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const msg =
      (payload &&
        typeof payload === "object" &&
        (payload.message || payload.error?.message)) ||
      (typeof payload === "string" && payload) ||
      "Request failed";

    console.error("API Error:", msg);

    throw new ApiError(msg, res.status, payload);
  }

  return payload;
}

export type CartResponse = {
  cartId: string | null;
  items: any[];
  subtotal: number;
};

export const cartKeys = {
  all: ["cart"] as const,
  current: () => ["cart", "current"] as const,
};

export function useCartQuery() {
  return useQuery<CartResponse>({
    queryKey: cartKeys.current(),
    queryFn: () => api("GET"),
    staleTime: 15_000,
  });
}

export function useAddToCartMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      slug: string;
      variantId?: string | null;
      quantity?: number;
    }) => {
      const { data } = await clientAxios.post("/api/cart", {
        slug: input.slug,
        variantId: input.variantId ?? null,
        quantity: input.quantity ?? 1,
      });
      console.log("Add to cart response data:", data);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cart", "current"] });
    },
  });
}
