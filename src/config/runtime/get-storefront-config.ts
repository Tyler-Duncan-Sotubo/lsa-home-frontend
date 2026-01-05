import type { StorefrontConfigV1 } from "../types/types";

export async function getStorefrontConfig(): Promise<StorefrontConfigV1> {
  return loadLocal();
}

async function loadLocal(): Promise<StorefrontConfigV1> {
  const store = process.env.STORE_ID;

  switch (store) {
    case "serene": {
      const mod = await import("../stores/serene.json");
      return mod.default as StorefrontConfigV1;
    }
    case "greysteed": {
      const mod = await import("../stores/greysteed.json");
      return mod.default as StorefrontConfigV1;
    }
    default: {
      const mod = await import("../stores/serene.json");
      return mod.default as StorefrontConfigV1;
    }
  }
}
