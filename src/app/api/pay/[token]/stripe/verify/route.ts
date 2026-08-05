import { NextResponse } from "next/server";
import { storefrontFetchSafe } from "@/shared/api/fetch";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { message: "sessionId is required" },
      { status: 400 },
    );
  }

  const result = await storefrontFetchSafe<{
    verified: boolean;
    reference: string;
    sessionId: string;
    paymentIntentId: string | null;
    status: string;
    amount: number | null;
    currency: string | null;
    paidAt: string | null;
  }>(
    `/api/storefront/payment-links/${token}/stripe/verify?sessionId=${encodeURIComponent(sessionId)}`,
  );

  if (!result.ok) {
    const err = result.error as any;
    return NextResponse.json(
      { message: err?.message ?? "Failed to verify payment" },
      { status: result.statusCode ?? 500 },
    );
  }

  return NextResponse.json(result.data);
}
