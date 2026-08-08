/**
 * Venam theme — scaffold.
 *
 * Every slot currently re-exports the modave implementation so a store on
 * the 'venam' theme renders correctly from day one. Replace slots with
 * real Venam components as they're built:
 *
 *   1. Create the component under src/themes/venam/<area>/...
 *   2. Point the export below at it (drop the modave re-export)
 *   3. For product visuals, also add a 'venam' entry to the matching
 *      facade map in src/features/Products/ui/* (until then, the facades'
 *      fallback renders modave's product components)
 *
 * The 'venam' key must stay in sync with the storefront_themes.key row.
 */
import type { ThemeComponents } from "../registry";
import {
  SiteHeaderSwitch,
  SiteFooterSwitch,
} from "../modave/layout/site-chrome";
import { Hero } from "../modave/home/blocks/hero/hero";
import { HomeSections } from "../modave/home/blocks/home-sections";
import { ContactSectionCompact } from "@/features/Contact/blocks/contact-form/contact-compact/contact-compact";

export const venam: ThemeComponents = {
  key: "venam",
  SiteHeaderSwitch,
  SiteFooterSwitch,
  Hero,
  HomeSections,
  HomeContactSection: ContactSectionCompact,
};
