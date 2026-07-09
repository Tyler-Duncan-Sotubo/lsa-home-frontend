/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/cart/discount-code/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/shared/api/fetch";

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

async function readSession() {
  const jar = await cookies();
  const cartId = jar.get(CART_ID_COOKIE)?.value ?? null;
  const cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;
  const cartRefresh = jar.get(CART_REFRESH_COOKIE)?.value ?? null;
  return { cartId, cartToken, cartRefresh };
}

function clearCartCookies(res: NextResponse) {
  res.cookies.set(CART_ID_COOKIE, "", { ...cookieOpts, maxAge: 0 });
  res.cookies.set(CART_TOKEN_COOKIE, "", { ...cookieOpts, maxAge: 0 });
  res.cookies.set(CART_REFRESH_COOKIE, "", { ...cookieOpts, maxAge: 0 });
}

function maybeUpdateAccessTokenCookie(res: NextResponse, headers: Headers) {
  const rotated = headers.get("x-cart-token");
  if (rotated) {
    res.cookies.set(CART_TOKEN_COOKIE, rotated, cookieOpts);
  }
}

// POST /api/cart/discount-code — apply a code
export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return errorResponse(400, "Missing discount code");
    }

    const session = await readSession();
    if (!session.cartId || !session.cartToken || !session.cartRefresh) {
      return errorResponse(401, "No cart session");
    }

    const { data: updated, headers } = await storefrontFetch<any>(
      `/api/storefront/carts/${session.cartId}/discount-code`,
      {
        method: "POST",
        cartToken: session.cartToken,
        cartRefreshToken: session.cartRefresh,
        includeMeta: true,
        cache: "no-store",
        body: { code },
      },
    );

    const res = NextResponse.json(updated, {
      headers: { "Cache-Control": "no-store" },
    });
    maybeUpdateAccessTokenCookie(res, headers);
    return res;
  } catch (e: any) {
    if (isCartAuthError(e)) {
      const res = errorResponse(410, "Your cart session has expired");
      clearCartCookies(res);
      return res;
    }
    return errorResponse(extractStatusCode(e), extractErrorMessage(e));
  }
}

// DELETE /api/cart/discount-code — remove the applied code
export async function DELETE() {
  try {
    const session = await readSession();
    if (!session.cartId || !session.cartToken || !session.cartRefresh) {
      return errorResponse(401, "No cart session");
    }

    const { data: updated, headers } = await storefrontFetch<any>(
      `/api/storefront/carts/${session.cartId}/discount-code`,
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
    maybeUpdateAccessTokenCookie(res, headers);
    return res;
  } catch (e: any) {
    if (isCartAuthError(e)) {
      const res = errorResponse(410, "Your cart session has expired");
      clearCartCookies(res);
      return res;
    }
    return errorResponse(extractStatusCode(e), extractErrorMessage(e));
  }
}
