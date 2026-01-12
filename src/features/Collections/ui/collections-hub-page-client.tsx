/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useMemo } from "react";
import { ProductRailSkeleton } from "@/features/Products/ui/ProductRail/product-rail-skeleton";
import { ProductRail } from "@/features/Products/ui/ProductRail/product-rail";
import { Breadcrumb } from "@/shared/seo/breadcrumb";
import { CollectionJsonLd } from "@/shared/seo/collection-json-ld";
import { CategoryAfterContent } from "@/features/Collections/ui/category-after-content";
import { ExploreMoreCard } from "./explore-more-category-card";

type HubParent = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  afterContentHtml?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  imageUrl?: string | null;
  imageAltText?: string | null;
};

type HubCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  afterContentHtml?: string | null;
  imageUrl?: string | null;
  imageAltText?: string | null;
};

type HubGroup = { category: HubCategory; products: any[] };

type ExploreMoreItem = {
  id: string;
  name: string;
  imageUrl: string | null;
};

export function CollectionsHubPageClient({
  slug,
  parent,
  groups,
  exploreMore,
  storeName,
  config,
}: {
  slug: string;
  parent: HubParent;
  groups: HubGroup[];
  exploreMore: ExploreMoreItem[];
  storeName: string;
  config: any; // keep only for ui props if needed
}) {
  const title = parent?.name ?? slug;

  const breadcrumbItems = useMemo(
    () => [{ label: "Home", href: "/" }, { label: title }],
    [title]
  );

  const description =
    parent?.metaDescription ??
    parent?.description ??
    `Explore our full ${title.toLowerCase()} collection at ${storeName}.`;

  const imageUrl =
    parent?.imageUrl ??
    groups?.[0]?.products?.[0]?.images?.[0]?.src ??
    undefined;

  const productsForJsonLd = useMemo(
    () => (groups ?? []).flatMap((g) => g.products ?? []),
    [groups]
  );
  return (
    <div className="w-[95%] mx-auto py-10 space-y-10">
      <header>
        <Breadcrumb items={breadcrumbItems} />

        <CollectionJsonLd
          basePath="/collections/hubs"
          collection={{
            slug,
            name: title,
            description,
            imageUrl,
          }}
          products={productsForJsonLd}
        />

        <h1 className="text-3xl md:text-4xl font-semibold capitalize">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 text-muted-foreground">{description}</p>
        ) : null}
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
              collections={category.slug}
            />
          </Suspense>
        )
      )}

      {/* ✅ Explore More (from API) */}
      {exploreMore?.length ? (
        <section className="pt-10 space-y-6">
          <header>
            <h2 className="text-3xl font-semibold text-center mb-10">
              Explore more
            </h2>
          </header>

          <div
            className={[
              "grid gap-6",
              config?.pages?.collections?.ui?.exploreMoreColumns === 3
                ? "md:grid-cols-3"
                : "md:grid-cols-2",
            ].join(" ")}
          >
            {exploreMore.slice(0, 3).map((item) => (
              <ExploreMoreCard
                key={item.id}
                item={
                  {
                    // adapt to your card props if needed
                    id: item.id,
                    name: item.name,
                    imageUrl: item.imageUrl,
                    href: `/collections/${item.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`, // if your card expects href, better to return slug from API
                  } as any
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* ✅ Hub after content (from API parent) */}
      {parent?.afterContentHtml ? (
        <div className="border-t">
          <CategoryAfterContent
            html={parent.afterContentHtml}
            ui={config?.pages?.collections?.ui}
          />
        </div>
      ) : null}
    </div>
  );
}
