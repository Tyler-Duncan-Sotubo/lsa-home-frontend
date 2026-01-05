// src/lib/storefront/account/activity.ts
import "server-only";
import { storefrontFetchSafe } from "@/shared/api/fetch";
import { CustomerActivityBundle } from "../types/activity";

export async function getCustomerActivityBundle(
  accessToken?: string | null,
  input?: { storeId?: string }
) {
  const qs = input?.storeId
    ? `?storeId=${encodeURIComponent(input.storeId)}`
    : "";

  const res = await storefrontFetchSafe<CustomerActivityBundle>(
    `/api/storefront/customers/activity${qs}`,
    {
      method: "GET",
      tags: ["customer:activity"],
      accessToken: accessToken ?? null,
    }
  );

  if (!res.ok) {
    // IMPORTANT: throw so Next route can forward exact error & status
    throw {
      statusCode: res.statusCode,
      error: res.error,
    };
  }

  return res.data;
}
