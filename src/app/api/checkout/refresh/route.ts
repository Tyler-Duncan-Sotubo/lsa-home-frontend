/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/shared/api/fetch";
import { proxyStorefront } from "@/shared/api/storefront-proxy";

const CART_TOKEN_COOKIE = "sf_cart_token";

export async function POST(req: Request) {
  const jar = await cookies();
  const cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;
  if (!cartToken)
    return NextResponse.json({ error: "No cart session" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { checkoutId } = body ?? {};
  if (!checkoutId)
    return NextResponse.json({ error: "Missing checkoutId" }, { status: 400 });

  return proxyStorefront(() =>
    storefrontFetch<any>(`/api/storefront/checkouts/${checkoutId}/refresh`, {
      method: "POST",
      cartToken,
      cache: "no-store",
    }),
  );
}
