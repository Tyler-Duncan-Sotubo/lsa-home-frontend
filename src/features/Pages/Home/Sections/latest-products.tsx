import { LatestProductsSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import { listProducts } from "@/features/Pages/Products/actions/products";
import { Product } from "@/features/Pages/Products/types/products";
import { ProductRail } from "@/features/Pages/Products/ui/product-rail";

export default async function LatestSlider({
  config,
}: {
  config?: LatestProductsSectionV1;
}) {
  if (config?.enabled === false) return null;

  const products = await listProducts({
    limit: config?.limit ?? 6,
    categoryId: config?.categoryId ?? "019b4844-4547-7b8f-b6eb-db92cfd4d10e",
  });

  if (!products?.length) return null;

  return (
    <ProductRail
      title={config?.title ?? "The Latest"}
      subtitle={config?.subtitle ?? "Just arrived and ready to ship."}
      products={products as Product[]}
      sectionClassName="w-[95%] mx-auto py-8"
    />
  );
}
