/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { getBaseUrl } from "@/shared/seo/baseurl";
import { getCollectionProductsGroupedBySlug } from "@/features/Pages/Collections/actions/get-collections";
import { CollectionsHubPageClient } from "@/features/Pages/Collections/ui/collections-hub-page-client";

function titleFromSlug(slug: string) {
  // "all-baths" -> "Baths"
  const pretty = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/^All\s+/i, "");

  return pretty || "Collections";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const [config, groups] = await Promise.all([
    getStorefrontConfig(),
    getCollectionProductsGroupedBySlug(slug, {
      perPage: 8,
      page: 1,
      includeChildren: true,
    }),
  ]);

  const hubTitle = titleFromSlug(slug);
  const hubKey = slug.toLowerCase();
  const storeName = config.store?.name ?? "Store";

  const hubSeo =
    config.pages?.collections?.seo?.collections?.[hubKey] ??
    config.pages?.collections?.seo?.collections?.[hubTitle.toLowerCase()] ??
    null;

  // if hub not found, noindex it
  if (!groups || groups.length === 0) {
    const baseUrl = getBaseUrl();
    const canonical = baseUrl
      ? `${baseUrl}/collections/hubs/${encodeURIComponent(slug)}`
      : `/collections/hubs/${encodeURIComponent(slug)}`;

    return {
      title: `${hubTitle} | ${storeName}`,
      robots: { index: false, follow: false },
      alternates: { canonical },
    };
  }

  // Optional OG fallback from first product in first group
  const ogFallback =
    groups?.[0]?.products?.[0]?.images?.[0]?.src ??
    config.seo?.ogImage?.url ??
    undefined;

  const pageSeo = {
    title: hubSeo?.meta_title ?? `${hubTitle} | ${storeName}`,

    description:
      hubSeo?.meta_description ??
      `Explore our full ${hubTitle.toLowerCase()} collection at ${storeName}.`,

    ogImage: hubSeo?.og_image?.url
      ? {
          url: hubSeo.og_image.url,
          alt: hubSeo.og_image.alt ?? hubTitle,
        }
      : ogFallback
      ? { url: ogFallback, alt: hubTitle }
      : undefined,
  };

  const base = buildMetadata({
    globalSeo: config.seo,
    pageSeo,
  });

  const baseUrl = getBaseUrl();
  const canonical = baseUrl
    ? `${baseUrl}/collections/hubs/${slug}`
    : `/collections/hubs/${slug}`;

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

  const [config, groups] = await Promise.all([
    getStorefrontConfig(),
    getCollectionProductsGroupedBySlug(slug, {
      perPage: 8,
      page: 1,
      includeChildren: true,
    }),
  ]);

  if (!groups || groups.length === 0) return notFound();

  return (
    <CollectionsHubPageClient
      slug={slug}
      groups={groups as any}
      storeName={config.store?.name ?? "Store"}
      config={config}
    />
  );
}
