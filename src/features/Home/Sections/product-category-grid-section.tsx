import type { ProductCategoryGridSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import { listStorefrontCategories } from "@/features/Collections/actions/get-collections";
import ProductCategoryGridClient from "./product-category-grid.client";

export default async function ProductCategoryGridSection({
  config,
}: {
  config: ProductCategoryGridSectionV1;
}) {
  if (config.enabled === false) return null;

  const limit = 6; // if you have it, else hardcode
  const categories = await listStorefrontCategories({ limit });

  console.log("Fetched categories for ProductCategoryGridSection:", categories);

  return <ProductCategoryGridClient config={config} categories={categories} />;
}
