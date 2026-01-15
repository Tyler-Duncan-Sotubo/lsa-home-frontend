/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/Shop/ui/shop-page-client.tsx
"use client";

import { useMemo, useState } from "react";
import type {
  Product,
  ProductCardSize,
} from "@/features/Products/types/products";
import { useInfiniteQuery } from "@tanstack/react-query";
import { storefrontAxios } from "@/shared/api/axios-storefront";
import { Button } from "@/shared/ui/button";
import { ProductCardSwitch } from "@/features/Products/ui/ProductCard/product-card-switch";
import {
  ShopFiltersSidebar,
  ShopFiltersState,
  ShopFilterMeta,
} from "./shop-filters-sidebar";

// shadcn
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

// react-icons
import { FaSortAmountDownAlt, FaSortAmountUpAlt, FaStar } from "react-icons/fa";
import { HiOutlineTag } from "react-icons/hi";
import {
  BsFillGrid3X2GapFill,
  BsFillGridFill,
  BsGrid,
  BsGrid3X2Gap,
} from "react-icons/bs";
import { getStoreHostHeader } from "@/shared/api/storefront-headers";

function asNumberPrice(p: Product): number | null {
  const anyP: any = p as any;
  const raw = anyP?.price ?? anyP?.regular_price ?? null;
  const n = raw == null ? NaN : Number(raw);
  return Number.isFinite(n) ? n : null;
}

function buildMeta(products: Product[]): ShopFilterMeta {
  const colors = new Set<string>();
  const sizes = new Set<string>();
  const tags = new Set<string>();

  let min = Number.POSITIVE_INFINITY;
  let max = 0;

  for (const p of products) {
    const price = asNumberPrice(p);
    if (price != null) {
      min = Math.min(min, price);
      max = Math.max(max, price);
    }

    const attrs = (p as any)?.attributes ?? [];
    for (const a of attrs) {
      const name = String(a?.name ?? "").toLowerCase();
      const options: string[] = (a?.options ?? []).map(String);

      if (name.includes("color")) options.forEach((v) => colors.add(v));
      if (name.includes("size")) options.forEach((v) => sizes.add(v));
    }

    const pTags = ((p as any)?.tags ?? []) as Array<{ name?: string }>;
    pTags.forEach((t) => t?.name && tags.add(t.name));
  }

  const priceMin = Number.isFinite(min) ? Math.floor(min) : 0;
  const priceMax = Number.isFinite(max) ? Math.ceil(max) : 0;

  return {
    allColors: Array.from(colors).sort(),
    allSizes: Array.from(sizes).sort(),
    allTags: Array.from(tags).sort(),
    priceMin,
    priceMax: Math.max(priceMax, priceMin),
  };
}

function applyFilters(
  products: Product[],
  filters: ShopFiltersState,
  opts: { showOnSaleOnly: boolean }
) {
  const { colors, sizes, tags, minPrice, maxPrice } = filters;

  return products.filter((p) => {
    const anyP: any = p as any;

    if (opts.showOnSaleOnly && !Boolean(anyP?.on_sale)) return false;

    const price = asNumberPrice(p);
    if (minPrice != null && price != null && price < minPrice) return false;
    if (maxPrice != null && price != null && price > maxPrice) return false;

    const attrs = anyP?.attributes ?? [];
    const productColors = new Set<string>();
    const productSizes = new Set<string>();

    for (const a of attrs) {
      const name = String(a?.name ?? "").toLowerCase();
      const options: string[] = (a?.options ?? []).map(String);

      if (name.includes("color")) options.forEach((v) => productColors.add(v));
      if (name.includes("size")) options.forEach((v) => productSizes.add(v));
    }

    if (colors.length > 0 && !colors.some((c) => productColors.has(c)))
      return false;
    if (sizes.length > 0 && !sizes.some((s) => productSizes.has(s)))
      return false;

    const pTags = (anyP?.tags ?? []) as Array<{ name?: string }>;
    const tagNames = new Set(
      pTags.map((t) => t?.name).filter(Boolean) as string[]
    );
    if (tags.length > 0 && !tags.some((t) => tagNames.has(t))) return false;

    return true;
  });
}

type SortOption = "featured" | "price-asc" | "price-desc" | "rating-desc";
type GridCols = 2 | 3 | 4;

function sortProducts(products: Product[], sort: SortOption) {
  const arr = [...products];
  const ratingOf = (p: Product) => {
    const anyP: any = p as any;
    const r = Number(anyP?.average_rating ?? 0);
    return Number.isFinite(r) ? r : 0;
  };

  switch (sort) {
    case "price-asc":
      arr.sort(
        (a, b) =>
          (asNumberPrice(a) ?? Infinity) - (asNumberPrice(b) ?? Infinity)
      );
      return arr;
    case "price-desc":
      arr.sort(
        (a, b) =>
          (asNumberPrice(b) ?? -Infinity) - (asNumberPrice(a) ?? -Infinity)
      );
      return arr;
    case "rating-desc":
      arr.sort((a, b) => ratingOf(b) - ratingOf(a));
      return arr;
    case "featured":
    default:
      return products; // keep API order
  }
}

async function fetchProductsPage({
  limit,
  offset,
}: {
  limit: number;
  offset: number;
}): Promise<Product[]> {
  const res = await storefrontAxios.get("/api/catalog/products/storefront", {
    params: { limit, offset },
    headers: { ...(await getStoreHostHeader()) },
  });

  const d = res.data;
  const items =
    (Array.isArray(d?.data) && d.data) ||
    (Array.isArray(d?.data?.data) && d.data.data) ||
    (Array.isArray(d) && d) ||
    [];

  return items as Product[];
}

export function ShopPageClient({
  initialProducts,
  pageSize = 24,
}: {
  initialProducts: Product[];
  pageSize?: number;
}) {
  const [filters, setFilters] = useState<ShopFiltersState>({
    colors: [],
    sizes: [],
    tags: [],
    minPrice: null,
    maxPrice: null,
  });

  // NEW: sort, on-sale, grid
  const [sort, setSort] = useState<SortOption>("featured");
  const [showOnSaleOnly, setShowOnSaleOnly] = useState(false);
  const [gridCols, setGridCols] = useState<GridCols>(3);

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["products", "shop", { limit: pageSize }],
      initialPageParam: 0,
      queryFn: async ({ pageParam }) =>
        fetchProductsPage({ limit: pageSize, offset: pageParam }),
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage || lastPage.length === 0) return undefined;
        const loaded = allPages.reduce((sum, page) => sum + page.length, 0);
        if (lastPage.length < pageSize) return undefined;
        return loaded;
      },

      // ✅ hydrate the first page from the server
      initialData: {
        pages: [initialProducts],
        pageParams: [0],
      },
    });

  const allProducts = useMemo(() => (data?.pages ?? []).flat(), [data]);
  const meta = useMemo(() => buildMeta(allProducts), [allProducts]);

  const filteredProducts = useMemo(
    () => applyFilters(allProducts, filters, { showOnSaleOnly }),
    [allProducts, filters, showOnSaleOnly]
  );

  const finalProducts = useMemo(
    () => sortProducts(filteredProducts, sort),
    [filteredProducts, sort]
  );

  // Tailwind needs static class names => map
  const gridClass =
    gridCols === 2
      ? "grid grid-cols-2 gap-4 md:grid-cols-2"
      : gridCols === 3
      ? "grid grid-cols-2 gap-4 md:grid-cols-3"
      : "grid grid-cols-2 gap-4 md:grid-cols-4";

  const cardSize: ProductCardSize =
    gridCols === 4 ? "compact" : gridCols === 2 ? "large" : "default";

  return (
    <section className="mx-auto w-[95%] space-y-6 py-8">
      <header className="flex flex-col gap-2 px-5">
        <h1 className="text-4xl font-semibold text-primary">Shop</h1>
        <p className="text-muted-foreground">
          Browse products and refine with filters.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-16 md:grid-cols-[260px_minmax(0,1fr)]">
        <ShopFiltersSidebar
          meta={meta}
          filters={filters}
          onChange={setFilters}
        />

        <div className="space-y-6">
          {/* NEW: controls row (left checkbox, middle grid select, right sort select) */}
          <div className="flex flex-col gap-3 px-1 md:flex-row md:items-center md:justify-between">
            {/* left */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="saleOnly"
                checked={showOnSaleOnly}
                onCheckedChange={(v) => setShowOnSaleOnly(Boolean(v))}
              />
              <Label htmlFor="saleOnly" className="text-sm">
                Show only products on sale
              </Label>
            </div>

            {/* middle */}
            <div className="flex items-center justify-center md:flex-1">
              <div className="flex items-center gap-3 px-3 py-2">
                {/* 2 columns */}
                <button
                  type="button"
                  aria-label="2 column grid"
                  onClick={() => setGridCols(2)}
                  className="transition hover:text-foreground h-10"
                >
                  {gridCols === 2 ? (
                    <BsFillGridFill className="text-primary" />
                  ) : (
                    <BsGrid className="text-muted-foreground" />
                  )}
                </button>

                {/* 3 columns */}
                <button
                  type="button"
                  aria-label="3 column grid"
                  onClick={() => setGridCols(3)}
                  className="transition hover:text-foreground h-10"
                >
                  {gridCols === 3 ? (
                    <BsFillGrid3X2GapFill className="text-primary text-3xl" />
                  ) : (
                    <BsGrid3X2Gap className="text-muted-foreground text-3xl" />
                  )}
                </button>

                {/* 4 columns */}
                <button
                  type="button"
                  aria-label="4 column grid"
                  onClick={() => setGridCols(4)}
                  className="transition hover:text-foreground h-10"
                >
                  {gridCols === 4 ? (
                    <div className="flex">
                      <BsFillGridFill className="text-lg text-primary" />
                      <BsFillGridFill className="text-lg text-primary" />
                    </div>
                  ) : (
                    <div className="flex">
                      <BsGrid className="text-lg text-muted-foreground" />
                      <BsGrid className="text-lg text-muted-foreground" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* right */}
            <div className="flex items-center justify-end gap-2">
              <HiOutlineTag className="text-muted-foreground" />
              <Select
                value={sort}
                onValueChange={(v) => setSort(v as SortOption)}
              >
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">
                    <span className="inline-flex items-center gap-2">
                      <FaSortAmountUpAlt /> Price: low to high
                    </span>
                  </SelectItem>
                  <SelectItem value="price-desc">
                    <span className="inline-flex items-center gap-2">
                      <FaSortAmountDownAlt /> Price: high to low
                    </span>
                  </SelectItem>
                  <SelectItem value="rating-desc">
                    <span className="inline-flex items-center gap-2">
                      <FaStar /> Average rating
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && initialProducts.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Loading products…
            </div>
          ) : (
            <>
              <div className={gridClass}>
                {finalProducts.map((p) => (
                  <ProductCardSwitch
                    size={cardSize}
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    imageSrc={p.images?.[0]?.src ?? null}
                    priceHtml={(p as any)?.price_html ?? null}
                    averageRating={Number((p as any)?.average_rating ?? 0)}
                    ratingCount={Number((p as any)?.rating_count ?? 0)}
                    quickViewProduct={p}
                    regularPrice={(p as any)?.regular_price}
                    salePrice={(p as any)?.sale_price}
                    onSale={Boolean((p as any)?.on_sale)}
                  />
                ))}
              </div>

              <div className="flex justify-center pt-4">
                {hasNextPage ? (
                  <Button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="min-w-48"
                  >
                    {isFetchingNextPage ? "Loading…" : "Load more"}
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    You’ve reached the end.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
