import { CtaConfig, ImageLink } from "../../image-types";

export type BulletItemV1 =
  | string
  | {
      text: string;
      icon?: string; // icon key, e.g. "check", "bolt", "factory"
    };

export type HomeSectionV1 =
  | TopCategoriesSectionV1
  | ShopCollectionSectionV1
  | ProductCategoryGridSectionV1
  | FeatureShowcaseSectionV1
  | BrandCarouselSectionV1
  | LatestProductsSectionV1
  | TestimonialsSectionV1
  | HappyCustomersSectionV1
  | FeaturedProductSectionV1;

export type TopCategoriesSectionV1 = {
  type: "topCategories";

  title?: string;
  subtitle?: string;

  categories: [ImageLink, ImageLink, ImageLink, ImageLink, ImageLink]; // exactly 5
};

export type ShopCollectionSectionV1 = {
  type: "shopCollection";

  image: {
    src: string;
    alt?: string;
  };

  content: {
    title: string;
    description?: string;
    cta?: CtaConfig;
  };

  layout?: {
    imagePosition?: "left" | "right"; // default: left
    containerClassName?: string;
  };
};

export type ProductCategoryGridSectionV1 = {
  type: "productCategoryGrid";
  enabled?: boolean; // default true
  title?: string;
  subtitle?: string;
  items: ImageLink[];

  layout?: {
    columns?: 3;
    pattern?: Array<"short" | "tall" | "taller">;
    gapClassName?: string;
  };
};

export type FeatureShowcaseSectionV1 = {
  type: "featureShowcase";
  enabled?: boolean;

  image: {
    src: string;
    alt?: string;
  };

  overlay?: {
    className?: string; // e.g. "bg-black/40"
  };

  content: {
    title: string;
    subtitle?: string;
    bullets?: BulletItemV1[];
    paragraphs?: string[];
    cta?: CtaConfig;
  };

  layout?: {
    heightClass?: string;
    align?: "left" | "center";
    imagePosition?: "left" | "right";
  };

  background?: {
    className?: string; // e.g. "bg-muted", "bg-background", "bg-black text-white"
  };
};

export type FeaturedProductSectionV1 = {
  type: "featuredProduct";
  enabled?: boolean; // default true

  title?: string;
  subtitle?: string;

  slug: string; // ✅ REQUIRED

  layout?: {
    imagePosition?: "left" | "right";
    sectionClassName?: string; // e.g. "w-[95%] mx-auto py-12"
  };
};

export type BrandCarouselSectionV1 = {
  type: "brandCarousel";

  title?: string;
  subtitle?: string;

  brands: {
    src: string;
    alt?: string;
    href?: string; // optional link to brand
  }[];

  carousel?: {
    autoplay?: boolean;
    intervalMs?: number;
    loop?: boolean;
    pauseOnHover?: boolean;
  };
};

export type LatestProductsSectionV1 = {
  type: "latestProducts";
  enabled?: boolean; // default true
  title?: string;
  subtitle?: string;
  categoryId?: string;
  limit?: number;
};

export type TestimonialItemV1 = {
  name: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  role?: string; // e.g. "Interior Designer", "Hotel Owner"
};

export type TestimonialsSectionV1 = {
  type: "testimonials";
  enabled?: boolean;

  title: string;
  subtitle?: string;

  items: TestimonialItemV1[];

  layout?: {
    columns?: 1 | 2 | 3; // default: 2
  };
};

// config/types/pages/home-sections.types.ts

export type PlatformRatingV1 = {
  label: string; // e.g. "Trustpilot"
  value: string; // e.g. "4.6 / 5"
  iconSrc?: string; // optional logo
};

export type TestimonialSlideV1 = {
  quote: string;
  name: string;
  role?: string;
  avatar: {
    src: string;
    alt?: string;
  };
};

export type HappyCustomersSectionV1 = {
  type: "happyCustomers";
  enabled?: boolean;

  title: string;
  subtitle?: string;

  platformRatings?: PlatformRatingV1[]; // row of rating badges
  slides: [
    TestimonialSlideV1,
    TestimonialSlideV1,
    TestimonialSlideV1,
    TestimonialSlideV1
  ]; // exactly 4

  autoplay?: {
    enabled?: boolean; // default true
    intervalMs?: number; // default 6000
  };

  decorations?: {
    enabled?: boolean; // default true
  };
};
