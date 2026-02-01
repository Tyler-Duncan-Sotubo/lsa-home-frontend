import { Suspense } from "react";
import type { Metadata } from "next";
import { listStorefrontCategories } from "@/features/Collections/actions/get-collections";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";

import { buildMetadata } from "@/shared/seo/build-metadata";
import CollectionsGridClient from "@/features/Collections/ui/collections-grid.client";
import { CollectionsGridSkeleton } from "@/features/skeletons/ index";
import { getRequestBaseUrl } from "@/shared/seo/get-request-base-url";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();
  const storeName = config.store?.name ?? "Store";

  const baseUrl = await getRequestBaseUrl();
  const canonical = baseUrl ? `${baseUrl}/collections` : "/collections";

  return {
    ...buildMetadata({
      globalSeo: config.seo,
      pageSeo: {
        title: `Collections | ${storeName}`,
        description: `Browse all product collections at ${storeName}.`,
        ogImage: config.seo?.ogImage,
      },
    }),
    alternates: { canonical },
  };
}

async function CollectionsGrid() {
  const categories = await listStorefrontCategories();
  return <CollectionsGridClient categories={categories} />;
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<CollectionsGridSkeleton count={12} />}>
      <CollectionsGrid />
    </Suspense>
  );
}
