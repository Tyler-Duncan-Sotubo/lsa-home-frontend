import type { Product } from "@/features/products/types/products";

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

export function extractTagsFromProducts(products: Product[]): string[] {
  const tags = new Set<string>();

  for (const p of products) {
    for (const tag of p.tags ?? []) {
      if (tag?.name) tags.add(String(tag.name));
    }
  }

  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

export function getCollectionFilterMeta(
  products: Product[]
): CollectionFilterMeta {
  return {
    allColors: extractColorsFromProducts(products),
    allSizes: extractSizesFromProducts(products),
    allTags: extractTagsFromProducts(products),
  };
}

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
    if (selectedColors.length > 0) {
      const productColors = extractColorsFromProducts([p]);
      if (!productColors.some((c) => selectedColors.includes(c))) return false;
    }

    if (selectedSizes.length > 0) {
      const productSizes = extractSizesFromProducts([p]);
      if (!productSizes.some((s) => selectedSizes.includes(s))) return false;
    }

    if (selectedTags.length > 0) {
      const productTags = extractTagsFromProducts([p]);
      if (!productTags.some((t) => selectedTags.includes(t))) return false;
    }

    return true;
  });
}
