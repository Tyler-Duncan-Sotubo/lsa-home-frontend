/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/cart/bundle-items/route.ts
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

function isCartAuthError(e: any) {
  const status = extractStatusCode(e);
  return status === 401 || status === 403;
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

async function ensureCartSession() {
  const jar = await cookies();

  let cartId = jar.get(CART_ID_COOKIE)?.value ?? null;
  let cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;
  let cartRefresh = jar.get(CART_REFRESH_COOKIE)?.value ?? null;

  const session = await auth();
  const customerId = session?.user?.id ?? null;

  if (!cartId || !cartToken || !cartRefresh) {
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

async function createFreshCart(customerId: string | null) {
  const cart = await storefrontFetch<any>("/api/storefront/carts", {
    method: "POST",
    body: { channel: "online", currency: "NGN", customerId },
    cache: "no-store",
  });

  return {
    cartId: cart?.id ?? null,
    cartToken: cart?.guestToken ?? null,
    cartRefresh: cart?.guestRefreshToken ?? null,
  };
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

// POST /api/cart/bundle-items (add a configured bundle as one cart line)
export async function POST(req: Request) {
  try {
    const input = await req.json();

    if (!input?.bundleProductId || !Array.isArray(input?.selections)) {
      return errorResponse(400, "Missing bundleProductId or selections");
    }

    let session = await ensureCartSession();
    if (!session.cartId || !session.cartToken || !session.cartRefresh) {
      return errorResponse(500, "Unable to create cart");
    }

    const addBundleItem = (s: typeof session) =>
      storefrontFetch<any>(
        `/api/storefront/carts/${s.cartId}/bundle-items`,
        {
          method: "POST",
          cartToken: s.cartToken,
          cartRefreshToken: s.cartRefresh,
          includeMeta: true,
          cache: "no-store",
          body: {
            bundleProductId: input.bundleProductId,
            quantity: input.quantity ?? 1,
            selections: input.selections,
          },
        },
      );

    let data: any;
    let headers: Headers;
    try {
      ({ data, headers } = await addBundleItem(session));
    } catch (e: any) {
      if (!isCartAuthError(e)) throw e;

      const authSession = await auth();
      session = await createFreshCart(authSession?.user?.id ?? null);
      if (!session.cartId || !session.cartToken || !session.cartRefresh) {
        return errorResponse(500, "Unable to create cart");
      }

      ({ data, headers } = await addBundleItem(session));
    }

    const res = NextResponse.json(data, {
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
