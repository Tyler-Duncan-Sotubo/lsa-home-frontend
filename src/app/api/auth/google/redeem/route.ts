import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storefrontFetch } from "@/shared/api/fetch";

const schema = z.object({ code: z.string().min(10) });

// Merchant-domain side: swap the broker's one-time code for the normal
// customer + token pair (tenant resolved from this request's host).
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const payload = await storefrontFetch<{
      customer: unknown;
      tokens: unknown;
    }>("/api/storefront/customers/oauth/google/redeem", {
      method: "POST",
      body: { code: parsed.data.code },
      cache: "no-store",
    });

    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Sign-in link expired — please try again" },
      { status: 401 },
    );
  }
}
