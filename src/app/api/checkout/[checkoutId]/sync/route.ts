/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/shared/api/fetch";

const CART_TOKEN_COOKIE = "sf_cart_token";
const CART_REFRESH_COOKIE = "sf_cart_refresh_token"; // adjust if yours differs

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ checkoutId: string }> }
) {
  const { checkoutId } = await ctx.params;

  const jar = await cookies();
  const cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;
  const cartRefreshToken = jar.get(CART_REFRESH_COOKIE)?.value ?? null;

  if (!cartToken) {
    return NextResponse.json({ error: "No cart session" }, { status: 401 });
  }

  // ✅ hit Nest storefront controller route
  // NOTE: storefrontFetch() already prefixes baseUrl; path should NOT include /api
  const checkout = await storefrontFetch<any>(
    `/api/storefront/checkouts/${checkoutId}/sync`,
    {
      method: "POST",
      cartToken,
      cartRefreshToken,
      cache: "no-store",
    }
  );

  return NextResponse.json(checkout, {
    headers: { "Cache-Control": "no-store" },
  });
}
