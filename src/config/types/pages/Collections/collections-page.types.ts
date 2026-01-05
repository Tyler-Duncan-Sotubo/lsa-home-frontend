// src/config/types/pages/Collections/collections-page.types.ts
import { PageSeoConfigV1 } from "@/config/types/seo-page.types";

export type CollectionsPageConfigV1 = {
  version: 1;

  seo?: PageSeoConfigV1 & {
    collections?: Record<string, CollectionSeoConfig>;
  };

  defaults?: {
    description?: string;
    afterContentHtml?: string;
    templates?: {
      descriptions?: Record<string, string>;
      afterContentHtml?: Record<string, string>;
    };
  };
  bySlug?: Record<
    string,
    {
      description?: string; // can be plain or {{templates.descriptions.sleep}}
      afterContentHtml?: string; // can be plain or {{templates.afterContentHtml.sleep}}
    }
  >;
  exploreMore?: ExploreMoreBlockV1;
  ui?: {
    afterContentExpandable?: boolean;
    afterContentCollapsedHeightPx?: number;
    exploreMoreColumns?: 2 | 3;
  };
};

export type CollectionSeoConfig = {
  meta_title?: string;
  meta_description?: string;
  og_image?: {
    url: string;
    alt?: string;
  };
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
};

export type ExploreMoreItemV1 = {
  title: string;
  href: string; // where the button goes (collection page)
  buttonLabel?: string; // defaults to "Shop now" or similar

  image?: {
    url: string;
    alt?: string;
  };

  // optional flags for future flexibility
  badge?: string; // e.g. "Best seller"
  newTab?: boolean;
};

export type ExploreMoreBlockV1 = {
  enabled: boolean;
  heading?: string; // e.g. "Explore more"
  items: ExploreMoreItemV1[]; // cards
};
