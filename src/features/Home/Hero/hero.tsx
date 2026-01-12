// src/features/Hero/hero.tsx (wherever your Hero wrapper lives)
import { HeroConfigV1 } from "@/config/types/pages/Hero/hero.types";
import { HeroOne } from "./hero-one";
import { HeroTwo } from "./hero-two";
import { HeroThree } from "./hero-three";

export function Hero({ hero }: { hero?: HeroConfigV1 }) {
  if (!hero || hero.enabled === false) return null;

  switch (hero.variant) {
    case "V1":
      return <HeroOne config={hero} />;
    case "V2":
      return <HeroTwo config={hero} />;
    case "V3":
      return <HeroThree config={hero} />;
    default:
      return null;
  }
}
