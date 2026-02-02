/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { getCollectionProductsGroupedBySlug } from "@/features/Collections/actions/get-collections";
import { CollectionsHubPageClient } from "@/features/Collections/ui/collections-hub-page-client";
import { getRequestBaseUrl } from "@/shared/seo/get-request-base-url";
import { CollectionJsonLd } from "@/shared/seo/collection-json-ld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const [config, hub] = await Promise.all([
    getStorefrontConfig(),
    getCollectionProductsGroupedBySlug(slug, {
      perPage: 8,
      page: 1,
      includeChildren: true,
    }),
  ]);

  const storeName = config.store?.name ?? "Store";

  const baseUrl = await getRequestBaseUrl();
  const canonical = baseUrl
    ? `${baseUrl}/collections/hubs/${encodeURIComponent(slug)}`
    : `/collections/hubs/${encodeURIComponent(slug)}`;

  const parent = hub?.parent ?? null;
  const groups = hub?.groups ?? [];

  if (!parent || groups.length === 0) {
    return {
      title: `${slug} | ${storeName}`,
      robots: { index: false, follow: false },
      alternates: { canonical },
    };
  }

  const title = parent.metaTitle ?? `${parent.name} | ${storeName}`;
  const description =
    parent.metaDescription ??
    parent.description ??
    `Explore our full ${parent.name.toLowerCase()} collection at ${storeName}.`;

  const ogFallback =
    parent.imageUrl ??
    groups?.[0]?.products?.[0]?.images?.[0]?.src ??
    config.seo?.ogImage?.url ??
    undefined;

  const pageSeo = {
    title,
    description,
    ogImage: ogFallback
      ? { url: ogFallback, alt: parent.imageAltText ?? parent.name }
      : undefined,
  };

  const base = buildMetadata({
    globalSeo: config.seo,
    pageSeo,
  });

  return {
    ...base,
    alternates: { canonical },
  };
}

export default async function CollectionsHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [config, hub, baseUrl] = await Promise.all([
    getStorefrontConfig(),
    getCollectionProductsGroupedBySlug(slug, {
      perPage: 8,
      page: 1,
      includeChildren: true,
    }),
    getRequestBaseUrl(),
  ]);

  const storeName = config.store?.name ?? "Store";

  const parent = hub?.parent ?? null;
  const groups = hub?.groups ?? [];
  const exploreMore = hub?.exploreMore ?? [];

  if (!parent || groups.length === 0) return notFound();

  // These were previously only in generateMetadata, but you use them here too.
  const title = parent.metaTitle ?? `${parent.name} | ${storeName}`;
  const description =
    parent.metaDescription ??
    parent.description ??
    `Explore our full ${parent.name.toLowerCase()} collection at ${storeName}.`;

  const imageUrl =
    parent.imageUrl ??
    groups?.[0]?.products?.[0]?.images?.[0]?.src ??
    undefined;

  // ✅ No useMemo in a Server Component — compute directly
  const productsForJsonLd = groups.flatMap((g) => g.products ?? []);

  return (
    <>
      <CollectionJsonLd
        basePath="/collections/hubs"
        collection={{
          slug,
          name: title,
          description,
          imageUrl,
        }}
        products={productsForJsonLd}
        baseUrl={baseUrl}
      />

      <CollectionsHubPageClient
        slug={slug}
        parent={parent as any}
        groups={groups as any}
        exploreMore={exploreMore as any}
        storeName={storeName}
        config={config}
      />
    </>
  );
}
