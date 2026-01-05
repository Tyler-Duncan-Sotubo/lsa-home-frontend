import { CtaConfig } from "../../image-types";

/** Common alignment for text blocks */
export type TextAlign = "left" | "center" | "right";

/** 1) Hero-like section with centered/left/right text */
export type AboutHeroSectionV1 = {
  type: "aboutHero";
  enabled?: boolean;

  background?: {
    /** solid bg like "bg-muted" or "bg-background" or "bg-black text-white" */
    className?: string;
    /** optional background image */
    image?: {
      src: string;
      alt?: string;
      overlayClassName?: string; // e.g. "bg-black/50"
    };
  };

  content: {
    eyebrow?: string;
    title: string;
    description?: string;
    cta?: CtaConfig;
  };

  layout?: {
    align?: TextAlign; // default center
    heightClass?: string; // e.g. "min-h-[50svh]" or "py-16"
    containerClassName?: string; // e.g. "w-[95%] mx-auto"
    maxWidthClassName?: string; // e.g. "max-w-3xl"
    size?: "sm" | "md" | "lg";
    textAlign?: TextAlign;
  };
};

/** 2) Simple split section: text left, image right (or swapped) */
export type AboutSplitSectionV1 = {
  type: "aboutSplit";
  enabled?: boolean;

  image: {
    src: string;
    alt?: string;
  };

  content: {
    title: string;
    subtitle?: string;
    paragraphs?: string[];
    bullets?: string[];
    cta?: CtaConfig;
  };

  layout?: {
    imagePosition?: "left" | "right"; // default right (as you requested)
    align?: "left" | "center"; // default left
    heightClass?: string; // optional
    backgroundClassName?: string; // e.g. "bg-muted"
  };

  overlay?: {
    className?: string; // image overlay if needed e.g. "bg-black/20"
  };
};

/** 3) Mission / Vision / Goal (world-class section) */
export type AboutValuesSectionV1 = {
  type: "aboutValues";
  enabled?: boolean;

  title?: string; // e.g. "Our Purpose"
  subtitle?: string;

  items: [
    {
      key: "mission" | "vision" | "goal";
      title: string;
      description: string;
      icon?: string; // optional icon key if you want later
    },
    {
      key: "mission" | "vision" | "goal";
      title: string;
      description: string;
      icon?: string;
    },
    {
      key: "mission" | "vision" | "goal";
      title: string;
      description: string;
      icon?: string;
    }
  ]; // exactly 3

  layout?: {
    backgroundClassName?: string; // e.g. "bg-background"
    columns?: 1 | 2 | 3; // default 3 on desktop
  };
};

/** 4) Supplies section: text + horizontally scrollable images */
export type AboutSuppliesScrollerSectionV1 = {
  type: "aboutSuppliesScroller";
  enabled?: boolean;

  content: {
    title: string;
    subtitle?: string;

    /** supports top + bottom copy */
    paragraphs?: string[];

    cta?: CtaConfig;
  };

  /** Cards/images that scroll horizontally */
  items: {
    src: string;
    alt?: string;
    title?: string;
    href?: string;
  }[];

  layout?: {
    backgroundClassName?: string; // e.g. "bg-muted"
    cardWidthClassName?: string; // e.g. "w-[260px] md:w-[340px]"
    gapClassName?: string; // e.g. "gap-4"
    containerClassName?: string; // e.g. "w-[95%] mx-auto max-w-7xl"
  };

  /** ✅ NEW: choose how it scrolls */
  carousel?: {
    variant?: "marquee" | "snap"; // marquee = BrandCarousel style, snap = scroll-snap/manual
    autoplay?: boolean; // marquee uses this; snap can ignore
    intervalMs?: number; // marquee speed input
    pauseOnHover?: boolean; // marquee
    loop?: boolean; // marquee duplicates track
  };
};

export type StatAnimationV1 =
  | {
      type: "countUp";
      to: number;
      suffix?: string; // "+", "%", etc.
      durationMs?: number; // optional, default in component
    }
  | {
      type: "circle";
      to: number; // 0-100
      suffix?: string; // "%"
      durationMs?: number;
    };

export type AboutStatsSplitSectionV1 = {
  type: "aboutStatsSplit";
  enabled?: boolean;

  content: {
    title: string;
    description?: string;
    highlights?: string[];
  };

  stats: [
    { label: string; value: string; animate?: StatAnimationV1 },
    { label: string; value: string; animate?: StatAnimationV1 },
    { label: string; value: string; animate?: StatAnimationV1 }
  ];

  image: {
    src: string;
    alt?: string;
  };

  layout?: {
    imagePosition?: "left" | "right";
    backgroundClassName?: string;
    heightClass?: string;
  };

  overlay?: { className?: string };

  cta?: CtaConfig;
};

export type BrandGridSectionV1 = {
  type: "brandGrid";
  enabled?: boolean;

  title?: string;
  subtitle?: string;

  brands: {
    src: string;
    alt?: string;
    href?: string;
  }[];

  layout?: {
    backgroundClassName?: string; // e.g. "bg-muted"
    containerClassName?: string; // e.g. "w-[95%] mx-auto max-w-7xl"
    gapClassName?: string; // e.g. "gap-6 md:gap-10"
    itemClassName?: string; // e.g. "h-12 md:h-16 w-28 md:w-40"
  };
};

export type AboutSectionV1 =
  | AboutHeroSectionV1
  | AboutSplitSectionV1
  | AboutValuesSectionV1
  | AboutSuppliesScrollerSectionV1
  | AboutStatsSplitSectionV1
  | BrandGridSectionV1;
