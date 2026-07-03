import type { TopCategoriesSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import TopCategoriesClient from "./TopCategories.client";
import { listStorefrontCategories } from "@/features/Collections/actions/get-collections";

export default async function TopCategories({
  config,
}: {
  config: TopCategoriesSectionV1;
}) {
  const limit = 12; // or config.limit, etc.
  const categories = await listStorefrontCategories({ limit });

  return <TopCategoriesClient config={config} categories={categories} />;
}
