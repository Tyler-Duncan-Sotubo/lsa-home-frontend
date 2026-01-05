/**
 * THEME CONFIG — v1 (refined)
 * Token-only, dark-mode aware, shadcn-compatible
 */

export type ThemeConfigV1 = {
  /* ---------------------------------- */
  /* Assets                              */
  /* ---------------------------------- */

  assets?: {
    logoUrl?: string;
    faviconUrl?: string;
  };

  /* ---------------------------------- */
  /* Color mode                          */
  /* ---------------------------------- */

  mode?: {
    default: "light" | "dark";
    strategy: "class" | "media";
    darkClass?: string; // default: "dark"
  };

  /* ---------------------------------- */
  /* Colors                              */
  /* ---------------------------------- */

  colors?: {
    light: BrandColors;
    dark?: Partial<BrandColors>; // fallback to light when missing
  };

  /* ---------------------------------- */
  /* Fonts / Typography                 */
  /* ---------------------------------- */

  fonts?: {
    sans?: string; // body text
    heading?: string; // headings
    mono?: string; // code / monospace
  };

  /* ---------------------------------- */
  /* Radius                              */
  /* ---------------------------------- */

  radius?: {
    base?: string; // maps to --radius
  };

  /* ---------------------------------- */
  /* Small component-level knobs         */
  /* ---------------------------------- */

  components?: {
    button?: {
      radius?: RadiusToken;
    };
    card?: {
      radius?: RadiusToken;
    };
  };
};

/* ========================================================= */
/* Supporting types                                          */
/* ========================================================= */

export type BrandColors = {
  background: string;
  foreground: string;

  primary: string;
  primaryForeground: string;

  secondary: string;
  secondaryForeground: string;
};

export type RadiusToken =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "pill"
  | { value: string };
