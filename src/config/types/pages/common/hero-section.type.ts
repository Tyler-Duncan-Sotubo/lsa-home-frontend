import { CtaConfig } from "../../image-types";

export type HeroSectionV1 = {
  type: "Hero";
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

export type TextAlign = "left" | "center" | "right";

export type HeroCardPosition =
  | "bottomLeft"
  | "bottomRight"
  | "centerLeft"
  | "centerRight"
  | "center";

export type HeroCardSectionV1 = {
  type: "heroCard";
  enabled?: boolean;

  background: {
    image: {
      src: string;
      alt?: string;
    };
    overlayClassName?: string; // e.g. "bg-black/40"
  };

  card: {
    eyebrow?: string;
    title: string;
    description?: string;
    cta?: CtaConfig;

    /** default: bg-white/95 */
    className?: string;
  };

  layout?: {
    /** lets Serene vs Greysteed differ */
    heightClass?: string; // e.g. "min-h-[55svh]" or "min-h-[75svh]"
    containerClassName?: string; // default "container mx-auto"
    maxWidthClassName?: string; // default "max-w-2xl"
    textAlign?: TextAlign; // default "left"
    cardPosition?: HeroCardPosition; // default "centerLeft"
    cardPaddingClassName?: string; // default "p-6 md:p-10"
    contentGapClassName?: string; // default "space-y-3"
  };
};
