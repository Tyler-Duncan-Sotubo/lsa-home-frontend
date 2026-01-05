import { PageSeoConfigV1 } from "../../seo-page.types";

export type AccountLoginPageConfigV1 = {
  version: 1;
  seo?: PageSeoConfigV1;
  ui: {
    variant: LoginUiVariantV1;
    content?: LoginPageContentV1;
  };
};

export type LoginUiVariantV1 = "V1" | "V2";

export type LoginPageContentV1 = {
  header?: LoginHeaderContentV1;
  marketing?: LoginMarketingContentV1;
};

/**
 * Top-left content (above form)
 */
export type LoginHeaderContentV1 = {
  eyebrow?: string;
  heading?: string;
  description?: string;
};

/**
 * Right-side / secondary panel content
 */
export type LoginMarketingContentV1 = {
  badge?: string;
  heading?: string;
  description?: string;
  bullets?: Array<{
    title: string;
    description?: string;
  }>;
  footerNote?: string;
  media?: {
    image: {
      src: string;
      alt?: string;
    };
  };
};
