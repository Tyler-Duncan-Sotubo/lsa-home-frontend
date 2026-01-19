/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/shared/api/fetch";
import { proxyStorefront } from "@/shared/api/storefront-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CART_TOKEN_COOKIE = "sf_cart_token";

function noCartSession() {
  return NextResponse.json({ error: "No cart session" }, { status: 401 });
}

// ✅ GET /api/checkout/pickup?state=FCT
// Proxies to your backend pickup locations endpoint
export async function GET(req: Request) {
  const jar = await cookies();
  const cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;
  if (!cartToken) return noCartSession();

  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state");

  const qs = state ? `?state=${encodeURIComponent(state)}` : "";

  return proxyStorefront(() =>
    storefrontFetch<any>(`/api/pickup/storefront${qs}`, {
      method: "GET",
      cartToken,
      cache: "no-store",
    }),
  );
}

// ✅ PATCH /api/checkout/pickup { checkoutId, pickupLocationId, ... }
// Proxies to /api/storefront/checkouts/:checkoutId/pickup
export async function PATCH(req: Request) {
  const jar = await cookies();
  const cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;
  if (!cartToken) return noCartSession();

  const body = await req.json().catch(() => null);
  const { checkoutId, ...dto } = body ?? {};

  if (!checkoutId) {
    return NextResponse.json({ error: "Missing checkoutId" }, { status: 400 });
  }

  return proxyStorefront(() =>
    storefrontFetch<any>(`/api/storefront/checkouts/${checkoutId}/pickup`, {
      method: "PATCH",
      cartToken,
      body: dto,
      cache: "no-store",
    }),
  );
}
