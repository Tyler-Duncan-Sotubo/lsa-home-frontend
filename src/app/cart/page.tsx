import type { Metadata } from "next";
import { CartPageClient } from "@/features/cart/ui/cart-page-client";
import { getUpsellProducts } from "@/features/Products/actions/get-upsell-products";

export const metadata: Metadata = {
  title: "Your Cart",
};

// ✅ Needed so the random upsell pick below actually re-rolls per visit
// instead of being baked into a static render once.
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const relatedProducts = await getUpsellProducts(2);

  return <CartPageClient relatedProducts={relatedProducts} />;
}
