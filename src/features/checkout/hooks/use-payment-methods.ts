import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const { data } = await axios.get("/api/payments/payment-methods");
      return data?.data ?? data;
    },
    staleTime: 60_000,
  });
}
