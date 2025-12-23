import { listProducts } from "@/features/products/actions/products";
import { Product } from "@/features/products/types/products";
import { ProductRail } from "@/features/products/ui/product-rail";

export default async function BestSellersSlider() {
  const products = await listProducts({ limit: 6 });

  return (
    <ProductRail
      title="Best Sellers"
      subtitle="Customer favorites you’ll reach for every day."
      products={products as Product[]}
      sectionClassName="w-[95%] mx-auto py-8"
    />
  );
}
