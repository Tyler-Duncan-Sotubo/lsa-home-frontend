export function getBaseUrl() {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) return "";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}
