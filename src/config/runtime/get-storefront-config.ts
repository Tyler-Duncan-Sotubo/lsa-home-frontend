import type { StorefrontConfigV1 } from "../types/types";
import {
  fetchRemoteStorefrontConfig,
  StorefrontConfigErrorCode,
} from "./runtime-config";

export async function getStorefrontConfig(): Promise<StorefrontConfigV1> {
  const forceLocal = process.env.STOREFRONT_CONFIG_FORCE_LOCAL === "true";
  if (forceLocal) return loadLocalStorefrontConfig("default");

  const result = await fetchRemoteStorefrontConfig();

  if (result.ok) {
    return result.data;
  }

  switch (result.code) {
    case StorefrontConfigErrorCode.DOMAIN_NOT_FOUND:
      return loadLocalStorefrontConfig("not-found");

    case StorefrontConfigErrorCode.CONFIG_NOT_PUBLISHED:
    case StorefrontConfigErrorCode.THEME_NOT_READY:
      return loadLocalStorefrontConfig("maintenance");

    case StorefrontConfigErrorCode.LOCALHOST_BLOCKED:
      return loadLocalStorefrontConfig("not-found");

    default:
      return loadLocalStorefrontConfig("default");
  }
}

type LocalPreset = "default" | "maintenance" | "not-found";

export async function loadLocalStorefrontConfig(
  preset: LocalPreset
): Promise<StorefrontConfigV1> {
  switch (preset) {
    case "maintenance": {
      const mod = await import("../stores/maintenance.json");
      return mod.default as StorefrontConfigV1;
    }
    case "not-found": {
      const mod = await import("../stores/not-found.json");
      return mod.default as StorefrontConfigV1;
    }
    default: {
      const mod = await import("../stores/default.json");
      return mod.default as StorefrontConfigV1;
    }
  }
}
