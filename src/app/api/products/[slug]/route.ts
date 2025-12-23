import { getProductBySlugWithVariations } from "@/features/products/actions/products";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const product = await getProductBySlugWithVariations(slug);
  if (!product)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}
