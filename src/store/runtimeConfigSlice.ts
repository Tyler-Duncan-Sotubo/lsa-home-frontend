/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/runtimeConfigSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type QuickViewVariant = "V1" | "V2";

export type CurrencyConfig = {
  code: string; // "NGN", "USD"
  locale: string; // "en-NG"
  symbol?: string; // optional
  fractionDigits?: number; // optional override
};

export type RuntimeConfigState = {
  version: number;

  store?: { id?: string; name?: string };

  locale: string;
  currency: CurrencyConfig;

  features: {
    quickViewEnabled: boolean;
    quickViewVariant: QuickViewVariant;
    quoteEnabled: boolean;
  };

  ui: {
    pricing: {
      showPriceInDetails: "always" | "loggedInOnly" | "never";
      priceRange?: boolean;
    };
    product: {
      showWishlistButton?: boolean;
      productDetails: {
        context: "CART" | "QUOTE";
        variant: "V1" | "V2";
      };
      productCardVariant?: "DEFAULT" | "HOVER_ACTIONS";
    };
    account: {
      headerNav: {
        showRewardIcon: boolean;
        showWishlistIcon: boolean;
        showOurStoresIcon: boolean;
      };
    };
  };

  meta?: Record<string, any>;
};

const initialState: RuntimeConfigState = {
  version: 1,
  store: undefined,
  locale: "en-NG",
  currency: { code: "NGN", locale: "en-NG", fractionDigits: 2 },
  features: {
    quickViewEnabled: true,
    quickViewVariant: "V1",
    quoteEnabled: false,
  },
  ui: {
    pricing: {
      showPriceInDetails: "always",
      priceRange: false,
    },
    product: {
      showWishlistButton: true,
      productDetails: {
        context: "CART",
        variant: "V1",
      },
      productCardVariant: "DEFAULT",
    },
    account: {
      headerNav: {
        showRewardIcon: false,
        showWishlistIcon: false,
        showOurStoresIcon: false,
      },
    },
  },
  meta: {},
};

function deepMerge<T extends Record<string, any>>(
  base: T,
  patch: Partial<T>,
): T {
  const out: any = { ...base };
  for (const k of Object.keys(patch)) {
    const v: any = (patch as any)[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = deepMerge(out[k] ?? {}, v);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

const runtimeConfigSlice = createSlice({
  name: "runtimeConfig",
  initialState,
  reducers: {
    hydrateRuntimeConfig(
      state,
      action: PayloadAction<Partial<RuntimeConfigState>>,
    ) {
      const merged = deepMerge(state as any, action.payload as any);
      Object.assign(state, merged);
    },

    setLocale(state, action: PayloadAction<string>) {
      state.locale = action.payload;
      // if you want currency locale tied to locale:
      state.currency.locale = action.payload;
    },

    setCurrency(state, action: PayloadAction<Partial<CurrencyConfig>>) {
      state.currency = { ...state.currency, ...action.payload };
    },

    setFeatureFlag(
      state,
      action: PayloadAction<{
        key: keyof RuntimeConfigState["features"];
        value: RuntimeConfigState["features"][keyof RuntimeConfigState["features"]];
      }>,
    ) {
      const { key, value } = action.payload;
      (state.features as Record<string, any>)[key] = value;
    },

    setQuickViewVariant(state, action: PayloadAction<QuickViewVariant>) {
      state.features.quickViewVariant = action.payload;
    },
  },
});

export const {
  hydrateRuntimeConfig,
  setLocale,
  setCurrency,
  setFeatureFlag,
  setQuickViewVariant,
} = runtimeConfigSlice.actions;

export default runtimeConfigSlice.reducer;

// selectors
export const selectRuntimeConfig = (s: RootState) => s.runtimeConfig;
export const selectCurrency = (s: RootState) => s.runtimeConfig.currency;
export const selectLocale = (s: RootState) => s.runtimeConfig.locale;
export const selectQuickView = (s: RootState) => s.runtimeConfig.features;
