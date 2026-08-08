/**
 * Andrea theme — built for the beauty/makeup industry (first store: Emilia
 * Duncan, a bridal makeup artist).
 *
 * Hero, HomeSections, header (layout/site-header.tsx), and footer
 * (layout/footer.tsx) are all andrea-owned — reusing only fully generic,
 * data-driven pieces from modave (CopyrightBar, SocialIcon, etc.) where
 * there's nothing theme-specific to fork.
 *
 * For product visuals, add an 'andrea' entry to the matching facade map
 * in src/features/Products/ui/* when needed (until then, the facades'
 * fallback renders modave's product components).
 *
 * The 'andrea' key must stay in sync with the storefront_themes.key row.
 */
import type { ThemeComponents } from "../registry";
import { SiteHeaderSwitch, SiteFooterSwitch } from "./layout/site-chrome";
import { Hero } from "./home/blocks/hero/hero";
import { HomeSections } from "./home/blocks/home-sections";
import { ContactSection } from "./home/blocks/contact-section";

export const andrea: ThemeComponents = {
  key: "andrea",
  SiteHeaderSwitch,
  SiteFooterSwitch,
  Hero,
  HomeSections,
  HomeContactSection: ContactSection,
};
