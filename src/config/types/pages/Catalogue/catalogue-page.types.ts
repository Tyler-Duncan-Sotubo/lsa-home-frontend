import { SeoConfigV1 } from "../../seo.types";
import { CtaConfig } from "../../image-types";
import { HeroCardSectionV1 } from "../common/hero-section.type";
import { SplitSectionV1 } from "../common/split-section.type";

export type CatalogueListSectionV1 = {
  type: "catalogueList";
  enabled?: boolean;

  title?: string;
  subtitle?: string;

  items: {
    title: string;
    description?: string;
    href?: string;
    cta?: CtaConfig;
  }[];

  layout?: {
    columns?: 1 | 2 | 3; // default 1/2
    gapClassName?: string; // "gap-6"
    containerClassName?: string;
    itemClassName?: string;
  };
};

export type CatalogueSectionV1 =
  | HeroCardSectionV1
  | CatalogueListSectionV1
  | SplitSectionV1;

export type CataloguePageConfigV1 = {
  version: 1;
  seo?: SeoConfigV1;
  sections?: CatalogueSectionV1[];
};
