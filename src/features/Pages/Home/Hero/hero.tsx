import { HeroConfigV1 } from "@/config/types/pages/Hero/hero.types";
import { HeroOne } from "./hero-one";
import { HeroTwo } from "./hero-two";

export function Hero({ hero }: { hero?: HeroConfigV1 }) {
  if (!hero) return null;

  switch (hero.variant) {
    case "V1":
      return <HeroOne config={hero} />;
    case "V2":
      return <HeroTwo config={hero} />;
    default:
      return null;
  }
}
