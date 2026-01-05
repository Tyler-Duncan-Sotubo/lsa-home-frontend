import { CtaConfig } from "../../image-types";

export type SplitSectionV1 = {
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
