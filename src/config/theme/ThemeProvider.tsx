"use client";

import { useEffect } from "react";
import type { ThemeConfigV1 } from "../types/theme-types";
import { applyTheme, setThemeMode } from "./applyTheme";

type Props = {
  theme?: ThemeConfigV1;
};

export function ThemeProvider({ theme }: Props) {
  useEffect(() => {
    if (!theme) return;

    applyTheme(theme);
    setThemeMode(theme, theme.mode?.default ?? "light");
  }, [theme]);

  return null;
}
