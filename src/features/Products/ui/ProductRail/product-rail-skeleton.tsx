"use client";

// Theme-dispatching facade — see ./product-rail.tsx for the pattern.
import * as React from "react";
import { useThemeKey } from "@/themes/use-theme-key";
import { ProductRailSkeleton as ModaveProductRailSkeleton } from "@/themes/modave/product/ProductRail/product-rail-skeleton";

const BY_THEME: Record<
  string,
  React.ComponentType<React.ComponentProps<typeof ModaveProductRailSkeleton>>
> = {
  modave: ModaveProductRailSkeleton,
};

export function ProductRailSkeleton(
  props: React.ComponentProps<typeof ModaveProductRailSkeleton>,
) {
  const key = useThemeKey();
  const Impl = BY_THEME[key] ?? BY_THEME.modave;
  return <Impl {...props} />;
}
