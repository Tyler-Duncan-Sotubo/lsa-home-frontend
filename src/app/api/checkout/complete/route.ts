/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontFetch } from "@/shared/api/fetch";
import { proxyStorefront } from "@/shared/api/storefront-proxy";

const CART_ID_COOKIE = "sf_cart_id";
const CART_TOKEN_COOKIE = "sf_cart_token";

export async function POST(req: Request) {
  const jar = await cookies();

  const cartToken = jar.get(CART_TOKEN_COOKIE)?.value ?? null;
  if (!cartToken) {
    return NextResponse.json({ error: "No cart session" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { checkoutId, paymentMethodType, paymentProvider } = body ?? {};

  if (!checkoutId) {
    return NextResponse.json({ error: "Missing checkoutId" }, { status: 400 });
  }

  if (!paymentMethodType) {
    return NextResponse.json(
      { error: "Missing paymentMethodType" },
      { status: 400 },
    );
  }

  return proxyStorefront(async () => {
    // 1) Refresh checkout (idempotent)
    // your backend should return either:
    // { refreshed:false, checkoutId: oldId } OR { refreshed:true, checkoutId: newId, previousCheckoutId: oldId }
    const refreshResult = await storefrontFetch<any>(
      `/api/storefront/checkouts/${checkoutId}/refresh`,
      {
        method: "POST",
        cartToken,
        cache: "no-store",
      },
    );

    const effectiveCheckoutId = refreshResult?.checkoutId ?? checkoutId;

    // 2) Lock checkout
    await storefrontFetch(
      `/api/storefront/checkouts/${effectiveCheckoutId}/lock`,
      {
        method: "PATCH",
        cartToken,
        cache: "no-store",
      },
    );

    // 3) Complete
    const order = await storefrontFetch<any>(
      `/api/storefront/checkouts/${effectiveCheckoutId}/complete`,
      {
        method: "POST",
        cartToken,
        cache: "no-store",
        body: {
          paymentMethodType,
          paymentProvider: paymentProvider ?? null,
        },
      },
    );

    // 4) Reset cart session (only after success)
    jar.delete(CART_ID_COOKIE);
    jar.delete(CART_TOKEN_COOKIE);

    return order;
  });
}
