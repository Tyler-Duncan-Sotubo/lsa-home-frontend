"use client";

// Theme-dispatching facade — see ./ProductRail/product-rail.tsx for the pattern.
import * as React from "react";
import { useThemeKey } from "@/themes/use-theme-key";
import { ProductPageClient as ModaveProductPageClient } from "@/themes/modave/product/product-page-client";

const BY_THEME: Record<
  string,
  React.ComponentType<React.ComponentProps<typeof ModaveProductPageClient>>
> = {
  modave: ModaveProductPageClient,
};

export function ProductPageClient(
  props: React.ComponentProps<typeof ModaveProductPageClient>,
) {
  const key = useThemeKey();
  const Impl = BY_THEME[key] ?? BY_THEME.modave;
  return <Impl {...props} />;
}
