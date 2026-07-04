import { NextResponse } from "next/server";
import { storefrontFetchSafe } from "@/shared/api/fetch";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ message: "reference is required" }, { status: 400 });
  }

  const result = await storefrontFetchSafe<{
    verified: boolean;
    reference: string;
    status: string | null;
    amount: number | null;
    currency: string | null;
    paidAt: string | null;
    channel: string | null;
    customer: { email?: string } | null;
  }>(`/api/storefront/payment-links/${token}/verify?reference=${encodeURIComponent(reference)}`);

  if (!result.ok) {
    const err = result.error as any;
    return NextResponse.json(
      { message: err?.message ?? "Failed to verify payment" },
      { status: result.statusCode ?? 500 },
    );
  }

  return NextResponse.json(result.data);
}
