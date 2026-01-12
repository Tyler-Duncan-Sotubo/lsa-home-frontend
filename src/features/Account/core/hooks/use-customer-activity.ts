/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import Axios from "axios";
import type { CustomerActivityBundle } from "../types/activity";
import { toast } from "sonner";

const internal = Axios.create({ baseURL: "" }); // same-origin

export function useGetCustomerActivity(storeId?: string) {
  const query = useQuery({
    queryKey: ["customer", "activity", storeId ?? null],
    queryFn: async (): Promise<CustomerActivityBundle> => {
      const qs = storeId ? `?storeId=${encodeURIComponent(storeId)}` : "";
      const res = await internal.get(`/api/account/${qs}`);
      return res.data.data as CustomerActivityBundle;
    },
    retry: false,
  });

  // Handle errors using useEffect or in the component that uses this hook
  if (query.error) {
    toast.error(
      (query.error as any)?.response?.data?.error ??
        "Failed to load customer activity"
    );
  }

  return query;
}
