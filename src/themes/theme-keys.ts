// Pure constants — safe to import from BOTH server and client modules.
// Never import components here: the client-side useThemeKey hook depends
// on this file, so anything imported here ends up in every client bundle
// (and a server-only import here breaks the build).
export const DEFAULT_THEME_KEY = "modave";
