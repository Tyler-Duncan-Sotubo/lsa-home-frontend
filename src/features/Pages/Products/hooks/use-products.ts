import { useQuery } from "@tanstack/react-query";
import { ListProductsQuery } from "../types/products";
import { storefrontAxios } from "@/shared/api/axios-storefront";
import type { Product as WooProduct } from "@/features/Pages/Products/types/products";

function toQueryParams(query?: ListProductsQuery) {
  return {
    search: query?.search,
    categoryId: query?.categoryId,
    limit: query?.limit ?? 12,
    offset: query?.offset ?? 0,
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

export function useGetProductBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["products", "storefront", "detail", slug],
    enabled: !!slug,
    queryFn: async (): Promise<WooProduct> => {
      const res = await storefrontAxios.get(
        `/api/catalog/products/storefront/${slug}`
      );

      return res.data.data as WooProduct;
    },
  });
}
