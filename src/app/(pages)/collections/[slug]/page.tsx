/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { Metadata } from "next";
import { getBaseUrl } from "@/shared/seo/baseurl";
import { listCollectionProducts } from "@/features/Collections/actions/get-collections";
import { CollectionPageClient } from "@/features/Collections/ui/collection-page-client";
import { notFound } from "next/navigation";
import { CollectionPageSkeleton } from "@/features/skeletons/collection-page.skeleton";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// ✅ keep as a helper so both functions behave the same
async function loadCollectionPage(slug: string) {
  const config = await getStorefrontConfig();
  const data = await listCollectionProducts(slug, {
    perPage: 50,
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
  const storeName = config.store?.name ?? "Store";

  const baseUrl = getBaseUrl();
  const canonical = baseUrl
    ? `${baseUrl}/collections/hubs/${encodeURIComponent(slug)}`
    : `/collections/hubs/${encodeURIComponent(slug)}`;

  // If hub not found, noindex it
  if (!data) {
    return {
      title: `${hubTitle} | ${storeName}`,
      robots: { index: false, follow: false },
      alternates: { canonical },
    };
  }

  const category = data.category as any | undefined;

  // ✅ SEO now comes from API category
  const metaTitle: string | undefined = category?.metaTitle ?? undefined;
  const metaDescription: string | undefined =
    category?.metaDescription ?? undefined;

  const ogFallback =
    category?.imageUrl ??
    data.products?.[0]?.images?.[0]?.src ??
    config.seo?.ogImage?.url ??
    undefined;

  const pageSeo = {
    title: metaTitle ?? `${hubTitle} | ${storeName}`,
    description:
      metaDescription ??
      category?.description ??
      `Explore our full ${hubTitle.toLowerCase()} collection at ${storeName}.`,
    ogImage: ogFallback ? { url: ogFallback, alt: hubTitle } : undefined,
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

// ✅ child server component that suspends
async function CollectionPageContent({ slug }: { slug: string }) {
  const { config, data } = await loadCollectionPage(slug);

  if (!data?.category) return notFound();

  return (
    <CollectionPageClient
      category={data.category as any}
      products={data.products}
      collectionsConfig={config.pages?.collections} // keep for UI-only (optional)
    />
  );
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<CollectionPageSkeleton showSidebar={false} />}>
      <CollectionPageContent slug={slug} />
    </Suspense>
  );
}
