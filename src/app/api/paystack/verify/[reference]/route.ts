// app/api/payments/paystack/verify/[reference]/route.ts
import { verifyStorefrontPaystack } from "@/features/checkout/actions/paystack";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ reference: string }> },
) {
  const { reference } = await context.params;

  if (!reference) {
    return NextResponse.json(
      { message: "Reference is required" },
      { status: 400 },
    );
  }

  const res = await verifyStorefrontPaystack(reference);

  if (!res.ok) {
    return NextResponse.json(
      { message: res.error ?? "Unable to verify payment" },
      { status: 400 },
    );
  }

  return NextResponse.json(res.data, { status: 200 });
}
