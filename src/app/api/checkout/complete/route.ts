/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/shared/api/fetch";

const CART_ID_COOKIE = "sf_cart_id";
const CART_TOKEN_COOKIE = "sf_cart_token";

export async function POST(req: Request) {
  const jar = await cookies();
  const cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;
  if (!cartToken)
    return NextResponse.json({ error: "No cart session" }, { status: 401 });

  const { checkoutId } = await req.json();
  if (!checkoutId)
    return NextResponse.json({ error: "Missing checkoutId" }, { status: 400 });

  // recommended
  await storefrontFetch(`/api/storefront/checkouts/${checkoutId}/lock`, {
    method: "PATCH",
    cartToken,
    cache: "no-store",
  });

  const order = await storefrontFetch<any>(
    `/api/storefront/checkouts/${checkoutId}/complete`,
    { method: "POST", cartToken, cache: "no-store" }
  );

  // new cart session next time
  jar.delete(CART_ID_COOKIE);
  jar.delete(CART_TOKEN_COOKIE);

  return NextResponse.json(order, { headers: { "Cache-Control": "no-store" } });
}
