import { NextResponse } from "next/server";
import { storefrontFetchSafe } from "@/shared/api/fetch";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const result = await storefrontFetchSafe<{
    storeId: string;
    methods: Array<Record<string, unknown>>;
  }>(`/api/storefront/payment-links/${token}/methods`);

  if (!result.ok) {
    const err = result.error as any;
    return NextResponse.json(
      { message: err?.message ?? "Failed to load payment methods" },
      { status: result.statusCode ?? 500 },
    );
  }

  return NextResponse.json(result.data);
}
