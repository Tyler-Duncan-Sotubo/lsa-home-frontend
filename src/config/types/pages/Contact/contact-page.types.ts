import { PageSeoConfigV1 } from "../../seo-page.types";
import { ContactPageSectionV1 } from "./contact-sections.types";

export type ContactPageConfigV1 = {
  version: 1;
  seo?: PageSeoConfigV1;
  sections: ContactPageSectionV1[];
};
