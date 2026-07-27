"use client";

import { useAppSelector } from "@/store/hooks";
import { selectThemeKey } from "@/store/runtimeConfigSlice";
import { DEFAULT_THEME_KEY } from "./theme-keys";

/**
 * Active theme key for CLIENT components (reads the hydrated runtime
 * config). Server components should use getTheme(config) from
 * themes/registry instead. Falls back to the default theme so components
 * rendered before hydration (or on stores without an explicit theme)
 * always resolve.
 */
export function useThemeKey(): string {
  return useAppSelector(selectThemeKey) ?? DEFAULT_THEME_KEY;
}
