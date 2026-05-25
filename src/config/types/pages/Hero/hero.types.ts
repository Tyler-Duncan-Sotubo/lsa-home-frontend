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
  | (HeroBaseConfigV1 & HeroThreeConfigV1)
  | (HeroBaseConfigV1 & HeroFourConfigV1);

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

export type HeroFourConfigV1 = {
  variant: "V4";

  /**
   * Two-panel hero: large portrait image on one side, content on the other.
   * Perfect for bridal — the image takes up significant real estate and is
   * never obscured by an overlay.
   */

  image: {
    src: string;
    alt?: string;
    /**
     * Which side the image sits on.
     * Default: "right"
     */
    position?: "left" | "right";
    /**
     * Optional secondary accent image — small overlapping portrait,
     * e.g. a close-up detail shot layered over the main image.
     */
    accent?: {
      src: string;
      alt?: string;
    };
  };

  content: {
    eyebrow?: string; // e.g. "Luxury Bridal Makeup"
    heading: string; // e.g. "Your Most Beautiful Day Begins Here"
    description?: string;
    cta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
    /**
     * Small trust/credential line beneath the CTAs.
     * e.g. "Now booking 2025 & 2026 · London & Croydon"
     */
    tagline?: string;
  };

  /**
   * Optional decorative badge overlaid on the image panel.
   * e.g. a circular rotating text badge or award stamp.
   */
  badge?: {
    text: string; // e.g. "Award Winning · Bridal Specialist ·"
    subtext?: string; // e.g. "Est. 2014"
  };

  bottomStrip?: {
    enabled?: boolean;
    text: string;
    className?: string;
  };

  layout?: {
    heightClass?: string; // default "min-h-[85svh]"
    contentAlign?: "top" | "center" | "bottom"; // default "center"
    /**
     * Background color/class for the content panel.
     * Default: "bg-background"
     */
    contentPanelClassName?: string;
    /**
     * Split ratio. Default: "55/45" (image slightly dominant).
     */
    split?: "50/50" | "55/45" | "60/40" | "65/35";
  };
};
