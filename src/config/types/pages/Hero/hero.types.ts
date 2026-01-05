export type HeroConfigV1 = HeroOneConfigV1 | HeroTwoConfigV1;

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
