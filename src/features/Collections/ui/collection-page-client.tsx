"use client";

import { useMemo, useState } from "react";
import type { Product, WooCategory } from "@/features/Products/types/products";
import { CollectionFiltersSidebar } from "@/features/Collections/ui/collection-filters";
import { ProductRail } from "@/features/Products/ui/ProductRail/product-rail";
import {
  applyCollectionFilters,
  CollectionFiltersState,
  getCollectionFilterMeta,
} from "../actions/filters";

import { CategoryAfterContent } from "@/features/Collections/ui/category-after-content";
import { CollectionsPageConfigV1 } from "@/config/types/pages/Collections/collections-page.types";
import { Breadcrumb } from "@/shared/seo/breadcrumb";
import { CollectionJsonLd } from "@/shared/seo/collection-json-ld";

interface CollectionPageClientProps {
  category: WooCategory & {
    description?: string | null;
    afterContentHtml?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    imageUrl?: string | null;
    imageAltText?: string | null;
  };
  products: Product[];
  collectionsConfig?: CollectionsPageConfigV1; // keep for UI-only (optional)
}

export function CollectionPageClient({
  category,
  products,
  collectionsConfig,
}: CollectionPageClientProps) {
  const meta = useMemo(() => getCollectionFilterMeta(products), [products]);

  const [filters, setFilters] = useState<CollectionFiltersState>({
    colors: [],
    sizes: [],
    tags: [],
  });

  const filteredProducts = useMemo(
    () => applyCollectionFilters(products, filters),
    [products, filters],
  );

  const slug = (category?.slug ?? "").toLowerCase();

  // ✅ Now comes directly from API category
  const description =
    (category?.metaDescription ?? category?.description ?? undefined) ||
    undefined;

  const afterHtml = (category?.afterContentHtml ?? undefined) || undefined;

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: category?.name ?? "Collection" },
    ],
    [category?.name],
  );

  const jsonLdDescription =
    category?.metaDescription ?? category?.description ?? "";

  const jsonLdImage =
    category?.imageUrl ?? products?.[0]?.images?.[0]?.src ?? undefined;

  const hasFilters =
    (meta.allColors?.length ?? 0) > 0 ||
    (meta.allSizes?.length ?? 0) > 0 ||
    (meta.allTags?.length ?? 0) > 0;

  return (
    <section className="mx-auto w-[95%] space-y-6 py-8">
      <header className="flex flex-col gap-2 px-5">
        <Breadcrumb items={breadcrumbItems} />

        <CollectionJsonLd
          collection={{
            slug,
            name: category?.name ?? "Collection",
            description: jsonLdDescription,
            imageUrl: jsonLdImage,
          }}
          products={filteredProducts}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="md:text-4xl text-lg font-semibold text-primary">
            {category?.name}
          </h1>

          {description ? (
            <div className="md:w-1/2">
              <p className="text-primary md:text-base text-xs font-medium">
                {description}
              </p>
            </div>
          ) : null}
        </div>
      </header>

      {hasFilters ? (
        <div className="grid grid-cols-1 gap-16 md:grid-cols-[260px_minmax(0,1fr)]">
          <CollectionFiltersSidebar
            meta={meta}
            filters={filters}
            onChange={setFilters}
          />
          <ProductRail
            products={filteredProducts}
            sectionClassName="py-8"
            // layout="wrap"
          />
        </div>
      ) : (
        <div>
          <ProductRail
            products={filteredProducts}
            sectionClassName="w-full"
            layout="wrap"
          />
        </div>
      )}

      {afterHtml ? (
        <div className="border-t">
          {/* still use config only for renderer UI options (optional) */}
          <CategoryAfterContent html={afterHtml} ui={collectionsConfig?.ui} />
        </div>
      ) : null}
    </section>
  );
}
