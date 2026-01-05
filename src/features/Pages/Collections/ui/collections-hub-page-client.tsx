/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useMemo } from "react";
import { ProductRailSkeleton } from "@/features/Pages/Products/ui/product-rail-skeleton";
import { ProductRail } from "@/features/Pages/Products/ui/product-rail";
import { Breadcrumb } from "@/shared/seo/breadcrumb";
import { CollectionJsonLd } from "@/shared/seo/collection-json-ld";
import { CategoryAfterContent } from "@/features/Pages/Collections/ui/category-after-content";
import {
  ExploreMoreBlockV1,
  ExploreMoreItemV1,
} from "@/config/types/pages/Collections/collections-page.types";
import { ExploreMoreCard } from "./explore-more-category-card";

// Minimal shapes (you can replace with your real types)
type HubCategory = { id: string; name: string; slug: string };
type HubGroup = { category: HubCategory; products: any[] };

function titleFromSlug(slug: string) {
  const pretty = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/^All\s+/i, "");

  return pretty || "Collections";
}

// ✅ same helpers as your Collection page
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

export function CollectionsHubPageClient({
  slug,
  groups,
  storeName,
  config,
}: {
  slug: string;
  groups: HubGroup[];
  storeName: string;
  config: any;
}) {
  const title = useMemo(() => titleFromSlug(slug), [slug]);

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: title }, // no /collections index
    ],
    [title]
  );

  const hubSeo =
    config?.pages?.collections?.seo?.collections?.[slug] ??
    config?.pages?.collections?.seo?.collections?.[slug.toLowerCase()] ??
    null;

  // ✅ afterContentHtml for hub
  const templates = config?.pages?.collections?.defaults?.templates;

  const vars = useMemo(
    () => ({
      categoryName: title, // for hubs, use the hub title as "categoryName"
      categorySlug: slug,
      storeName,
    }),
    [title, slug, storeName]
  );

  const afterHtml = useMemo(() => {
    // Try hub-specific afterContentHtml first, then fallback to defaults
    const raw =
      config?.pages?.collections?.bySlug?.[slug.toLowerCase()]
        ?.afterContentHtml ??
      config?.pages?.collections?.defaults?.afterContentHtml;

    const resolved = resolveTemplateRef(raw, templates);
    return resolved ? applyTemplate(resolved, vars) : undefined;
  }, [config, slug, templates, vars]);

  const collections = config?.pages?.collections;
  const currentHref = `/collections/hubs/${slug}`.toLowerCase();

  const exploreMore: ExploreMoreBlockV1 | undefined =
    config?.pages?.collections?.exploreMore;
  const exploreMoreEnabled = !!exploreMore?.enabled;
  // filter out current collection + limit to 3
  const exploreItems = (exploreMore?.items ?? [])
    .filter((item) => (item.href ?? "").toLowerCase() !== currentHref)
    .slice(0, 3);

  return (
    <div className="w-[95%] mx-auto py-10 space-y-10">
      <header>
        <Breadcrumb items={breadcrumbItems} />

        <CollectionJsonLd
          basePath="/collections/hubs"
          collection={{
            slug,
            name: title,
            description:
              hubSeo?.meta_description ??
              `Explore our full ${title.toLowerCase()} collection at ${storeName}.`,
            imageUrl: groups?.[0]?.products?.[0]?.images?.[0]?.src ?? undefined,
          }}
          products={(groups ?? []).flatMap((g) => g.products ?? [])}
        />

        <h1 className="text-3xl md:text-4xl font-semibold capitalize">
          {title}
        </h1>

        <p className="mt-2 text-muted-foreground">
          Explore our full {title.toLowerCase()} collection at {storeName}.
        </p>
      </header>

      {groups.map(({ category, products }) =>
        !products || products.length === 0 ? null : (
          <Suspense
            key={category.id}
            fallback={<ProductRailSkeleton sectionClassName="w-full py-8" />}
          >
            <ProductRail
              title={category.name}
              subtitle={undefined}
              products={products}
              sectionClassName="w-full py-8"
              collections={category.name.toLowerCase().replace(/\s+/g, "-")}
            />
          </Suspense>
        )
      )}

      {exploreMoreEnabled && exploreItems.length ? (
        <section className="pt-10 space-y-6">
          <header>
            {exploreMore.heading ? (
              <h2 className="text-3xl font-semibold text-center mb-10">
                {exploreMore.heading}
              </h2>
            ) : null}
          </header>

          <div
            className={[
              "grid gap-6",
              collections?.ui?.exploreMoreColumns === 3
                ? "md:grid-cols-3"
                : "md:grid-cols-2", // default to 2
            ].join(" ")}
          >
            {exploreItems.map((item: ExploreMoreItemV1) => (
              <ExploreMoreCard key={item.href} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ✅ Hub after content */}
      {afterHtml ? (
        <div className="border-t">
          <CategoryAfterContent
            html={afterHtml}
            ui={config?.pages?.collections?.ui}
          />
        </div>
      ) : null}
    </div>
  );
}
