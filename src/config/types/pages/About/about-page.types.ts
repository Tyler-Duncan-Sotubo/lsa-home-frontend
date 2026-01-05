import { PageSeoConfigV1 } from "../../seo-page.types";
import { AboutSectionV1 } from "./about-sections.types";

export type AboutPageConfigV1 = {
  version: 1;
  seo?: PageSeoConfigV1;
  sections: AboutSectionV1[];
};
