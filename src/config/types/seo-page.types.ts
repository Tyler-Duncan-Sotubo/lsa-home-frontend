export type PageSeoConfigV1 = {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  noindex?: boolean;
};
