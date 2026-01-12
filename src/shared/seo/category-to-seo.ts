import type { PageSeoConfigV1 } from "@/config/types/seo-page.types";
import type { SeoConfigV1 } from "@/config/types/seo.types";
import { WooCategory } from "@/features/Products/types/products";

export type CollectionCategory = {
  id: string;
  name: string;
  slug: string;
};

export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

export function applyTemplate(template: string, vars: Record<string, string>) {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, v);
  }
  return out;
}

export function collectionToSeo(args: {
  category: WooCategory;
  storeName: string;
  pageSeoDefaults?: PageSeoConfigV1;
  // optional: for OG fallback
  ogImageUrl?: string | null;
}): SeoConfigV1 {
  const { category, storeName, pageSeoDefaults, ogImageUrl } = args;

  const vars = {
    categoryName: category.name,
    categorySlug: category.slug,
    storeName,
  };

  // Title: category name wins (you said title comes back already)
  const title =
    category.name ||
    (pageSeoDefaults?.title
      ? applyTemplate(pageSeoDefaults.title, vars)
      : "Collection");

  // Description: config default (templated) -> fallback
  const rawDesc =
    (pageSeoDefaults?.description
      ? applyTemplate(pageSeoDefaults.description, vars)
      : null) ?? `Shop ${category.name} at ${storeName}.`;

  const description = stripHtml(rawDesc).slice(0, 155);

  // Keywords: config keywords (templated not needed usually)
  const keywords = pageSeoDefaults?.keywords;

  // OG image: config ogImage -> fallback to first product image
  const ogImage = pageSeoDefaults?.ogImage
    ? {
        url: pageSeoDefaults.ogImage.url,
        alt: pageSeoDefaults.ogImage.alt || category.name,
        width: pageSeoDefaults.ogImage.width,
        height: pageSeoDefaults.ogImage.height,
      }
    : ogImageUrl
    ? { url: ogImageUrl, alt: category.name }
    : undefined;

  return {
    title,
    description,
    keywords,
    ogImage,
    noindex: pageSeoDefaults?.noindex,
  };
}
