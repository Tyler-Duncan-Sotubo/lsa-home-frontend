import { initializeStorefrontPaystack } from "@/features/checkout/actions/paystack";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  const res = await initializeStorefrontPaystack(body);

  if (!res.ok) {
    return NextResponse.json(
      { message: res.error ?? "Unable to initialize payment" },
      { status: 400 },
    );
  }

  return NextResponse.json(res.data, { status: 200 });
}
