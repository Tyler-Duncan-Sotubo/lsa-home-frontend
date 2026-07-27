"use client";

// Theme-dispatching facade — see ../ProductRail/product-rail.tsx for the pattern.
import * as React from "react";
import { useThemeKey } from "@/themes/use-theme-key";
import { ProductCard as ModaveProductCard } from "@/themes/modave/product/ProductCard/product-card";

export type { ProductCardProps } from "@/themes/modave/product/ProductCard/product-card";

const BY_THEME: Record<
  string,
  React.ComponentType<React.ComponentProps<typeof ModaveProductCard>>
> = {
  modave: ModaveProductCard,
};

export function ProductCard(
  props: React.ComponentProps<typeof ModaveProductCard>,
) {
  const key = useThemeKey();
  const Impl = BY_THEME[key] ?? BY_THEME.modave;
  return <Impl {...props} />;
}
