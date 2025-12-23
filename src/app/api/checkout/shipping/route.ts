/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/shared/api/fetch";

const CART_TOKEN_COOKIE = "sf_cart_token";

export async function PATCH(req: Request) {
  const jar = await cookies();
  const cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;
  if (!cartToken)
    return NextResponse.json({ error: "No cart session" }, { status: 401 });

  const body = await req.json();
  const { checkoutId, ...dto } = body;
  if (!checkoutId)
    return NextResponse.json({ error: "Missing checkoutId" }, { status: 400 });

  const updated = await storefrontFetch<any>(
    `/api/storefront/checkouts/${checkoutId}/shipping`,
    { method: "PATCH", cartToken, body: dto, cache: "no-store" }
  );

  return NextResponse.json(updated, {
    headers: { "Cache-Control": "no-store" },
  });
}
