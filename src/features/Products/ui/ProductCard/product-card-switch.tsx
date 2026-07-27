"use client";

// Theme-dispatching facade — see ../ProductRail/product-rail.tsx for the pattern.
import * as React from "react";
import { useThemeKey } from "@/themes/use-theme-key";
import { ProductCardSwitch as ModaveProductCardSwitch } from "@/themes/modave/product/ProductCard/product-card-switch";

const BY_THEME: Record<
  string,
  React.ComponentType<React.ComponentProps<typeof ModaveProductCardSwitch>>
> = {
  modave: ModaveProductCardSwitch,
};

export function ProductCardSwitch(
  props: React.ComponentProps<typeof ModaveProductCardSwitch>,
) {
  const key = useThemeKey();
  const Impl = BY_THEME[key] ?? BY_THEME.modave;
  return <Impl {...props} />;
}
