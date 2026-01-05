import { ContactSectionV1 } from "../../contact.types";
import { SeoConfigV1 } from "../../seo.types";
import type { HeroConfigV1 } from "../Hero/hero.types";
import { HomeSectionV1 } from "./home-sections.types";

export type HomePageConfigV1 = {
  hero?: HeroConfigV1;
  seo?: SeoConfigV1;
  sections?: HomeSectionV1[];
  contact?: ContactSectionV1;
};
