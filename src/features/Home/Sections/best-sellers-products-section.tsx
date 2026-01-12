// src/features/Home/sections/best-sellers-products-section.tsx
import type { BestSellersProductsSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import type { Product } from "@/features/Products/types/products";
import { ProductRail } from "@/features/Products/ui/ProductRail/product-rail";
import { listBestSellerProducts } from "@/features/Products/actions/product-discovery";

export default async function BestSellersProductsSection({
  config,
}: {
  config: BestSellersProductsSectionV1;
}) {
  if (config?.enabled === false) return null;

  const products = await listBestSellerProducts({
    limit: config?.limit ?? 6,
    windowDays: config?.windowDays ?? 30,
  });

  if (!products?.length) return null;

  return (
    <ProductRail
      title={config?.title ?? "Best Sellers"}
      subtitle={config?.subtitle ?? "Customer favorites and top performers."}
      products={products as Product[]}
      sectionClassName={
        config.layout?.sectionClassName ?? "w-[95%] mx-auto py-8"
      }
    />
  );
}
