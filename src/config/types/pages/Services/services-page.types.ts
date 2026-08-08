import { PageSeoConfigV1 } from "../../seo-page.types";
import { ServicesPageSectionV1 } from "./services-sections.types";

export type ServicesPageConfigV1 = {
  version: 1;
  seo?: PageSeoConfigV1;
  sections: ServicesPageSectionV1[];
};
