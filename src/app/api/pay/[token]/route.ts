import { NextResponse } from "next/server";
import { storefrontFetchSafe } from "@/shared/api/fetch";

type InitiatePaymentResponse = {
  status: boolean;
  message: string;
  data: {
    authorizationUrl: string | null;
    accessCode: string | null;
    reference: string;
  };
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const body = await req.json().catch(() => ({}));

  const result = await storefrontFetchSafe<InitiatePaymentResponse>(
    `/api/storefront/payment-links/${token}/pay`,
    {
      method: "POST",
      body,
    },
  );

  if (!result.ok) {
    const err = result.error as any;
    return NextResponse.json(
      { message: err?.message ?? "Failed to initialize payment" },
      { status: result.statusCode ?? 500 },
    );
  }

  return NextResponse.json(result.data);
}
