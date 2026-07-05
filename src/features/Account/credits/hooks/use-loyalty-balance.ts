import { useQuery } from "@tanstack/react-query";
import Axios from "axios";
import type { LoyaltyBalance } from "../actions/loyalty";

const internal = Axios.create({ baseURL: "" }); // same-origin

export function useGetLoyaltyBalance() {
  return useQuery({
    queryKey: ["customer", "loyalty", "balance"],
    queryFn: async (): Promise<LoyaltyBalance> => {
      const res = await internal.get("/api/account/loyalty/balance");
      return res.data.data as LoyaltyBalance;
    },
    retry: false,
  });
}
