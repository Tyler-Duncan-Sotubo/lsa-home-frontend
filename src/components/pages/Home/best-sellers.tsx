// src/components/sections/best-sellers-slider.tsx
import { ProductRail } from "@/components/products/product-rail";
import { getProducts } from "@/lib/woocommerce/products";

export default async function BestSellersSlider() {
  // You can tweak perPage, categoryId, etc.
  const products = await getProducts({ perPage: 12 });

  console.log("Best Sellers Products:", products);

  return (
    <ProductRail
      title="Best Sellers"
      subtitle="Customer favorites you’ll reach for every day."
      products={products}
      sectionClassName="w-[95%] mx-auto py-8"
    />
  );
}
