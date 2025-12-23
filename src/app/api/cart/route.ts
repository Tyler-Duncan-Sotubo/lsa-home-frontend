/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/cart/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/shared/api/fetch";
import { auth } from "@/lib/auth/auth";

const CART_ID_COOKIE = "sf_cart_id";
const CART_TOKEN_COOKIE = "sf_cart_token";

async function readSession() {
  const jar = cookies();
  const cartId = (await jar).get(CART_ID_COOKIE)?.value ?? null;
  const cartToken = (await jar).get(CART_TOKEN_COOKIE)?.value ?? null;
  return { jar: await jar, cartId, cartToken };
}

async function ensureCartSession() {
  const jar = await cookies();
  let cartId = jar.get(CART_ID_COOKIE)?.value ?? null;
  let cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;

  const session = await auth();
  const customerId = session?.user.id ?? null;

  if (!cartId || !cartToken) {
    const cart = await storefrontFetch<any>("/api/storefront/carts", {
      method: "POST",
      body: { channel: "online", currency: "NGN", customerId },
    });

    cartId = cart.id;
    cartToken = cart.guestToken;

    if (cartId) {
      jar.set(CART_ID_COOKIE, cartId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
    if (cartToken) {
      jar.set(CART_TOKEN_COOKIE, cartToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
  }

  return { cartId, cartToken };
}

function sameAttrs(a: any, b: any) {
  const A = a ?? {};
  const B = b ?? {};
  const keys = Array.from(
    new Set([...Object.keys(A), ...Object.keys(B)])
  ).sort();
  return keys.every((k) => String(A[k] ?? "") === String(B[k] ?? ""));
}

function findCartItemId(
  cart: any,
  productOrVariantId: string | number,
  attributes?: any
) {
  const items = cart?.items ?? [];
  const targetId = String(productOrVariantId);

  const match = items.find((it: any) => {
    const itId = it?.variantId ?? it?.productId ?? it?.product?.id ?? it?.id;
    if (String(itId) !== targetId) return false;
    return sameAttrs(it?.attributes ?? it?.variation ?? {}, attributes ?? {});
  });

  return match?.id ? String(match.id) : null;
}

// GET /api/cart
export async function GET() {
  const { cartId, cartToken } = await readSession();
  if (!cartId || !cartToken)
    return NextResponse.json({ cartId: null, items: [], subtotal: 0 });

  const items = await storefrontFetch<any>(
    `/api/storefront/carts/${cartId}/items`,
    { method: "GET", cartToken, cache: "no-store" }
  );

  const subtotal = Array.isArray(items)
    ? items.reduce((sum, it) => sum + Number(it.lineTotal ?? 0), 0)
    : 0;

  return NextResponse.json(
    { cartId, items: Array.isArray(items) ? items : [], subtotal },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// POST /api/cart  (add)
export async function POST(req: Request) {
  const input = await req.json();
  if (!input?.slug)
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const { cartId, cartToken } = await ensureCartSession();

  const cart = await storefrontFetch<any>(
    `/api/storefront/carts/${cartId}/items`,
    {
      method: "POST",
      cartToken,
      body: {
        slug: input.slug,
        variantId: input.variantId ?? null,
        quantity: input.quantity ?? 1,
      },
    }
  );

  return NextResponse.json(cart);
}

// PATCH /api/cart  (update qty by key)
export async function PATCH(req: Request) {
  const { productOrVariantId, quantity, attributes } = await req.json();

  const { cartId, cartToken } = await readSession();
  if (!cartId || !cartToken)
    return NextResponse.json({ error: "No cart session" }, { status: 401 });

  const cart = await storefrontFetch<any>(`/api/storefront/carts/${cartId}`, {
    method: "GET",
    cartToken,
  });

  const cartItemId = findCartItemId(cart, productOrVariantId, attributes);
  if (!cartItemId)
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });

  const updated = await storefrontFetch<any>(
    `/api/storefront/carts/${cartId}/items/${cartItemId}`,
    { method: "PATCH", cartToken, body: { quantity } }
  );

  return NextResponse.json(updated);
}

// DELETE /api/cart  (remove by key)
export async function DELETE(req: Request) {
  const { productOrVariantId, attributes } = await req.json();

  const { cartId, cartToken } = await readSession();
  if (!cartId || !cartToken)
    return NextResponse.json({ error: "No cart session" }, { status: 401 });

  const cart = await storefrontFetch<any>(`/api/storefront/carts/${cartId}`, {
    method: "GET",
    cartToken,
  });

  const cartItemId = findCartItemId(cart, productOrVariantId, attributes);
  if (!cartItemId)
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });

  const updated = await storefrontFetch<any>(
    `/api/storefront/carts/${cartId}/items/${cartItemId}`,
    { method: "DELETE", cartToken }
  );

  return NextResponse.json(updated);
}
