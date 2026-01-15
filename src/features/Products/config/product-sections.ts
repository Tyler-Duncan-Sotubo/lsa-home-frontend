/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/productSections.ts
import type { Product } from "@/features/Products/types/products";
import {
  DEFAULT_DIMENSIONS_COPY,
  DEFAULT_RETURNS_POLICY,
} from "@/shared/constants/product-policy";

import CATEGORY_KEYWORDS from "./category-keywords.json";
import {
  CARE_BY_CATEGORY,
  DEFAULT_CARE_INSTRUCTIONS,
} from "@/shared/constants/productCare";

type SectionKey =
  | "why-love"
  | "feel-look"
  | "details"
  | "care"
  | "returns"
  | "dimensions";

export type ProductSection = {
  key: SectionKey;
  title: string;
  kind: "text" | "html";
  getValue: (product: Product) => string | null;
  order?: number;
};

type MetaItem = { key: string; value: unknown };
type Cat = { slug?: string; name?: string };
type BucketKey = keyof typeof CATEGORY_KEYWORDS;

/** ---------- helpers ---------- */

function normalize(s: string) {
  return s.toLowerCase().trim();
}

export function getMetaValue(product: Product, key: string): string | null {
  const meta = (product.meta_data as MetaItem[] | undefined) ?? [];
  const found = meta.find((m) => m.key === key);
  if (!found || found.value == null) return null;

  if (typeof found.value === "string") return found.value;
  if (typeof found.value === "number" || typeof found.value === "boolean")
    return String(found.value);

  try {
    return JSON.stringify(found.value);
  } catch {
    return String(found.value);
  }
}

export function getCategoryHaystack(product: Product): string {
  const cats = (product.categories ?? []) as Cat[];
  return normalize(
    cats
      .flatMap((c) => [c.slug, c.name])
      .filter(Boolean)
      .join(" ")
  );
}

export function matchCategoryBuckets(product: Product): Set<BucketKey> {
  const haystack = getCategoryHaystack(product);
  const hits = new Set<BucketKey>();
  if (!haystack) return hits;

  (Object.keys(CATEGORY_KEYWORDS) as BucketKey[]).forEach((bucket) => {
    const keywords = CATEGORY_KEYWORDS[bucket];
    if (keywords.some((kw) => haystack.includes(normalize(kw))))
      hits.add(bucket);
  });

  return hits;
}

/**
 * Category “care” resolution:
 * 1) product meta override
 * 2) exact CARE_BY_CATEGORY slug match (for legacy exact slugs like bedding/towels)
 * 3) bucket keyword match (includes()) -> map to care copy
 * 4) fallback default (or return null if you prefer hiding)
 */
export function getCategoryCare(product: Product): string | null {
  // 1) product meta override
  const metaCare = getMetaValue(product, "care_instructions");
  if (metaCare && metaCare.trim()) return metaCare.trim();

  // 2) exact slug match (keep your current behavior)
  const cats = (product.categories ?? []) as Cat[];
  for (const cat of cats) {
    if (!cat.slug) continue;
    const care = CARE_BY_CATEGORY[cat.slug];
    if (care) return care;
  }

  // 3) bucket keyword match (scales for 100s of categories)
  const buckets = matchCategoryBuckets(product);

  const CARE_SUPPORTED_BUCKETS = new Set([
    "textile_bedding",
    "textile_towels",
    "apparel_clothing",
  ] as const);

  const hasSupportedBucket = Array.from(buckets).some((b) =>
    CARE_SUPPORTED_BUCKETS.has(b as any)
  );

  if (!hasSupportedBucket) return null; // ✅ hides Care section

  if (buckets.has("textile_bedding"))
    return CARE_BY_CATEGORY["bedding"] ?? DEFAULT_CARE_INSTRUCTIONS;
  if (buckets.has("textile_towels"))
    return CARE_BY_CATEGORY["towels"] ?? DEFAULT_CARE_INSTRUCTIONS;
  if (buckets.has("apparel_clothing"))
    return CARE_BY_CATEGORY["loungewear"] ?? DEFAULT_CARE_INSTRUCTIONS;

  if (
    buckets.has("tech_general") ||
    buckets.has("computing") ||
    buckets.has("audio")
  ) {
    return `
Keep away from water and extreme heat.
Clean with a soft, dry cloth.
Use only compatible accessories.
`.trim();
  }

  // Optional: if you want tech/audio to show generic maintenance, keep default.
  // If you’d rather hide Care for tech/audio, return null here instead.
  // if (buckets.has("tech_general") || buckets.has("audio") || buckets.has("computing")) return null;

  return DEFAULT_CARE_INSTRUCTIONS;
}

/** ---------- sections ---------- */

export const BASE_SECTIONS: ProductSection[] = [
  {
    key: "why-love",
    title: "Why You’ll Love It",
    kind: "text",
    order: 10,
    getValue: (p) =>
      getMetaValue(p, "why_you_will_love_it") || p.description || null,
  },
  {
    key: "feel-look",
    title: "How It Feels & Looks",
    kind: "text",
    order: 20,
    getValue: (p) => getMetaValue(p, "how_it_feels_and_looks"),
  },
  {
    key: "details",
    title: "Details",
    kind: "html",
    order: 30,
    getValue: (p) => getMetaValue(p, "details"),
  },
  {
    key: "care",
    title: "Care",
    kind: "text",
    order: 40,
    getValue: (p) => getCategoryCare(p),
  },
  {
    key: "returns",
    title: "Returns",
    kind: "text",
    order: 50,
    getValue: (p) =>
      getMetaValue(p, "returns_policy") || DEFAULT_RETURNS_POLICY,
  },
  {
    key: "dimensions",
    title: "Dimensions",
    kind: "text",
    order: 60,
    getValue: (p) =>
      getMetaValue(p, "dimensions_copy") || DEFAULT_DIMENSIONS_COPY,
  },
];

/**
 * Category rules using includes() (no need to maintain 100s of exact slugs).
 * Match against the combined slug+name haystack.
 */
export type CategorySectionRule = {
  match: Array<string>; // includes() keywords
  include?: SectionKey[];
  exclude?: SectionKey[];
  titleOverrides?: Partial<Record<SectionKey, string>>;
  priority?: number; // higher wins when multiple rules match
};

export const SECTION_RULES: CategorySectionRule[] = [
  {
    // Tech gadgets: hide Care
    match: [
      "tech",
      "gadget",
      "electronics",
      "device",
      "charger",
      "powerbank",
      "usb",
      "wireless",
    ],
    exclude: ["care"],
    priority: 50,
  },
  {
    // Audio category: hide Care and rename details
    match: [
      "speaker",
      "speakers",
      "airpods",
      "earbuds",
      "headphones",
      "headset",
      "audio",
      "soundbar",
    ],
    exclude: ["care"],
    titleOverrides: { details: "Specs & Details" },
    priority: 60,
  },
  {
    // Bedding/towels/apparel: show Care (allowlist if you want strict control)
    match: [
      "bedding",
      "duvet",
      "bedsheet",
      "pillow",
      "towel",
      "towels",
      "loungewear",
      "sleepwear",
      "apparel",
      "clothing",
    ],
    include: [
      "why-love",
      "feel-look",
      "details",
      "care",
      "returns",
      "dimensions",
    ],
    priority: 70,
  },
];
