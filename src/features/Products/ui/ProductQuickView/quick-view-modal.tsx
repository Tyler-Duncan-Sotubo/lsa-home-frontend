"use client";

// Theme-dispatching facade — see ../ProductRail/product-rail.tsx for the pattern.
import * as React from "react";
import { useThemeKey } from "@/themes/use-theme-key";
import { QuickViewDialog as ModaveQuickViewDialog } from "@/themes/modave/product/ProductQuickView/quick-view-modal";

const BY_THEME: Record<
  string,
  React.ComponentType<React.ComponentProps<typeof ModaveQuickViewDialog>>
> = {
  modave: ModaveQuickViewDialog,
};

export function QuickViewDialog(
  props: React.ComponentProps<typeof ModaveQuickViewDialog>,
) {
  const key = useThemeKey();
  const Impl = BY_THEME[key] ?? BY_THEME.modave;
  return <Impl {...props} />;
}
