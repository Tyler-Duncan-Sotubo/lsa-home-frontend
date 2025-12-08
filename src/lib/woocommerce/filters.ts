import type { Product } from "@/types/products";

export type CollectionFiltersState = {
  colors: string[];
  sizes: string[];
  tags: string[];
};

export type CollectionFilterMeta = {
  allColors: string[];
  allSizes: string[];
  allTags: string[];
};

// Colours from attributes
export function extractColorsFromProducts(products: Product[]): string[] {
  const colors = new Set<string>();

  for (const p of products) {
    for (const attr of p.attributes ?? []) {
      const name = attr.name?.toLowerCase?.();
      if (!name) continue;

      if (name.includes("color") || name.includes("colour")) {
        for (const opt of attr.options ?? []) {
          if (opt) colors.add(String(opt));
        }
      }
    }
  }

  return Array.from(colors).sort((a, b) => a.localeCompare(b));
}

// Sizes from attributes
export function extractSizesFromProducts(products: Product[]): string[] {
  const sizes = new Set<string>();

  for (const p of products) {
    for (const attr of p.attributes ?? []) {
      const name = attr.name?.toLowerCase?.();
      if (!name) continue;

      if (name.includes("size")) {
        for (const opt of attr.options ?? []) {
          if (opt) sizes.add(String(opt));
        }
      }
    }
  }

  return Array.from(sizes).sort((a, b) => a.localeCompare(b));
}

// Tags from Woo product tags
export function extractTagsFromProducts(products: Product[]): string[] {
  const tags = new Set<string>();

  for (const p of products) {
    for (const tag of p.tags ?? []) {
      if (tag?.name) tags.add(String(tag.name));
    }
  }

  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

// Build meta options
export function getCollectionFilterMeta(
  products: Product[]
): CollectionFilterMeta {
  const allColors = extractColorsFromProducts(products);
  const allSizes = extractSizesFromProducts(products);
  const allTags = extractTagsFromProducts(products);

  return { allColors, allSizes, allTags };
}

// Apply filters to products (colour + size + tag)
export function applyCollectionFilters(
  products: Product[],
  filters: CollectionFiltersState
): Product[] {
  const {
    colors: selectedColors,
    sizes: selectedSizes,
    tags: selectedTags,
  } = filters;

  return products.filter((p) => {
    // Colour
    if (selectedColors.length > 0) {
      const productColors = extractColorsFromProducts([p]);
      if (!productColors.some((c) => selectedColors.includes(c))) {
        return false;
      }
    }

    // Size
    if (selectedSizes.length > 0) {
      const productSizes = extractSizesFromProducts([p]);
      if (!productSizes.some((s) => selectedSizes.includes(s))) {
        return false;
      }
    }

    // Tags
    if (selectedTags.length > 0) {
      const productTags = extractTagsFromProducts([p]);
      if (!productTags.some((t) => selectedTags.includes(t))) {
        return false;
      }
    }

    return true;
  });
}

// Normalize a size string into a canonical version
export function normalizeSize(raw: string): string {
  if (!raw) return "";

  let s = raw.trim();

  // Remove "cm" suffixes
  s = s.replace(/cm/gi, "").trim();

  // Ensure spacing around "-"
  s = s.replace(/\s*-\s*/, " - ");

  // Extract only the text before the " - "
  const beforeDash = s.split(" - ")[0].trim();

  return beforeDash;
}
