"use client";

/**
 * Theme-dispatching facade — external consumers (shop, collections,
 * search, cart) keep importing this path; the active theme (from the
 * hydrated runtime config) decides which implementation renders. Theme
 * implementations live under src/themes/<key>/product and must NOT import
 * this facade (import theme-local components directly instead).
 */
import * as React from "react";
import { useThemeKey } from "@/themes/use-theme-key";
import { ProductRail as ModaveProductRail } from "@/themes/modave/product/ProductRail/product-rail";

const BY_THEME: Record<
  string,
  React.ComponentType<React.ComponentProps<typeof ModaveProductRail>>
> = {
  modave: ModaveProductRail,
};

export function ProductRail(
  props: React.ComponentProps<typeof ModaveProductRail>,
) {
  const key = useThemeKey();
  const Impl = BY_THEME[key] ?? BY_THEME.modave;
  return <Impl {...props} />;
}
