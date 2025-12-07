"use client";

import { useMemo, useState } from "react";
import type { Product, WooCategory } from "@/types/products";
import { ProductRail } from "@/components/products/product-rail";
import {
  applyCollectionFilters,
  getCollectionFilterMeta,
  type CollectionFiltersState,
} from "@/lib/woocommerce/filters";
import { CollectionFiltersSidebar } from "@/components/products/collections/collection-filters";
import { categoryDescriptions } from "@/constants/category-descriptions";
import { CategoryAfterContent } from "@/components/products/collections/CategoryAfterContent";
import ExploreMore from "@/components/products/collections/explore-more";

interface CollectionPageClientProps {
  category: WooCategory;
  products: Product[];
}

export function CollectionPageClient({
  category,
  products,
}: CollectionPageClientProps) {
  const meta = useMemo(() => getCollectionFilterMeta(products), [products]);

  const [filters, setFilters] = useState<CollectionFiltersState>({
    colors: [],
    sizes: [],
    tags: [],
  });

  const filteredProducts = useMemo(
    () => applyCollectionFilters(products, filters),
    [products, filters]
  );

  return (
    <section className="mx-auto w-[95%] space-y-6 py-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5">
        <h1 className="text-4xl font-semibold text-primary-foreground">
          {category.name}
        </h1>

        {categoryDescriptions[category.name] && (
          <p className="text-primary-foreground text-base font-medium">
            {categoryDescriptions[category.name]}
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
        <CollectionFiltersSidebar
          meta={meta}
          filters={filters}
          onChange={setFilters}
        />

        <div>
          <ProductRail
            products={filteredProducts}
            sectionClassName="w-full py-4"
          />
        </div>
      </div>

      <ExploreMore />
      <div className="border-t">
        <CategoryAfterContent categoryName={category.name} />
      </div>
    </section>
  );
}
