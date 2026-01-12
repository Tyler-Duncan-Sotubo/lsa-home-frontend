import "server-only";

export function getStorefrontConfig() {
  // Prefer a server-only env var, fallback to existing for now
  const baseUrl =
    process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!baseUrl) {
    throw new Error("Missing BACKEND_URL (or NEXT_PUBLIC_BACKEND_URL)");
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
  };
}
