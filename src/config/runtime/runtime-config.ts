/* eslint-disable @typescript-eslint/no-explicit-any */
import { storefrontFetchSafe } from "@/shared/api/fetch";
import type { StorefrontConfigV1 } from "../types/types";

export async function fetchRemoteStorefrontConfig(): Promise<StorefrontConfigV1> {
  const res = await storefrontFetchSafe<StorefrontConfigV1>(
    "/api/storefront-config/config",
    {
      method: "GET",
      revalidate: 300,
      tags: ["storefront-config"],
    }
  );

  if (!res.ok) {
    const err = res.error as any;
    const msg =
      err?.message ||
      err?.error ||
      `Failed to fetch remote config (status ${res.statusCode})`;
    throw Object.assign(new Error(msg), {
      statusCode: res.statusCode,
      cause: err,
    });
  }

  return res.data;
}
