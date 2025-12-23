import { Product } from "@/features/products/types/products";
import type { Metadata } from "next";

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

export function buildProductMetadata({
  product,
  baseUrl,
}: {
  product: Product;
  baseUrl?: string | null;
}): Metadata {
  const url = baseUrl
    ? `${baseUrl}/products/${product.slug}`
    : `/products/${product.slug}`;

  const seoTitle = getMeta(product, "seo_title");
  const seoDescription = getMeta(product, "seo_description");

  const rawDescription =
    seoDescription || product.short_description || product.description || "";

  const description =
    stripHtml(rawDescription).slice(0, 155) || `Shop ${product.name}.`;

  const title = seoTitle || `${product.name} | LSA Home`;

  const images =
    product.images?.map((img: { src: string }) => img.src).filter(Boolean) ??
    [];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: images.length
        ? images.map((src: string) => ({ url: src }))
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images[0] ? [images[0]] : undefined,
    },
  };
}
