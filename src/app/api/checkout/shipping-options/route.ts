/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/shared/api/fetch";
import { proxyStorefront } from "@/shared/api/storefront-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CART_TOKEN_COOKIE = "sf_cart_token";

// GET /api/checkout/shipping-options?state=Lagos
// Proxies to backend GET /api/shipping/storefront?state=Lagos
export async function GET(req: Request) {
  const jar = await cookies();
  const cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;
  if (!cartToken) {
    return NextResponse.json({ error: "No cart session" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state");

  const qs = state ? `?state=${encodeURIComponent(state)}` : "";

  return proxyStorefront(() =>
    storefrontFetch<any>(`/api/shipping/storefront${qs}`, {
      method: "GET",
      cartToken,
      cache: "no-store",
    }),
  );
}
