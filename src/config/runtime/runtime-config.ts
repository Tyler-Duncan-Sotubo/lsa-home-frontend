/* eslint-disable @typescript-eslint/no-explicit-any */
import { storefrontFetchSafe } from "@/shared/api/fetch";
import type { StorefrontConfigV1 } from "../types/types";

export enum StorefrontConfigErrorCode {
  DOMAIN_NOT_FOUND = "DOMAIN_NOT_FOUND",
  CONFIG_NOT_PUBLISHED = "CONFIG_NOT_PUBLISHED",
  THEME_NOT_READY = "THEME_NOT_READY",
  LOCALHOST_BLOCKED = "LOCALHOST_BLOCKED",
  UNKNOWN = "UNKNOWN",
}

export type StorefrontConfigResult =
  | { ok: true; data: StorefrontConfigV1 }
  | {
      ok: false;
      statusCode?: number;
      message: string;
      code: StorefrontConfigErrorCode;
    };

export async function fetchRemoteStorefrontConfig(): Promise<StorefrontConfigResult> {
  const res = await storefrontFetchSafe<StorefrontConfigV1>(
    "/api/storefront-config/config",
    { method: "GET", tags: ["storefront-config"] }
  );

  if (!res.ok) {
    const err = res.error as any;

    console.log(res.statusCode);

    const code =
      err?.code ??
      (res.statusCode === 400
        ? StorefrontConfigErrorCode.DOMAIN_NOT_FOUND
        : res.statusCode === 404
        ? StorefrontConfigErrorCode.THEME_NOT_READY
        : res.statusCode === 400
        ? StorefrontConfigErrorCode.LOCALHOST_BLOCKED
        : StorefrontConfigErrorCode.UNKNOWN);

    return {
      ok: false,
      statusCode: res.statusCode,
      message:
        err?.message ||
        err?.error ||
        `Failed to fetch remote config (status ${res.statusCode})`,
      code,
    };
  }

  return { ok: true, data: res.data };
}
