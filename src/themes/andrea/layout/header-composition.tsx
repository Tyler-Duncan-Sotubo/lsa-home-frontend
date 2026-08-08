"use client";

import { StorefrontConfigV1 } from "@/config/types/types";
import { SiteHeader } from "./site-header";

type Props = {
  config: StorefrontConfigV1;
};

// andrea's header intentionally has no top contact bar — just the main
// row (logo centered, search left, icons right, underlined nav below).
export function HeaderComposition({ config }: Props) {
  return (
    <header className="relative z-40 bg-background text-black pb-2">
      <SiteHeader config={config} />
    </header>
  );
}
