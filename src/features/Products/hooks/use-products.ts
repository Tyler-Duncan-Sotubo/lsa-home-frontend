/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ListProductsQuery } from "../types/products";
import { storefrontAxios } from "@/shared/api/axios-storefront";
import type { Product as WooProduct } from "@/features/Products/types/products";

function toQueryParams(query?: ListProductsQuery) {
  return {
    search: query?.search,
    categoryId: query?.categoryId,
    limit: query?.limit ?? 12,
    offset: query?.offset ?? 0,

    minPrice: query?.minPrice,
    maxPrice: query?.maxPrice,
    colors: query?.colors,
    sizes: query?.sizes,
    tags: query?.tags,
  };
}

export function useGetProducts(query?: ListProductsQuery) {
  return useQuery({
    queryKey: ["products", "list", query],
    queryFn: async (): Promise<WooProduct[]> => {
      const res = await storefrontAxios.get(
        "/api/catalog/products/storefront",
        {
          params: toQueryParams(query),
        }
      );

      return res.data.data as WooProduct[];
    },
  });
}

export function useGetProductsInfinite(
  query?: Omit<ListProductsQuery, "offset"> & Record<string, any>
) {
  const limit = query?.limit ?? 12;

  return useInfiniteQuery({
    queryKey: ["products", "list", "infinite", query],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<WooProduct[]> => {
      const res = await storefrontAxios.get(
        "/api/catalog/products/storefront",
        {
          params: toQueryParams({ ...(query ?? {}), offset: pageParam, limit }),
        }
      );
      console.log("Fetched products page:", pageParam, res.data.data);
      return res.data.data as WooProduct[];
    },
    getNextPageParam: (lastPage, allPages) => {
      // If we got fewer than limit, assume no more pages.
      if (!lastPage || lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
  });
}

export function useGetProductBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["products", "storefront", "detail", slug],
    enabled: !!slug,
    queryFn: async (): Promise<WooProduct> => {
      const res = await storefrontAxios.get(
        `/api/catalog/products/storefront/${slug}`
      );
      console.log("Fetched product by slug:", slug, res.data.data);
      return res.data.data as WooProduct;
    },
  });
}
