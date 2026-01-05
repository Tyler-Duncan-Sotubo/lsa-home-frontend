import { ImageInline } from "./image-types";

export type HeaderConfigV1 = {
  /* Promo / top bar */
  topBar?: {
    enabled: boolean;
    autoplay?: {
      enabled: boolean;
      intervalMs?: number;
    };
    slides: Array<{
      text: string;
      link?: {
        label: string;
        href: string;
      };
    }>;
  };

  /* Main site header / nav */
  nav: {
    /**
     * V1: Centered nav with mega menus (DTC / retail)
     * V2: Simple nav, corporate / B2B
     */
    variant: "V1" | "V2";
    items: NavItem[];
    icons?: {
      search?: boolean;
      account?: boolean;
      wishlist?: boolean;
      cart?: boolean;
      quote?: boolean;
    };

    /**
     * Optional styling overrides for specific nav items
     * (e.g. Sales / Offers)
     */
    specialItems?: Array<{
      matchLabel: string;
      className: string;
    }>;

    mobile?: {
      extraLinks?: Array<{
        label: string;
        href: string;
        icon?: "account" | "wishlist" | "stores";
      }>;
    };
  };
};

export type NavItem =
  | {
      label: string;
      href: string;
      type: "mega";
      sections: NavSection[];
      feature?: NavFeature;
    }
  | {
      label: string;
      href: string;
      type?: undefined;
    };

export type NavSectionItem = {
  label: string;
  href: string;
  badge?: string;
  description?: string;
};

export type NavSection = {
  title: string;
  items: NavSectionItem[];
};

export type NavFeature = {
  label: string;
  href: string;
  image: ImageInline;
  description?: string;
};
