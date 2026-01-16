import type { Metadata } from "next";
import { listStorefrontCategories } from "@/features/Collections/actions/get-collections";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { getBaseUrl } from "@/shared/seo/baseurl";
import { buildMetadata } from "@/shared/seo/build-metadata";
import CollectionsGridClient from "@/features/Collections/ui/collections-grid.client";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();
  const storeName = config.store?.name ?? "Store";

  const baseUrl = getBaseUrl();
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

export default async function CollectionsPage() {
  const categories = await listStorefrontCategories();

  return <CollectionsGridClient categories={categories} />;
}
