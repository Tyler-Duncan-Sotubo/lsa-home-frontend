/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/cart/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/shared/api/fetch";
import { auth } from "@/lib/auth/auth";

function errorResponse(statusCode: number, message: string, extra?: any) {
  return NextResponse.json(
    {
      statusCode,
      error: { message },
      ...(extra ? { extra } : {}),
    },
    { status: statusCode, headers: { "Cache-Control": "no-store" } },
  );
}

function extractErrorMessage(e: any) {
  // storefrontFetch might throw either:
  // - { status, error: { message }, statusCode }
  // - { message }
  // - axios-like shapes
  return (
    e?.error?.message ||
    e?.response?.data?.error?.message ||
    e?.response?.data?.message ||
    e?.message ||
    "Request failed"
  );
}

function extractStatusCode(e: any) {
  return e?.statusCode || e?.status || e?.response?.status || 500;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CART_ID_COOKIE = "sf_cart_id";
const CART_TOKEN_COOKIE = "sf_cart_token";
const CART_REFRESH_COOKIE = "sf_cart_refresh";

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

async function readSession() {
  const jar = await cookies();
  const cartId = jar.get(CART_ID_COOKIE)?.value ?? null;
  const cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;
  const cartRefresh = jar.get(CART_REFRESH_COOKIE)?.value ?? null;
  return { cartId, cartToken, cartRefresh };
}

async function ensureCartSession() {
  const jar = await cookies();

  let cartId = jar.get(CART_ID_COOKIE)?.value ?? null;
  let cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;
  let cartRefresh = jar.get(CART_REFRESH_COOKIE)?.value ?? null;

  const session = await auth();
  const customerId = session?.user?.id ?? null;

  if (!cartId || !cartToken || !cartRefresh) {
    // create cart (backend must return guestToken + guestRefreshToken)
    const cart = await storefrontFetch<any>("/api/storefront/carts", {
      method: "POST",
      body: { channel: "online", currency: "NGN", customerId },
      cache: "no-store",
    });

    cartId = cart?.id ?? null;
    cartToken = cart?.guestToken ?? null;
    cartRefresh = cart?.guestRefreshToken ?? null;
  }

  return { cartId, cartToken, cartRefresh };
}

function sameAttrs(a: any, b: any) {
  const A = a ?? {};
  const B = b ?? {};
  const keys = Array.from(
    new Set([...Object.keys(A), ...Object.keys(B)]),
  ).sort();
  return keys.every((k) => String(A[k] ?? "") === String(B[k] ?? ""));
}

function findCartItemId(
  cart: any,
  productOrVariantId: string | number,
  attributes?: any,
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

function maybeUpdateAccessTokenCookie(res: NextResponse, headers: Headers) {
  const rotated = headers.get("x-cart-token");
  if (rotated) {
    res.cookies.set(CART_TOKEN_COOKIE, rotated, cookieOpts);
  }
}

function attachSessionCookies(
  res: NextResponse,
  s: { cartId: string; cartToken: string; cartRefresh: string },
) {
  res.cookies.set(CART_ID_COOKIE, s.cartId, cookieOpts);
  res.cookies.set(CART_TOKEN_COOKIE, s.cartToken, cookieOpts);
  res.cookies.set(CART_REFRESH_COOKIE, s.cartRefresh, cookieOpts);
}

// GET /api/cart
export async function GET() {
  const { cartId, cartToken, cartRefresh } = await readSession();

  if (!cartId || !cartToken || !cartRefresh) {
    return NextResponse.json(
      { cartId: null, items: [], subtotal: 0 },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const { data: items, headers } = await storefrontFetch<any[]>(
    `/api/storefront/carts/${cartId}/items`,
    {
      method: "GET",
      cartToken,
      cartRefreshToken: cartRefresh,
      includeMeta: true,
      cache: "no-store",
    },
  );

  const subtotal = Array.isArray(items)
    ? items.reduce((sum, it) => sum + Number(it.lineTotal ?? 0), 0)
    : 0;

  const res = NextResponse.json(
    { cartId, items: Array.isArray(items) ? items : [], subtotal },
    { headers: { "Cache-Control": "no-store" } },
  );

  maybeUpdateAccessTokenCookie(res, headers);
  return res;
}

// POST /api/cart (add)
export async function POST(req: Request) {
  try {
    const input = await req.json();

    if (!input?.slug) {
      return errorResponse(400, "Missing slug");
    }

    const session = await ensureCartSession();
    if (!session.cartId || !session.cartToken || !session.cartRefresh) {
      return errorResponse(500, "Unable to create cart");
    }

    const { data: cart, headers } = await storefrontFetch<any>(
      `/api/storefront/carts/${session.cartId}/items`,
      {
        method: "POST",
        cartToken: session.cartToken,
        cartRefreshToken: session.cartRefresh,
        includeMeta: true,
        cache: "no-store",
        body: {
          slug: input.slug,
          variantId: input.variantId ?? null,
          quantity: input.quantity ?? 1,
        },
      },
    );

    const res = NextResponse.json(cart, {
      headers: { "Cache-Control": "no-store" },
    });

    attachSessionCookies(res, {
      cartId: session.cartId,
      cartToken: session.cartToken,
      cartRefresh: session.cartRefresh,
    });

    maybeUpdateAccessTokenCookie(res, headers);
    return res;
  } catch (e: any) {
    const status = extractStatusCode(e);
    const msg = extractErrorMessage(e);
    return errorResponse(status, msg);
  }
}

// PATCH /api/cart
export async function PATCH(req: Request) {
  try {
    const { productOrVariantId, quantity, attributes } = await req.json();

    const session = await readSession();
    if (!session.cartId || !session.cartToken || !session.cartRefresh) {
      return errorResponse(401, "No cart session");
    }

    const { data: items, headers: itemsHeaders } = await storefrontFetch<any[]>(
      `/api/storefront/carts/${session.cartId}/items`,
      {
        method: "GET",
        cartToken: session.cartToken,
        cartRefreshToken: session.cartRefresh,
        includeMeta: true,
        cache: "no-store",
      },
    );

    const cartItemId = findCartItemId(
      { items },
      productOrVariantId,
      attributes,
    );
    if (!cartItemId) {
      const res = errorResponse(404, "Cart item not found");
      maybeUpdateAccessTokenCookie(res, itemsHeaders);
      return res;
    }

    const { data: updated, headers: updHeaders } = await storefrontFetch<any>(
      `/api/storefront/carts/${session.cartId}/items/${cartItemId}`,
      {
        method: "PATCH",
        cartToken: session.cartToken,
        cartRefreshToken: session.cartRefresh,
        includeMeta: true,
        cache: "no-store",
        body: { quantity },
      },
    );

    const res = NextResponse.json(updated, {
      headers: { "Cache-Control": "no-store" },
    });

    maybeUpdateAccessTokenCookie(res, itemsHeaders);
    maybeUpdateAccessTokenCookie(res, updHeaders);
    return res;
  } catch (e: any) {
    return errorResponse(extractStatusCode(e), extractErrorMessage(e));
  }
}

// DELETE /api/cart
export async function DELETE(req: Request) {
  const { productOrVariantId, attributes } = await req.json();

  const session = await readSession();
  if (!session.cartId || !session.cartToken || !session.cartRefresh) {
    return NextResponse.json({ error: "No cart session" }, { status: 401 });
  }

  // Fetch items (guard may refresh during this call)
  const { data: items, headers: itemsHeaders } = await storefrontFetch<any[]>(
    `/api/storefront/carts/${session.cartId}/items`,
    {
      method: "GET",
      cartToken: session.cartToken,
      cartRefreshToken: session.cartRefresh,
      includeMeta: true,
      cache: "no-store",
    },
  );

  const cartItemId = findCartItemId({ items }, productOrVariantId, attributes);
  if (!cartItemId) {
    const res = NextResponse.json(
      { error: "Cart item not found" },
      { status: 404 },
    );
    maybeUpdateAccessTokenCookie(res, itemsHeaders);
    return res;
  }

  // Delete item (guard may refresh during this call)
  const { data: updated, headers: delHeaders } = await storefrontFetch<any>(
    `/api/storefront/carts/${session.cartId}/items/${cartItemId}`,
    {
      method: "DELETE",
      cartToken: session.cartToken,
      cartRefreshToken: session.cartRefresh,
      includeMeta: true,
      cache: "no-store",
    },
  );

  const res = NextResponse.json(updated, {
    headers: { "Cache-Control": "no-store" },
  });

  // Persist rotated token from either call
  maybeUpdateAccessTokenCookie(res, itemsHeaders);
  maybeUpdateAccessTokenCookie(res, delHeaders);

  return res;
}
