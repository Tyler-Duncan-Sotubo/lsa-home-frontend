/* eslint-disable @typescript-eslint/no-explicit-any */
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { Metadata } from "next";
import { getBaseUrl } from "@/shared/seo/baseurl";
import { listCollectionProducts } from "@/features/Pages/Collections/actions/get-collections";
import { CollectionPageClient } from "@/features/Pages/Collections/ui/collection-page-client";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// ✅ keep as a helper so both functions behave the same
async function loadCollectionPage(slug: string) {
  const config = await getStorefrontConfig();
  const data = await listCollectionProducts(slug, {
    perPage: 24,
    includeChildren: true,
  });

  return { config, data };
}

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

  const { config, data } = await loadCollectionPage(slug);

  const hubTitle = titleFromSlug(slug);
  const hubKey = slug.toLowerCase();
  const storeName = config.store?.name ?? "Store";

  const hubSeo =
    config.pages?.collections?.seo?.collections?.[hubKey] ??
    config.pages?.collections?.seo?.collections?.[hubTitle.toLowerCase()] ??
    null;

  // if hub not found, noindex it
  if (!data) {
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
    data.products?.[0]?.images?.[0]?.src ??
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

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const { config, data } = await loadCollectionPage(slug);

  if (!data || data.products.length === 0) return notFound();

  return (
    <CollectionPageClient
      category={data.category as any}
      products={data.products}
      collectionsConfig={config.pages?.collections}
      storeName={config.store.name}
    />
  );
}
