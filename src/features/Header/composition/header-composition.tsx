"use client";

import { StorefrontConfigV1 } from "@/config/types/types";
import PromoBanner from "../ui/promo-banner";
import { SiteHeader } from "../ui/site-header";

type Props = {
  config: StorefrontConfigV1;
};

export function HeaderComposition({ config }: Props) {
  const topBar = config.header?.topBar;

  return (
    <>
      {topBar?.enabled && (
        <PromoBanner slides={topBar.slides} autoplay={topBar.autoplay} />
      )}

      <header className="sticky top-0 z-40 bg-secondary backdrop-blur 2xl:py-2 shadow-sm text-black">
        <SiteHeader config={config} />
      </header>
    </>
  );
}
