export type SeoConfigV1 = {
  title?: string; // default site title (home)
  description?: string;
  keywords?: string[];

  siteName?: string;
  canonicalBaseUrl?: string; // e.g. "https://lsahome.co"

  favicon?: {
    ico?: string; // legacy
    png?: string; // modern
    svg?: string; // preferred
    appleTouch?: string;
  };

  ogImage?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };

  twitterHandle?: string; // e.g. "@lsahome"
  noindex?: boolean;
};
