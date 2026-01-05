// app/api/quotes/storefront-quotes/route.ts
import { submitStorefrontQuote } from "@/features/quote/actions/quotes";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  const res = await submitStorefrontQuote(body);

  if (!res.ok) {
    return NextResponse.json(
      { message: res.error ?? "Unable to submit quote" },
      { status: 400 }
    );
  }

  return NextResponse.json(res.data, { status: 200 });
}
