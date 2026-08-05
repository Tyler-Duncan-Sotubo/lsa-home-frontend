import { verifyStorefrontStripe } from "@/features/checkout/actions/stripe";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;

  if (!sessionId) {
    return NextResponse.json(
      { message: "sessionId is required" },
      { status: 400 },
    );
  }

  const res = await verifyStorefrontStripe(sessionId);

  if (!res.ok) {
    return NextResponse.json(
      { message: res.error ?? "Unable to verify payment" },
      { status: 400 },
    );
  }

  return NextResponse.json(res.data, { status: 200 });
}
