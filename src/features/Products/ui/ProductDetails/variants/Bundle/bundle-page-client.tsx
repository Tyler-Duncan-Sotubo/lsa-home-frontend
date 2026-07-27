"use client";

// Theme-dispatching facade — see ../../../ProductRail/product-rail.tsx for the pattern.
import * as React from "react";
import { useThemeKey } from "@/themes/use-theme-key";
import { BundlePageClient as ModaveBundlePageClient } from "@/themes/modave/product/ProductDetails/variants/Bundle/bundle-page-client";

const BY_THEME: Record<
  string,
  React.ComponentType<React.ComponentProps<typeof ModaveBundlePageClient>>
> = {
  modave: ModaveBundlePageClient,
};

export function BundlePageClient(
  props: React.ComponentProps<typeof ModaveBundlePageClient>,
) {
  const key = useThemeKey();
  const Impl = BY_THEME[key] ?? BY_THEME.modave;
  return <Impl {...props} />;
}
