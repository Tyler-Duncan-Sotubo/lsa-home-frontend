import { PageSeoConfigV1 } from "../../seo-page.types";

export type AccountRegisterPageConfigV1 = {
  version: 1;
  seo?: PageSeoConfigV1;

  ui: {
    variant: RegisterUiVariantV1;
    content?: RegisterPageContentV1;
  };
};

export type RegisterUiVariantV1 = "V1" | "V2";

export type RegisterPageContentV1 = {
  header?: RegisterHeaderContentV1;
  marketing?: RegisterMarketingContentV1;
};

/** Top-left content (above form) */
export type RegisterHeaderContentV1 = {
  eyebrow?: string;
  heading?: string;
  description?: string;
};

/** Right-side / secondary panel content */
export type RegisterMarketingContentV1 = {
  badge?: string;
  heading?: string;
  description?: string;

  bullets?: Array<{
    title: string;
    description?: string;
  }>;

  footerNote?: string;

  /** Optional media for variants that need it (image/illustration/etc.) */
  media?: {
    image?: {
      src: string;
      alt?: string;
    };
  };
};
