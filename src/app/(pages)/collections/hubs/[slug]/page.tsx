/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { getBaseUrl } from "@/shared/seo/baseurl";
import { getCollectionProductsGroupedBySlug } from "@/features/Collections/actions/get-collections";
import { CollectionsHubPageClient } from "@/features/Collections/ui/collections-hub-page-client";

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

  const baseUrl = getBaseUrl();
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

  const [config, hub] = await Promise.all([
    getStorefrontConfig(),
    getCollectionProductsGroupedBySlug(slug, {
      perPage: 8,
      page: 1,
      includeChildren: true,
    }),
  ]);

  const parent = hub?.parent ?? null;
  const groups = hub?.groups ?? [];
  const exploreMore = hub?.exploreMore ?? [];

  if (!parent || groups.length === 0) return notFound();

  return (
    <CollectionsHubPageClient
      slug={slug}
      parent={parent as any}
      groups={groups as any}
      exploreMore={exploreMore as any}
      storeName={config.store?.name ?? "Store"}
      config={config}
    />
  );
}
