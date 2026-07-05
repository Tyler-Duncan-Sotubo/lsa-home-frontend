import "server-only";
import type { BundleDetail } from "@/features/Products/types/products";
import { storefrontFetchSafe } from "@/shared/api/fetch";

export async function getBundleDetailBySlug(slug: string) {
  const res = await storefrontFetchSafe<BundleDetail>(
    `/api/catalog/products/storefront/${slug}/bundle`,
    { tags: [`product:${slug}`, `product:${slug}:bundle`] },
  );

  if (!res.ok) {
    return null;
  }

  return res.data;
}
