export type ImageInline = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type ImageLink = {
  src: string;
  alt?: string;
  href: string;
};

export type CtaConfig = {
  label: string;
  href: string;
};
