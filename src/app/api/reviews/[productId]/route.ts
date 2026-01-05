// app/api/reviews/[productId]/route.ts
import { submitProductReview } from "@/features/reviews/actions/create-product-review";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ productId: string }> }
) {
  const { productId } = await ctx.params;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  const { rating, review, name, email, slug } = body ?? {};
  const payload = { rating, review, name, email, slug };

  const res = await submitProductReview(productId, payload);

  if (!res.ok) {
    return NextResponse.json(
      { message: res.error ?? "Unable to submit review" },
      { status: res.status ?? 400 }
    );
  }

  return NextResponse.json(res.data, { status: 200 });
}
