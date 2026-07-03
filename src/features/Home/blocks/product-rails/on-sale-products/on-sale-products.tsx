// src/features/Home/sections/on-sale-products-section.tsx
import type { OnSaleProductsSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import type { Product } from "@/features/Products/types/products";
import { ProductRail } from "@/features/Products/ui/ProductRail/product-rail";
import { listOnSaleProducts } from "@/features/Products/actions/product-discovery";

export default async function OnSaleProductsSection({
  config,
}: {
  config: OnSaleProductsSectionV1;
}) {
  if (config?.enabled === false) return null;

  const products = await listOnSaleProducts({
    limit: config?.limit ?? 6,
  });

  if (!products?.length) return null;

  return (
    <ProductRail
      title={config?.title ?? "On Sale"}
      subtitle={config?.subtitle ?? "Limited-time deals while stock lasts."}
      products={products as Product[]}
      sectionClassName={
        config.layout?.sectionClassName ?? "w-[95%] mx-auto py-8"
      }
    />
  );
}
