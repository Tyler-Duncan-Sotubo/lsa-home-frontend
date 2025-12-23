/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/shared/api/fetch";

const CART_ID_COOKIE = "sf_cart_id";
const CART_TOKEN_COOKIE = "sf_cart_token";

async function readSession() {
  const jar = await cookies();
  const cartId = jar.get(CART_ID_COOKIE)?.value ?? null;
  const cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;
  return { cartId, cartToken };
}

// POST /api/checkout  -> creates checkout from cart (idempotent on backend)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const { cartId, cartToken } = await readSession();
  if (!cartId || !cartToken) {
    return NextResponse.json({ error: "No cart session" }, { status: 401 });
  }

  // Optional: pass email if you have it
  const checkout = await storefrontFetch<any>(
    `/api/storefront/checkouts/from-cart/${cartId}`,
    {
      method: "POST",
      cartToken,
      body, // e.g. { email, channel: "online" }
      cache: "no-store",
    }
  );

  return NextResponse.json(checkout, {
    headers: { "Cache-Control": "no-store" },
  });
}
