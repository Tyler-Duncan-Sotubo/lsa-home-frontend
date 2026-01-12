// src/features/Home/sections/product-tabs-rail-section.tsx
import type { ProductTabsSectionV1 } from "@/config/types/pages/Home/home-sections.types";
import type { Product } from "@/features/Products/types/products";
import { ProductRailTabs } from "@/features/Products/ui/ProductTabsRail/product-rail-tabs";

import {
  listBestSellerProducts,
  listLatestProducts,
  listOnSaleProducts,
} from "@/features/Products/actions/product-discovery";

type TabKey = "latest" | "onSale" | "bestSellers";

export default async function ProductTabsRailSection({
  config,
}: {
  config: ProductTabsSectionV1;
}) {
  if (config?.enabled === false) return null;

  const defaultLimit = config?.tabs?.[0]?.limit ?? 6;

  // Fetch each tab in parallel, respecting per-tab config
  const results = await Promise.all(
    (config.tabs ?? []).map(async (t) => {
      const limit = t.limit ?? defaultLimit;

      if (t.key === "latest") {
        const products = await listLatestProducts({
          limit,
          // if you later support categoryId on the endpoint, pass it here.
          // categoryId: t.categoryId,
        });

        return { key: t.key, label: t.label, products: products as Product[] };
      }

      if (t.key === "onSale") {
        const products = await listOnSaleProducts({ limit });
        return { key: t.key, label: t.label, products: products as Product[] };
      }

      if (t.key === "bestSellers") {
        const products = await listBestSellerProducts({
          limit,
          windowDays: t.windowDays ?? 30,
        });

        return { key: t.key, label: t.label, products: products as Product[] };
      }

      return {
        key: t.key as TabKey,
        label: t.label,
        products: [] as Product[],
      };
    })
  );

  const tabs = results.filter((t) => t.products?.length);

  if (!tabs.length) return null;

  return (
    <ProductRailTabs
      title={config.title ?? "Shop"}
      subtitle={config.subtitle ?? "Browse what’s trending right now."}
      tabs={tabs}
      sectionClassName={
        config.layout?.sectionClassName ?? "w-[95%] mx-auto py-8"
      }
    />
  );
}
