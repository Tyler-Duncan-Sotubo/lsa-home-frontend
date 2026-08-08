import type { ThemeConfigV1 } from "../types/theme-types";

// Fonts pre-loaded via next/font/google in layout.tsx — never fetch these
// from the CDN even if a store's config happens to name one.
const BUILT_IN_FONTS = new Set(["montserrat", "dosis"]);

// Generic/system family names that never resolve to a Google Font.
const SYSTEM_FONTS = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "georgia",
  "times",
  "times new roman",
  "arial",
  "helvetica",
  "helvetica neue",
  "courier",
  "courier new",
  "menlo",
  "monaco",
  "consolas",
  "segoe ui",
  "roboto",
  "-apple-system",
  "blinkmacsystemfont",
]);

/**
 * Pulls the first (most-specific) family out of a CSS font-family stack
 * like `"Cormorant Garamond, Georgia, ui-serif, serif"` — that's the one
 * a store actually picked; everything after it is a generic/system
 * fallback, never something to fetch from Google Fonts.
 */
function extractGoogleFontFamily(stack?: string): string | null {
  if (!stack) return null;
  const first = stack.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "");
  if (!first) return null;
  const key = first.toLowerCase();
  if (SYSTEM_FONTS.has(key) || BUILT_IN_FONTS.has(key)) return null;
  return first;
}

/**
 * Per-store custom fonts (e.g. Emilia Duncan's "Cormorant Garamond") come
 * from theme.fonts in the store's config, which can name any Google Font
 * at runtime — next/font/google can't do that (it needs the family
 * hardcoded at build time), so this loads it via a standard Google Fonts
 * CDN <link> instead, built server-side so it's present on first paint.
 */
export function GoogleFontsLink({ theme }: { theme?: ThemeConfigV1 }) {
  const families = Array.from(
    new Set(
      [
        extractGoogleFontFamily(theme?.fonts?.sans),
        extractGoogleFontFamily(theme?.fonts?.heading),
      ].filter((f): f is string => !!f),
    ),
  );

  if (families.length === 0) return null;

  const familyParams = families
    .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700`)
    .join("&");

  const href = `https://fonts.googleapis.com/css2?${familyParams}&display=swap`;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href={href} />
    </>
  );
}
