import type { StorefrontConfigV1 } from "../types/types";
import { fetchRemoteStorefrontConfig } from "./runtime-config";

export async function getStorefrontConfig(): Promise<StorefrontConfigV1> {
  const forceLocal = process.env.STOREFRONT_CONFIG_FORCE_LOCAL === "true";
  if (forceLocal) return loadLocalStorefrontConfig();

  try {
    return await fetchRemoteStorefrontConfig();
  } catch (e) {
    // You can log this on server (Next.js server-only)
    console.warn(
      "[storefront-config] remote fetch failed, falling back to local:",
      e
    );
    return loadLocalStorefrontConfig();
  }
}

export async function loadLocalStorefrontConfig(): Promise<StorefrontConfigV1> {
  const store = process.env.STORE_ID;

  switch (store) {
    case "default": {
      const mod = await import("../stores/default.json");
      return mod.default as StorefrontConfigV1;
    }
    case "serene": {
      const mod = await import("../stores/serene.json");
      return mod.default as StorefrontConfigV1;
    }
    case "greysteed": {
      const mod = await import("../stores/greysteed.json");
      return mod.default as StorefrontConfigV1;
    }
    default: {
      const mod = await import("../stores/default.json");
      return mod.default as StorefrontConfigV1;
    }
  }
}
