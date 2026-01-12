type HeroBaseConfigV1 = {
  /**
   * Enables/disables the entire hero section.
   * Default: true (if omitted)
   */
  enabled?: boolean;
};

export type HeroConfigV1 =
  | (HeroBaseConfigV1 & HeroOneConfigV1)
  | (HeroBaseConfigV1 & HeroTwoConfigV1)
  | (HeroBaseConfigV1 & HeroThreeConfigV1);

export type HeroOneConfigV1 = {
  variant: "V1";
  video: {
    src: string;
    type?: string; // default "video/mp4"
    poster?: string;
  };
  overlay?: {
    className?: string; // e.g. "bg-black/40"
  };
  content: {
    heading: string;
    description?: string;
    cta?: { label: string; href: string };
  };
  layout?: {
    heightClass?: string; // default "h-[70vh] md:h-[85vh]"
    contentClassName?: string; // optional override
  };
};

export type HeroTwoConfigV1 = {
  variant: "V2";
  image: {
    src: string;
    alt?: string;
  };
  overlay?: {
    className?: string; // e.g. "bg-black/30"
  };
  content: {
    eyebrow?: string; // optional h3
    heading: string; // h1
    description?: string;
    cta?: { label: string; href: string };
  };
  bottomStrip?: {
    enabled?: boolean; // default true
    text: string;
    className?: string; // default "bg-primary text-primary-foreground"
  };
  layout?: {
    heightClass?: string; // default "h-[70vh] md:h-[85vh]"
    align?: "center" | "left"; // default "left"
  };
};

export type HeroThreeConfigV1 = {
  variant: "V3";

  slides: {
    image: {
      src: string;
      alt?: string;
    };

    content?: {
      eyebrow?: string;
      heading?: string;
      description?: string;
      cta?: { label: string; href: string };
    };
  }[];

  overlay?: {
    className?: string;
  };

  /**
   * Fallback content (used if slide.content is missing fields)
   */
  content: {
    eyebrow?: string;
    heading: string;
    description?: string;
    cta?: { label: string; href: string };
  };

  autoplay?: {
    enabled?: boolean;
    intervalMs?: number;
  };

  bottomStrip?: {
    enabled?: boolean;
    text: string;
    className?: string;
  };

  layout?: {
    heightClass?: string;
    align?: "center" | "left";
    showArrows?: boolean;
    showDots?: boolean;
  };
};
