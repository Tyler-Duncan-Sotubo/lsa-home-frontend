// src/features/Home/sections/latest-products-section.tsx
import type { LatestProductsSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import type { Product } from "@/features/Products/types/products";
import { ProductRail } from "@/features/Products/ui/ProductRail/product-rail";
import { listLatestProducts } from "@/features/Products/actions/product-discovery";

export default async function LatestProductsSection({
  config,
}: {
  config: LatestProductsSectionV1;
}) {
  if (config?.enabled === false) return null;

  const products = await listLatestProducts({
    limit: config?.limit ?? 6,
    // if you later support categoryId in the endpoint:
    // categoryId: config?.categoryId,
  });

  if (!products?.length) return null;

  return (
    <ProductRail
      title={config?.title ?? "The Latest"}
      subtitle={config?.subtitle ?? "Just arrived and ready to ship."}
      products={products as Product[]}
      sectionClassName={
        config.layout?.sectionClassName ?? "w-[95%] mx-auto py-8"
      }
    />
  );
}
