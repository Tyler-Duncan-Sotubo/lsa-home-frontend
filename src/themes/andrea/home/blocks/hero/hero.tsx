import { HeroConfigV1 } from "@/config/types/pages/Hero/hero.types";
import { HeroFour } from "./hero-four";

// andrea only owns V4 (built for Emilia Duncan's bridal/beauty storefront).
// Any other variant falls through to null — andrea stores are expected to
// use V4, not the generic modave hero variants.
export function Hero({ hero }: { hero?: HeroConfigV1 }) {
  if (!hero || hero.enabled === false) return null;

  switch (hero.variant) {
    case "V4":
      return <HeroFour config={hero} />;
    default:
      return null;
  }
}
