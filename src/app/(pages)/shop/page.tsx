import type { Metadata } from "next";
import { listProducts } from "@/features/Products/actions/products";
import { ShopPageClient } from "@/features/Shop/ui/shop-page-client";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { getBaseUrl } from "@/shared/seo/baseurl";
import { buildMetadata } from "@/shared/seo/build-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();
  const storeName = config.store?.name ?? "Store";

  const baseUrl = getBaseUrl();
  const canonical = baseUrl ? `${baseUrl}/shop` : "/shop";

  return {
    ...buildMetadata({
      globalSeo: config.seo,
      pageSeo: {
        title: `Shop | ${storeName}`,
        description: `Browse all products available at ${storeName}.`,
        ogImage: config.seo?.ogImage,
      },
    }),
    alternates: { canonical },
  };
}

export default async function ShopPage() {
  const limit = 24;
  const initialProducts = await listProducts({ limit, offset: 0 });

  return <ShopPageClient initialProducts={initialProducts} pageSize={limit} />;
}
