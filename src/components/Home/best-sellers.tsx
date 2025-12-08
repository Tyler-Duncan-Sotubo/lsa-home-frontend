// src/components/sections/best-sellers-slider.tsx
import { ProductRail } from "@/components/products/product-rail";
import { getBestSellingProducts } from "@/lib/woocommerce/products";

export default async function BestSellersSlider() {
  const products = await getBestSellingProducts({ perPage: 12 });

  return (
    <ProductRail
      title="Best Sellers"
      subtitle="Customer favorites you’ll reach for every day."
      products={products}
      sectionClassName="w-[95%] mx-auto py-8"
    />
  );
}
