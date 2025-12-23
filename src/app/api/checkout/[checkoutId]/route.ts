/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/shared/api/fetch";

const CART_TOKEN_COOKIE = "sf_cart_token";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ checkoutId: string }> }
) {
  const { checkoutId } = await ctx.params;

  const jar = await cookies();
  const cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;

  if (!cartToken) {
    return NextResponse.json({ error: "No cart session" }, { status: 401 });
  }

  const checkout = await storefrontFetch<any>(
    `/api/storefront/checkouts/${checkoutId}`,
    { method: "GET", cartToken, cache: "no-store" }
  );

  return NextResponse.json(checkout, {
    headers: { "Cache-Control": "no-store" },
  });
}
