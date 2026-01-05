import { PageSeoConfigV1 } from "../../seo-page.types";

/**
 * Blog page config (v1)
 */
export type BlogPageConfigV1 = {
  version: 1;
  listVariant: "V1" | "V2";
  post?: BlogPostPageConfigV1;
  seo?: PageSeoConfigV1;
  sections: BlogSectionV1[];
};

/**
 * All possible blog sections
 */
export type BlogSectionV1 = BlogListSectionGridV1 | BlogListSectionFeaturedV1;

/**
 * Shared base for blog list sections
 */
type BlogListSectionBaseV1 = {
  type: "blog-list";
  title?: string;
  description?: string;
};

/**
 * Layout variant 1: Grid layout
 */
export type BlogListSectionGridV1 = BlogListSectionBaseV1 & {
  variant: "grid";
  columns?: 2 | 3 | 4;
  showExcerpt?: boolean;
};

/**
 * Layout variant 2: Featured / editorial layout
 */
export type BlogListSectionFeaturedV1 = BlogListSectionBaseV1 & {
  variant: "featured";
  featuredCount?: number;
  showHeroPost?: boolean;
};

// Blog post page config (v1)

export type BlogPostPageConfigV1 = {
  version: 1;
  variant: "V1" | "V2" | "V3";
  ui?: {
    showShare?: boolean;
    showCoverImage?: boolean;
  };
};
