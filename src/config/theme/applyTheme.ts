// storefront-config/runtime/applyTheme.ts

import type {
  BrandColors,
  RadiusToken,
  ThemeConfigV1,
} from "../types/theme-types";

type Mode = "light" | "dark";

export function applyTheme(theme: ThemeConfigV1, mode?: Mode) {
  if (typeof document === "undefined") return;
  if (!theme) return;

  const resolvedMode = resolveMode(theme, mode);

  const light: Partial<BrandColors> = theme.colors?.light ?? {};
  const dark: Partial<BrandColors> = theme.colors?.dark ?? {};
  const tokens: Partial<BrandColors> =
    resolvedMode === "dark" ? { ...light, ...dark } : light;

  const root = document.documentElement;

  setVar(root, "--background", tokens.background);
  setVar(root, "--foreground", tokens.foreground);

  setVar(root, "--primary", tokens.primary);
  setVar(root, "--primary-foreground", tokens.primaryForeground);

  setVar(root, "--secondary", tokens.secondary);
  setVar(root, "--secondary-foreground", tokens.secondaryForeground);

  setVar(root, "--radius", theme.radius?.base);
  const buttonRadius = resolveRadiusToken(theme.components?.button?.radius);
  const cardRadius = resolveRadiusToken(theme.components?.card?.radius);

  setVar(root, "--radius-button", buttonRadius);
  setVar(root, "--radius-card", cardRadius);

  /* ---------------------------------- */
  /* Fonts                              */
  /* ---------------------------------- */

  setVar(root, "--app-font-sans", theme.fonts?.sans);
  setVar(root, "--app-font-heading", theme.fonts?.heading);
  setVar(root, "--app-font-mono", theme.fonts?.mono);
}

/**
 * Optional helper to control the .dark class.
 * Safe to ignore if your app handles this elsewhere.
 */
export function setThemeMode(theme: ThemeConfigV1, mode: Mode) {
  if (typeof document === "undefined") return;

  const strategy = theme.mode?.strategy ?? "class";
  if (strategy !== "class") return;

  const darkClass = theme.mode?.darkClass ?? "dark";
  document.documentElement.classList.toggle(darkClass, mode === "dark");
}

/* -------------------- helpers -------------------- */

function setVar(el: HTMLElement, name: string, value?: string) {
  if (!value) return;
  el.style.setProperty(name, value);
}

function resolveMode(theme: ThemeConfigV1, mode?: Mode): Mode {
  if (mode) return mode;
  return theme.mode?.default ?? "light";
}

/**
 * Maps a RadiusToken to a CSS value string.
 */
function resolveRadiusToken(token?: RadiusToken): string | undefined {
  if (!token) return undefined;

  if (typeof token === "object") return token.value;

  switch (token) {
    case "pill":
      return "999px";
    case "sm":
      return "var(--radius-sm)";
    case "md":
      return "var(--radius-md)";
    case "lg":
      return "var(--radius-lg)";
    case "xl":
      return "var(--radius-xl)";
    default:
      return undefined;
  }
}
