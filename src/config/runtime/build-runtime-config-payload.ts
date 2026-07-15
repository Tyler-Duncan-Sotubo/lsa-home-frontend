import type { RuntimeConfigState } from "@/store/runtimeConfigSlice";
import { StorefrontConfigV1 } from "../types/types";

// Shared by the server-side store preload (AppProviders) and the client
// hydrator effect so both compute the exact same shape from the same
// input — divergence here is what causes SSR/client hydration mismatches.
export function buildRuntimeConfigPayload(
  config: StorefrontConfigV1,
): Partial<RuntimeConfigState> {
  return {
    version: config.version ?? 1,
    store: config.store,
    locale: config?.store.locale ?? "en-NG",
    currency: {
      code: config?.store.currency?.code ?? "NGN",
      locale: config?.store.currency?.locale ?? "en-NG",
      fractionDigits: config?.store.currency?.fractionDigits ?? 2,
    },
    features: {
      quickViewEnabled: config?.ui?.quickView?.enabled !== false,
      quickViewVariant: config?.ui?.quickView?.detailsVariant ?? "V1",
      quoteEnabled: config?.header?.nav?.icons?.quote === true,
    },
    ui: {
      pricing: {
        showPriceInDetails: config.ui?.pricing?.showPriceInDetails ?? "always",
        priceRange: config.ui?.pricing?.priceRange ?? false,
      },
      product: {
        showWishlistButton: config.ui?.product?.showWishlistButton ?? true,
        productDetails: {
          context: config.ui?.product?.productDetails?.context ?? "CART",
          variant: config.ui?.product?.productDetails?.variant ?? "V1",
        },
        productCardVariant:
          config.ui?.product?.productCardVariant ?? "DEFAULT",
      },
      account: {
        headerNav: {
          showRewardIcon:
            config.ui?.account?.headerNav?.showRewardIcon ?? false,
          showWishlistIcon:
            config.ui?.account?.headerNav?.showWishlistIcon ?? false,
          showOurStoresIcon:
            config.ui?.account?.headerNav?.showOurStoresIcon ?? false,
        },
      },
    },
  };
}
