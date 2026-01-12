import type { SeoConfigV1 } from "@/config/types/seo.types";
import type { Product } from "@/features/Products/types/products";

type MetaItem = { key: string; value: unknown };

function getMeta(product: Product, key: string): string | null {
  const meta = (product?.meta_data as MetaItem[] | undefined) ?? [];
  const found = meta.find((m) => m.key === key);
  if (!found || found.value == null) return null;
  return String(found.value).trim() || null;
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

export function productToSeo(product: Product): SeoConfigV1 {
  const seoTitle = getMeta(product, "seo_title");
  const seoDescription = getMeta(product, "seo_description");

  const rawDescription =
    seoDescription || product.short_description || product.description || "";

  const description =
    stripHtml(rawDescription).slice(0, 155) || `Shop ${product.name}.`;

  const images =
    product.images?.map((img: { src: string }) => img.src).filter(Boolean) ??
    [];

  return {
    title: seoTitle || product.name,
    description,
    ogImage: images[0] ? { url: images[0], alt: product.name } : undefined,
  };
}
