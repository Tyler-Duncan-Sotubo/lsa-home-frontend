/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { storefrontFetch } from "@/shared/api/fetch";

export async function POST() {
  try {
    const cartToken = (await cookies()).get("sf_cart_token")?.value ?? null;
    if (!cartToken) {
      return NextResponse.json(
        { ok: true, skipped: true, reason: "no_cart_token" },
        { status: 200 }
      );
    }

    const session = await auth();
    const accessToken = session?.backendTokens?.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { ok: true, skipped: true, reason: "not_authenticated" },
        { status: 200 }
      );
    }

    const cart = await storefrontFetch<any>("/api/storefront/carts/claim", {
      method: "POST",
      cartToken, // ✅ sends X-Cart-Token
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json({ ok: true, cart }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Claim failed" },
      { status: 500 }
    );
  }
}
