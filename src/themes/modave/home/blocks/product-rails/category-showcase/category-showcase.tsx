import type { CategoryShowcaseSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import type { Product } from "@/features/Products/types/products";
import { ProductRail } from "@/themes/modave/product/ProductRail/product-rail";
import { listProducts } from "@/features/Products/actions/products";

export default async function CategoryShowcaseSection({
  config,
}: {
  config: CategoryShowcaseSectionV1;
}) {
  if (config?.enabled === false) return null;
  if (!config?.categoryId) return null;

  const products = await listProducts({
    categoryId: config.categoryId,
    limit: config.limit ?? 6,
  });

  if (!products?.length) return null;

  return (
    <ProductRail
      title={config.title}
      subtitle={config.subtitle}
      products={products as Product[]}
      collections={config.categorySlug}
      layout={config.display === "grid" ? "wrap" : "rail"}
      sectionClassName={
        config.layout?.sectionClassName ?? "w-[95%] mx-auto py-8"
      }
    />
  );
}
