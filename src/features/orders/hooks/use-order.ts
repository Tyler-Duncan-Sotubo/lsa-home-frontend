import { useQuery } from "@tanstack/react-query";
import { getStorefrontOrderById } from "../actions/orders";

export function useStorefrontOrder(orderId?: string) {
  return useQuery({
    queryKey: ["storefront-order", orderId],
    queryFn: () => {
      if (!orderId) throw new Error("Missing orderId");
      return getStorefrontOrderById(orderId);
    },
    enabled: !!orderId,
    staleTime: 0,
  });
}
