"use client";

import { useMemo, useState } from "react";
import type {
  Product,
  WooCategory,
} from "@/features/Pages/Products/types/products";
import { CollectionFiltersSidebar } from "@/features/Pages/Collections/ui/collection-filters";
import { ProductRail } from "@/features/Pages/Products/ui/product-rail";
import {
  applyCollectionFilters,
  CollectionFiltersState,
  getCollectionFilterMeta,
} from "../actions/filters";

import { CategoryAfterContent } from "@/features/Pages/Collections/ui/category-after-content";
import { CollectionsPageConfigV1 } from "@/config/types/pages/Collections/collections-page.types";
import { Breadcrumb } from "@/shared/seo/breadcrumb";
import { CollectionJsonLd } from "@/shared/seo/collection-json-ld";

function resolveTemplateRef(
  input: string | undefined,
  templates:
    | {
        descriptions?: Record<string, string>;
        afterContentHtml?: Record<string, string>;
      }
    | undefined
) {
  if (!input) return input;

  return input.replace(
    /\{\{\s*templates\.(descriptions|afterContentHtml)\.([a-zA-Z0-9_-]+)\s*\}\}/g,
    (_m, group: "descriptions" | "afterContentHtml", key: string) => {
      const dict =
        group === "descriptions"
          ? templates?.descriptions
          : templates?.afterContentHtml;

      return dict?.[key] ?? "";
    }
  );
}

function applyTemplate(template: string, vars: Record<string, string>) {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, v);
  }
  return out;
}

interface CollectionPageClientProps {
  category: WooCategory;
  products: Product[];
  collectionsConfig?: CollectionsPageConfigV1;
  storeName: string;
}

export function CollectionPageClient({
  category,
  products,
  collectionsConfig,
  storeName,
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

  const vars = useMemo(
    () => ({
      categoryName: category?.name ?? "",
      categorySlug: category?.slug ?? "",
      storeName,
    }),
    [category?.name, category?.slug, storeName]
  );

  const templates = collectionsConfig?.defaults?.templates;
  const bySlug = collectionsConfig?.bySlug;
  const slug = (category?.slug ?? "").toLowerCase();

  const description = useMemo(() => {
    const raw =
      bySlug?.[slug]?.description ?? collectionsConfig?.defaults?.description;

    const resolved = resolveTemplateRef(raw, templates);
    return resolved ? applyTemplate(resolved, vars) : undefined;
  }, [bySlug, slug, collectionsConfig?.defaults?.description, templates, vars]);

  const afterHtml = useMemo(() => {
    const raw =
      bySlug?.[slug]?.afterContentHtml ??
      collectionsConfig?.defaults?.afterContentHtml;

    const resolved = resolveTemplateRef(raw, templates);
    return resolved ? applyTemplate(resolved, vars) : undefined;
  }, [
    bySlug,
    slug,
    collectionsConfig?.defaults?.afterContentHtml,
    templates,
    vars,
  ]);

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: category?.name ?? "Collection" }, // last item has no href
    ],
    [category?.name]
  );

  const hubSeo =
    collectionsConfig?.seo?.collections?.[slug] ??
    collectionsConfig?.seo?.collections?.[slug.toLowerCase()] ??
    null;

  return (
    <section className="mx-auto w-[95%] space-y-6 py-8">
      <header className="flex flex-col gap-2 px-5">
        <Breadcrumb items={breadcrumbItems} />

        <CollectionJsonLd
          collection={{
            slug,
            name: category?.name ?? "Collection",
            description: hubSeo?.meta_description ?? description ?? "",
            imageUrl: products?.[0]?.images?.[0]?.src ?? undefined,
          }}
          products={filteredProducts}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-4xl font-semibold text-primary">
            {category?.name}
          </h1>

          {description && (
            <p className="text-primary text-base font-medium">{description}</p>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-16 md:grid-cols-[260px_minmax(0,1fr)]">
        <CollectionFiltersSidebar
          meta={meta}
          filters={filters}
          onChange={setFilters}
        />

        <div>
          <ProductRail
            products={filteredProducts}
            sectionClassName="w-full py-4"
            layout="wrap"
          />
        </div>
      </div>

      {afterHtml ? (
        <div className="border-t">
          <CategoryAfterContent html={afterHtml} ui={collectionsConfig?.ui} />
        </div>
      ) : null}
    </section>
  );
}
