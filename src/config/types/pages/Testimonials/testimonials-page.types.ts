import { PageSeoConfigV1 } from "../../seo-page.types";
import { TestimonialsPageSectionV1 } from "./testimonials-sections.types";

export type TestimonialsPageConfigV1 = {
  version: 1;
  seo?: PageSeoConfigV1;
  sections: TestimonialsPageSectionV1[];
};
