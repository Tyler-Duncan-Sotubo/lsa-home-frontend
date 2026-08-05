import { NextResponse } from "next/server";
import { storefrontFetchSafe } from "@/shared/api/fetch";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const result = await storefrontFetchSafe<{
    payment: {
      id: string;
      status: string;
      method: string;
      currency: string;
      amountMinor: number;
    };
    bankDetails: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      instructions?: string | null;
    };
  }>(`/api/storefront/payment-links/${token}/bank-transfer`, {
    method: "POST",
  });

  if (!result.ok) {
    const err = result.error as any;
    return NextResponse.json(
      { message: err?.message ?? "Failed to initialize bank transfer" },
      { status: result.statusCode ?? 500 },
    );
  }

  return NextResponse.json(result.data);
}
