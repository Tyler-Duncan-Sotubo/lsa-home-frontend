import type { StorefrontConfigV1 } from "@/config/types/types";
import { SiteHeaderSwitch, SiteFooterSwitch } from "./modave/layout/site-chrome";
import { Hero } from "./modave/home/blocks/hero/hero";
import { HomeSections } from "./modave/home/blocks/home-sections";
import { ContactSectionCompact } from "@/features/Contact/blocks/contact-form/contact-compact/contact-compact";

/**
 * A theme is a named set of top-level visual components rendered over the
 * shared feature layer (data actions, cart/checkout logic, product types —
 * all of which stay in src/features and are theme-agnostic).
 *
 * Adding a theme = new folder under src/themes/<key>/ implementing this
 * contract + one entry in THEMES. The active key comes from the resolved
 * config's meta.themeKey (the storefront_themes.key the store has
 * selected); unknown/missing keys fall back to the default theme so
 * existing stores are never left without a renderer.
 *
 * The contract has two halves:
 * 1. Chrome + homepage (this file): resolved server-side via getTheme(config).
 * 2. Product visuals: dispatched client-side through the facade files at
 *    src/features/Products/ui/* (ProductCard, ProductCardSwitch,
 *    ProductRail, ProductRailSkeleton, QuickViewDialog, ProductPageClient,
 *    BundlePageClient) — each facade holds a per-theme map and picks the
 *    implementation via useThemeKey(). A new theme registers there too.
 *    Theme implementations must never import the facades (cycle) — within
 *    a theme, import theme-local components directly.
 *
 * HomeContactSection is the homepage's "get in touch" block (distinct
 * from the standalone /contact page, which isn't theme-dispatched).
 * Default is the shared ContactSectionCompact (form + side image); a
 * theme can override it with its own layout.
 */
export type ThemeComponents = {
  key: string;
  SiteHeaderSwitch: typeof SiteHeaderSwitch;
  SiteFooterSwitch: typeof SiteFooterSwitch;
  Hero: typeof Hero;
  HomeSections: typeof HomeSections;
  HomeContactSection: typeof ContactSectionCompact;
};

const modave: ThemeComponents = {
  key: "modave",
  SiteHeaderSwitch,
  SiteFooterSwitch,
  Hero,
  HomeSections,
  HomeContactSection: ContactSectionCompact,
};

import { venam } from "./venam";
import { andrea } from "./andrea";

const THEMES: Record<string, ThemeComponents> = {
  modave,
  venam,
  andrea,
};

export { DEFAULT_THEME_KEY } from "./theme-keys";
import { DEFAULT_THEME_KEY } from "./theme-keys";

export function getTheme(config?: StorefrontConfigV1): ThemeComponents {
  const key = config?.meta?.themeKey ?? DEFAULT_THEME_KEY;
  return THEMES[key] ?? THEMES[DEFAULT_THEME_KEY];
}
