import { HeroSectionV1 } from "../common/hero-section.type";
import { PricingCardsSectionV1 } from "../Home/home-sections.types";

// Generic services/pricing page — Hero + pricing tiers. Reuses the same
// shared Hero and PricingCardsSection components already used on the
// homepage, so no new rendering logic is needed, just a dedicated route.
export type ServicesPageSectionV1 = HeroSectionV1 | PricingCardsSectionV1;
