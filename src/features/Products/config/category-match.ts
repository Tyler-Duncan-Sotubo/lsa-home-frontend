// src/config/categoryMatch.ts
import CATEGORY_KEYWORDS from "./category-keywords.json";
import type { Product } from "@/features/Products/types/products";

type Category = { slug?: string; name?: string };
type BucketKey = keyof typeof CATEGORY_KEYWORDS;

function normalize(s: string) {
  return s.toLowerCase().trim();
}

/**
 * Returns matched buckets (e.g. ["audio", "tech_general"])
 * Uses includes() against category slug+name, so it supports multi-word slugs like "notebook-pens".
 */
export function matchCategoryBuckets(product: Product): BucketKey[] {
  const cats = (product.categories ?? []) as Category[];

  const haystack = normalize(
    cats
      .flatMap((c) => [c.slug, c.name])
      .filter(Boolean)
      .join(" ")
  );

  if (!haystack) return [];

  const hits: BucketKey[] = [];

  (Object.keys(CATEGORY_KEYWORDS) as BucketKey[]).forEach((bucket) => {
    const keywords = CATEGORY_KEYWORDS[bucket];
    const found = keywords.some((kw) => haystack.includes(normalize(kw)));
    if (found) hits.push(bucket);
  });

  return hits;
}
