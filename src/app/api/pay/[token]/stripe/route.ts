import { NextResponse } from "next/server";
import { storefrontFetchSafe } from "@/shared/api/fetch";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const body = await req.json().catch(() => null);

  if (!body?.successUrl || !body?.cancelUrl) {
    return NextResponse.json(
      { message: "successUrl and cancelUrl are required" },
      { status: 400 },
    );
  }

  const result = await storefrontFetchSafe<{
    status: boolean;
    message: string;
    data: {
      checkoutUrl: string | null;
      sessionId: string | null;
      reference: string;
    };
  }>(`/api/storefront/payment-links/${token}/stripe/pay`, {
    method: "POST",
    body,
  });

  if (!result.ok) {
    const err = result.error as any;
    return NextResponse.json(
      { message: err?.message ?? "Failed to initialize payment" },
      { status: result.statusCode ?? 500 },
    );
  }

  return NextResponse.json(result.data.data);
}
